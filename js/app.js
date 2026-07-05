/**
 * app.js — Entry point
 *
 * Boot sequence:
 *  1. Init theme (before paint to avoid flash)
 *  2. Init cursor + progress bar
 *  3. Start loading animation
 *  4. Fetch profile.json → window.PROFILE
 *  5. Load hero component eagerly
 *  6. Render meta, nav brand, footer (always-visible parts)
 *  7. Render hero content + typing effect
 *  8. Wire navbar, mobile menu, scroll spy
 *  9. Init global animations (particles, floating icons)
 * 10. Handle initial URL hash → load that section
 * 11. Finish loading screen
 */

'use strict';

/* window.PROFILE is set here and read by renderer.js and animations.js */
window.PROFILE = null;

document.addEventListener('DOMContentLoaded', async () => {

  /* ── 1. Theme (before first paint) ──────────────────────────────── */
  _initTheme();

  /* ── 2. Global UI chrome ─────────────────────────────────────────── */
  Animations.initCursor();
  Animations.initProgressBar();

  /* ── 3. Loading animation ────────────────────────────────────────── */
  Animations.startLoadingAnimation();

  /* ── 4. Load profile.json ────────────────────────────────────────── */
  try {
    const res = await fetch('data/profile.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _validateProfile(data);
    window.PROFILE = data;
  } catch (err) {
    _handleLoadError(err);
    return;
  }

  /* ── 5. Load hero eagerly ────────────────────────────────────────── */
  await Router.loadHero();

  /* ── 6. Always-visible parts ─────────────────────────────────────── */
  Renderer.renderMeta();
  Renderer.renderNavBrand();
  Renderer.renderFooter();

  /* ── 7. Hero content ─────────────────────────────────────────────── */
  const typingTexts = Renderer.renderSection('hero') || [];
  // renderSection('hero') calls renderHero() which returns typing texts
  // but renderSection doesn't return — call renderHero directly for texts:
  const heroTexts = (PROFILE.personal && PROFILE.personal.typingTexts)
    ? PROFILE.personal.typingTexts
    : [PROFILE.personal?.designation || ''];

  Renderer.renderHeroQuickStats();
  Animations.initTypingEffect(heroTexts);

  /* ── 8. Navigation wiring ────────────────────────────────────────── */
  _initNavbar();
  _initMobileMenu();
  _initBackToTop();
  _initKeyboard();

  Router.initNavLinks();
  Router.initPopState();
  Router.initAnchorLinks();

  /* ── 9. Hero animations ──────────────────────────────────────────── */
  Animations.initParticles();
  Animations.initFloatingIcons();
  Animations.initScrollReveal();

  /* ── 10. Handle URL hash (e.g. page opened as /#publications) ────── */
  Router.handleInitialHash();

  /* ── 11. Finish loading ──────────────────────────────────────────── */
  Animations.finishLoading();
});

/* ============================================================
   THEME
   ============================================================ */

function _initTheme() {
  const saved   = localStorage.getItem('portfolio-theme');
  const def     = (window.PROFILE && window.PROFILE.siteSettings)
    ? window.PROFILE.siteSettings.defaultTheme
    : 'dark';
  document.documentElement.setAttribute('data-theme', saved || def || 'dark');

  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', _toggleTheme);
}

function _toggleTheme() {
  const html    = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
}

/* ============================================================
   NAVBAR
   ============================================================ */

function _initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

function _initMobileMenu() {
  const btn   = document.getElementById('navMenuBtn');
  const links = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */

function _initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   KEYBOARD ACCESSIBILITY
   ============================================================ */

function _initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Enter on gallery items opens lightbox
    if (e.key === 'Enter' && document.activeElement?.classList.contains('gallery-item')) {
      document.activeElement.click();
    }
    // Escape closes modal (modal is in index.html)
    if (e.key === 'Escape') {
      const modal = document.getElementById('projectModal');
      if (modal && !modal.hidden) {
        modal.hidden = true;
        document.body.style.overflow = '';
      }
    }
  });

  // Modal close button
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const modal = document.getElementById('projectModal');
      if (modal) { modal.hidden = true; document.body.style.overflow = ''; }
    });
  }
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.hidden = true; document.body.style.overflow = ''; }
    });
  }
}

/* ============================================================
   PROFILE VALIDATION
   ============================================================ */

function _validateProfile(data) {
  const required = ['personal', 'about', 'education', 'publications', 'skills'];
  const missing  = required.filter(k => !data[k]);
  if (missing.length) {
    console.warn(`[Portfolio] Missing sections in profile.json: ${missing.join(', ')}`);
  }
}

/* ============================================================
   ERROR HANDLER
   ============================================================ */

function _handleLoadError(err) {
  console.error('[Portfolio] Fatal: could not load profile.json:', err);
  const screen = document.getElementById('loadingScreen');
  if (screen) {
    screen.innerHTML = `
      <div class="loading-content">
        <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
        <h2 style="font-family:var(--font-sans);font-size:1.2rem;color:var(--text-primary);margin-bottom:.5rem;">
          Could not load portfolio data
        </h2>
        <p style="color:var(--text-muted);font-size:.9rem;max-width:380px;text-align:center;line-height:1.6;">
          Make sure <code style="background:rgba(99,102,241,.1);padding:.1rem .4rem;border-radius:4px;">data/profile.json</code>
          exists and is valid JSON, then open with <strong>Live Server</strong>.
        </p>
        <p style="color:var(--text-muted);font-size:.78rem;margin-top:.75rem;">${String(err.message)}</p>
      </div>`;
  }
}
