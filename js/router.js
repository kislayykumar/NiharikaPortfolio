/**
 * router.js — Full page-view SPA router
 *
 * Behaviour (like a normal multi-page website):
 *  - Only ONE page is visible at a time.
 *  - Clicking a nav link HIDES the current page and SHOWS the target page.
 *  - Hero ("home") is the default/home page.
 *  - Pages are fetched once and cached — no re-fetch on revisit.
 *  - URL updates to /#pagename on every navigation.
 *  - Browser back/forward works correctly.
 *  - Smooth fade transition between pages.
 */

'use strict';

const Router = (() => {

  /* ── State ──────────────────────────────────────────────────────── */
  const cache           = {};        // name → HTML string, fetched once
  const rendered        = new Set(); // sections already populated by Renderer
  let   currentPage     = 'home';
  let   isTransitioning = false;

  /* ── Constants ──────────────────────────────────────────────────── */
  const HOME_PAGE = 'home';
  const ALL_PAGES = [
    'home', 'about', 'education', 'research', 'experience',
    'publications', 'projects', 'skills', 'achievements',
    'conferences', 'teaching', 'gallery', 'blog', 'contact',
  ];

  /* ── Public: load hero on boot (called from app.js) ─────────────── */
  async function loadHero() {
    const slot = document.getElementById('slot-home');
    if (!slot) return;
    try {
      const res  = await fetch('components/hero.html');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      cache['home']        = html;
      slot.innerHTML       = html;
      slot.dataset.loaded  = 'true';
      rendered.add('home');
    } catch (err) {
      console.error('[Router] Failed to load hero:', err);
    }
  }

  /* ── Public: navigate to a page ─────────────────────────────────── */
  async function navigate(name) {
    if (!name || !ALL_PAGES.includes(name)) name = HOME_PAGE;
    if (name === currentPage || isTransitioning) return;

    isTransitioning = true;

    /* 1. Fetch component HTML if not yet cached */
    if (!cache[name]) {
      _showPageLoader(name);
      try {
        const componentFile = name === HOME_PAGE ? 'hero' : name;
        const res  = await fetch(`components/${componentFile}.html`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        cache[name] = await res.text();
      } catch (err) {
        console.error(`[Router] Failed to load "${name}":`, err);
        _showFetchError(name);
        isTransitioning = false;
        return;
      }
    }

    /* 2. Inject HTML into slot (once) */
    const slot = document.getElementById(`slot-${name}`);
    if (slot && slot.dataset.loaded !== 'true') {
      slot.innerHTML      = cache[name];
      slot.dataset.loaded = 'true';
    }

    /* 3. Render content from profile.json (once per page) */
    if (!rendered.has(name)) {
      if (name === HOME_PAGE) {
        Renderer.renderSection('hero');
        Renderer.renderHeroQuickStats();
        const texts = (PROFILE && PROFILE.personal && PROFILE.personal.typingTexts)
          ? PROFILE.personal.typingTexts
          : [(PROFILE && PROFILE.personal && PROFILE.personal.designation) || ''];
        Animations.initTypingEffect(texts);
        Animations.initParticles();
        Animations.initFloatingIcons();
      } else {
        Renderer.renderSection(name);
      }
      rendered.add(name);
    }

    /* 4. Hide current page, show new page */
    _transitionTo(name);

    /* 5. Update URL + nav highlight */
    _updateURL(name);
    _markNavActive(name);

    currentPage     = name;
    isTransitioning = false;

    /* 6. Instant scroll to top */
    window.scrollTo({ top: 0, behavior: 'instant' });

    /* 7. Section-specific animations after paint */
    requestAnimationFrame(() => {
      Animations.initSectionAnimations(name);
      Animations.initScrollReveal();
    });
  }

  /* ── Page transition ─────────────────────────────────────────────── */
  function _transitionTo(targetName) {
    const currentSlot = document.getElementById(`slot-${currentPage}`);
    const targetSlot  = document.getElementById(`slot-${targetName}`);

    /* Fade-out current page */
    if (currentSlot) {
      currentSlot.classList.add('page-exit');
      setTimeout(() => {
        currentSlot.classList.remove('page-active', 'page-exit');
        currentSlot.classList.add('page-hidden');
      }, 220);
    }

    /* Fade-in target page */
    if (targetSlot) {
      targetSlot.classList.remove('page-hidden', 'page-skeleton');
      targetSlot.classList.add('page-enter');
      void targetSlot.offsetWidth;   // force reflow
      targetSlot.classList.add('page-active');
      setTimeout(() => targetSlot.classList.remove('page-enter'), 350);
    }
  }

  /* ── Skeleton shown while fetching ──────────────────────────────── */
  function _showPageLoader(name) {
    const slot = document.getElementById(`slot-${name}`);
    if (!slot) return;
    slot.innerHTML = `
      <div class="page-loader" role="status" aria-label="Loading page…">
        <div class="page-loader-spinner"></div>
        <p class="page-loader-text">Loading…</p>
      </div>`;
    slot.classList.remove('page-hidden');
    slot.classList.add('page-active', 'page-skeleton');
  }

  function _showFetchError(name) {
    const slot = document.getElementById(`slot-${name}`);
    if (!slot) return;
    slot.innerHTML = `
      <div class="page-error">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <p>Could not load <strong>${name}</strong>.<br>
           Make sure <code>components/${name}.html</code> exists and open with <strong>Live Server</strong>.</p>
      </div>`;
    slot.classList.remove('page-hidden', 'page-skeleton');
    slot.classList.add('page-active');
  }

  /* ── URL management ──────────────────────────────────────────────── */
  function _updateURL(name) {
    const hash = name === HOME_PAGE ? '' : `#${name}`;
    history.pushState({ page: name }, '', hash || window.location.pathname);
  }

  function _markNavActive(name) {
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
      link.classList.toggle('active', link.dataset.section === name);
    });
  }

  /* ── Handle URL hash on initial page load ───────────────────────── */
  function handleInitialHash() {
    const hash = location.hash.slice(1);
    if (hash && ALL_PAGES.includes(hash) && hash !== HOME_PAGE) {
      /* Navigate to the hashed page — home slot is hidden first */
      const homeSlot = document.getElementById('slot-home');
      if (homeSlot) homeSlot.classList.add('page-hidden');
      currentPage = HOME_PAGE; // so transition logic works correctly
      navigate(hash);
    } else {
      /* Default: show home */
      const homeSlot = document.getElementById('slot-home');
      if (homeSlot) {
        homeSlot.classList.remove('page-hidden');
        homeSlot.classList.add('page-active');
      }
      _markNavActive(HOME_PAGE);
    }
  }

  /* ── Wire navbar click events ────────────────────────────────────── */
  function initNavLinks() {
    const navEl = document.getElementById('navLinks');
    if (!navEl) return;

    navEl.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link[data-section]');
      if (!link) return;
      e.preventDefault();
      navigate(link.dataset.section);

      /* Close mobile menu */
      navEl.classList.remove('open');
      const btn = document.getElementById('navMenuBtn');
      if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });

    /* Brand logo → home */
    const brand = document.querySelector('.nav-brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(HOME_PAGE);
      });
    }
  }

  /* ── Browser back / forward ──────────────────────────────────────── */
  function initPopState() {
    window.addEventListener('popstate', (e) => {
      const page = (e.state && e.state.page) || (location.hash.slice(1)) || HOME_PAGE;
      if (ALL_PAGES.includes(page)) navigate(page);
    });
  }

  /* ── Intercept any <a href="#section"> inside rendered pages ─────── */
  function initAnchorLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const name = link.getAttribute('href').slice(1);
      if (ALL_PAGES.includes(name)) {
        e.preventDefault();
        navigate(name);
      }
    });
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  return {
    navigate,
    loadHero,
    handleInitialHash,
    initNavLinks,
    initPopState,
    initAnchorLinks,
    getCurrentPage: () => currentPage,
  };
})();
