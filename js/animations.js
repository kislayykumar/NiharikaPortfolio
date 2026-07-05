/**
 * animations.js — All visual animations and per-section animation initialisation
 * Global animations (cursor, progress bar, particles, typing) run once on boot.
 * initSectionAnimations(name) is called by router after each component loads.
 */

'use strict';

const Animations = (() => {

  /* ── Scroll Reveal ─────────────────────────────────────────────── */

  let revealObserver = null;

  function initScrollReveal() {
    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      .forEach(el => revealObserver.observe(el));
  }

  /* ── Skill Progress Bars ────────────────────────────────────────── */

  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill[data-level]:not([data-animated])');
    if (!bars.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = `${fill.dataset.level}%`;
          fill.dataset.animated = 'true';
          obs.unobserve(fill);
        }
      });
    }, { threshold: 0.2 });

    bars.forEach(bar => obs.observe(bar));
  }

  /* ── Language Bars ──────────────────────────────────────────────── */

  function initLanguageBars() {
    const bars = document.querySelectorAll('.language-bar-fill[data-level]:not([data-animated])');
    if (!bars.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = `${entry.target.dataset.level}%`;
          entry.target.dataset.animated = 'true';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    bars.forEach(bar => obs.observe(bar));
  }

  /* ── Animated Counters ──────────────────────────────────────────── */

  let countersAnimated = false;
  let counterObserver  = null;

  function initAnimatedCounters() {
    countersAnimated = false;           // reset so re-load works
    if (counterObserver) counterObserver.disconnect();

    const statsSection = document.getElementById('statistics');
    if (!statsSection) return;

    counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          document.querySelectorAll('.stat-number[data-target]')
            .forEach(el => animateCounter(el));
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    counterObserver.observe(statsSection);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function update(timestamp) {
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── Custom Cursor ──────────────────────────────────────────────── */

  function initCursor() {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top  = `${mouseY}px`;
    });

    (function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = `${followerX}px`;
      follower.style.top  = `${followerY}px`;
      requestAnimationFrame(animateFollower);
    })();

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity   = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity   = '1';
      follower.style.opacity = '0.6';
    });
  }

  /* ── Page Progress Bar ──────────────────────────────────────────── */

  function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = `${Math.min(pct, 100)}%`;
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: true });
  }

  /* ── Loading Screen ─────────────────────────────────────────────── */

  function startLoadingAnimation() {
    const fill = document.getElementById('loadingFill');
    if (!fill) return;

    document.body.classList.add('loading');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 88) { clearInterval(interval); progress = 88; }
      fill.style.width = `${progress}%`;
    }, 180);
  }

  function finishLoading() {
    const fill   = document.getElementById('loadingFill');
    const screen = document.getElementById('loadingScreen');
    if (!fill || !screen) return;

    fill.style.width = '100%';
    setTimeout(() => {
      screen.classList.add('fade-out');
      document.body.classList.remove('loading');
      setTimeout(() => screen.remove(), 700);
    }, 400);
  }

  /* ── Particle Canvas ────────────────────────────────────────────── */

  function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 10000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const color  = isDark ? '180,180,255' : '99,102,241';

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    new ResizeObserver(() => { resize(); createParticles(); })
      .observe(canvas.parentElement);
  }

  /* ── Floating Research Icons ────────────────────────────────────── */

  function initFloatingIcons() {
    const container = document.getElementById('heroFloatingIcons');
    if (!container) return;

    const icons = [
      'fas fa-dna','fas fa-flask','fas fa-microscope','fas fa-atom',
      'fas fa-vials','fas fa-brain','fas fa-pills','fas fa-cut',
      'fas fa-laptop-code','fas fa-chart-bar','fas fa-dna','fas fa-fire',
    ];

    icons.forEach(icon => {
      const el = document.createElement('i');
      el.className = `floating-icon ${icon}`;
      el.style.cssText = `
        left:${Math.random() * 90 + 5}%;
        top:${Math.random() * 90 + 5}%;
        --float-duration:${10 + Math.random() * 8}s;
        --float-delay:${Math.random() * -12}s;
        font-size:${1.2 + Math.random() * 1.5}rem;
      `;
      el.setAttribute('aria-hidden', 'true');
      container.appendChild(el);
    });
  }

  /* ── Typing Effect ──────────────────────────────────────────────── */

  let typingTimeout = null;

  function initTypingEffect(texts) {
    const el = document.getElementById('heroTyping');
    if (!el || !texts || !texts.length) return;

    if (typingTimeout) clearTimeout(typingTimeout);

    let textIdx = 0, charIdx = 0, isDeleting = false;
    const TYPING_SPEED      = 80;
    const DELETING_SPEED    = 45;
    const PAUSE_AFTER_TYPE  = 2200;
    const PAUSE_AFTER_DEL   = 400;

    function type() {
      const current = texts[textIdx];
      if (!isDeleting) {
        el.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          isDeleting = true;
          typingTimeout = setTimeout(type, PAUSE_AFTER_TYPE);
          return;
        }
      } else {
        el.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % texts.length;
          typingTimeout = setTimeout(type, PAUSE_AFTER_DEL);
          return;
        }
      }
      typingTimeout = setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    }
    type();
  }

  /* ── Lazy Image Loading ─────────────────────────────────────────── */

  function initLazyImages() {
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => obs.observe(img));
  }

  /* ── Per-section dispatcher ─────────────────────────────────────── */

  function initSectionAnimations(name) {
    // Always re-observe newly injected .reveal elements
    initScrollReveal();

    const sectionInits = {
      about:        initAnimatedCounters,
      skills:       () => { initSkillBars(); },
      gallery:      () => { initLazyImages(); },
      teaching:     () => { initLanguageBars(); },
    };

    if (sectionInits[name]) sectionInits[name]();
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  return {
    initScrollReveal,
    initSkillBars,
    initLanguageBars,
    initAnimatedCounters,
    animateCounter,
    initCursor,
    initProgressBar,
    startLoadingAnimation,
    finishLoading,
    initParticles,
    initFloatingIcons,
    initTypingEffect,
    initLazyImages,
    initSectionAnimations,
  };
})();
