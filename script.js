/**
 * Academic Portfolio — script.js
 * ============================================================
 * Dynamically renders every section from data/profile.json.
 * No content is hardcoded — change profile.json to update everything.
 *
 * STRUCTURE:
 *  1.  App Bootstrap & JSON Loader
 *  2.  Meta & SEO
 *  3.  Navigation & Scroll Spy
 *  4.  Theme (Dark/Light) + LocalStorage
 *  5.  Custom Cursor
 *  6.  Progress Bar
 *  7.  Loading Screen
 *  8.  Particle / Canvas Background
 *  9.  Floating Icons
 * 10.  Hero Section
 * 11.  Typing Effect
 * 12.  About Section
 * 13.  Statistics & Animated Counters
 * 14.  Education Timeline
 * 15.  Research Interests
 * 16.  Experience Timeline
 * 17.  Publications (with search + filter)
 * 18.  Projects (with filter + modal)
 * 19.  Skills (progress bars)
 * 20.  Certifications
 * 21.  Awards & Achievements
 * 22.  Patents
 * 23.  Teaching Experience
 * 24.  Conferences & Workshops
 * 25.  Languages
 * 26.  Memberships
 * 27.  Testimonials
 * 28.  Gallery (filter + lazy load + lightbox)
 * 29.  Blog
 * 30.  Contact
 * 31.  Footer
 * 32.  Scroll Reveal (Intersection Observer)
 * 33.  Utility Helpers
 * ============================================================
 */

'use strict';

/* ============================================================
   GLOBALS
   ============================================================ */
let PROFILE = null;       // parsed profile.json
let galleryItems = [];    // for lightbox navigation
let lightboxIndex = 0;
let typingTimeout = null;
let counterObserver = null;
let countersAnimated = false;

/* ============================================================
   1. APP BOOTSTRAP & JSON LOADER
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  initProgressBar();
  startLoadingAnimation();
  loadProfile();
});

async function loadProfile() {
  try {
    const response = await fetch('data/profile.json');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Could not load profile.json`);
    }

    const data = await response.json();
    validateProfile(data);
    PROFILE = data;

    renderAll();
    initApp();

  } catch (err) {
    handleLoadError(err);
  }
}

function validateProfile(data) {
  const required = ['personal', 'about', 'education', 'publications', 'skills'];
  const missing = required.filter(key => !data[key]);
  if (missing.length) {
    console.warn(`[Portfolio] Missing sections in profile.json: ${missing.join(', ')}`);
  }
}

function handleLoadError(err) {
  console.error('[Portfolio] Failed to load profile.json:', err);
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.innerHTML = `
      <div class="loading-content">
        <div style="font-size:3rem;margin-bottom:1rem;color:#f43f5e;">⚠️</div>
        <h2 style="font-family:var(--font-sans);font-size:1.2rem;color:var(--text-primary);margin-bottom:0.5rem;">
          Could not load portfolio data
        </h2>
        <p style="color:var(--text-muted);font-size:0.9rem;max-width:380px;text-align:center;line-height:1.6;">
          Make sure <code style="background:rgba(99,102,241,0.1);padding:0.1rem 0.4rem;border-radius:4px;">data/profile.json</code>
          exists and is valid JSON.<br/>Open with <strong>Live Server</strong>, not by double-clicking the file.
        </p>
        <p style="color:var(--text-muted);font-size:0.78rem;margin-top:0.75rem;">
          ${escapeHtml(err.message)}
        </p>
      </div>
    `;
  }
}

/* Render everything from PROFILE */
function renderAll() {
  renderMeta();
  renderNavBrand();
  renderHero();
  renderAbout();
  renderStatistics();
  renderEducation();
  renderResearchInterests();
  renderExperience();
  renderPublications();
  renderProjects();
  renderSkills();
  renderCertifications();
  renderAwards();
  renderTeaching();
  renderConferences();
  renderLanguages();
  renderMemberships();
  renderTestimonials();
  renderGallery();
  renderBlog();
  renderContact();
  renderFooter();
}

/* Initialize interactive behaviours after render */
function initApp() {
  finishLoading();
  initNavbar();
  initScrollSpy();
  initScrollReveal();
  initAnimatedCounters();
  initParticles();
  initFloatingIcons();
  initTypingEffect();
  initPublicationSearch();
  initProjectFilter();
  initGalleryFilter();
  initGalleryLightbox();
  initProjectModal();
  initMobileMenu();
  initBackToTop();
  initKeyboardNavigation();
  renderHeroQuickStats();
}


/* ============================================================
   2. META & SEO
   ============================================================ */

function renderMeta() {
  const p = PROFILE.personal;
  if (!p) return;

  setTextById('page-title', `${p.name} — Academic Portfolio`);
  setAttr('meta-description', 'content', p.metaDescription || `${p.name} — ${p.designation}`);
  setAttr('meta-keywords', 'content', p.metaKeywords || '');
  setAttr('og-title', 'content', p.name);
  setAttr('og-description', 'content', p.metaDescription || '');
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}


/* ============================================================
   3. NAVIGATION
   ============================================================ */

function renderNavBrand() {
  const p = PROFILE.personal;
  if (!p) return;
  const parts = p.name ? p.name.split(' ') : [];
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (p.name || 'P').slice(0, 2);
  setTextById('navBrand', initials + ' Portfolio');
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    navbar.classList.toggle('scrolled', currentScroll > 20);
    lastScroll = currentScroll;
  }, { passive: true });
}

function initMobileMenu() {
  const btn = document.getElementById('navMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  links.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-68px 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
}


/* ============================================================
   4. THEME
   ============================================================ */

function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const defaultTheme = (PROFILE && PROFILE.siteSettings) ? PROFILE.siteSettings.defaultTheme : 'light';
  const theme = savedTheme || defaultTheme || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
}


/* ============================================================
   5. CUSTOM CURSOR
   ============================================================ */

function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '0.6';
  });
}


/* ============================================================
   6. PROGRESS BAR
   ============================================================ */

function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = `${Math.min(pct, 100)}%`;
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }, { passive: true });
}


/* ============================================================
   7. LOADING SCREEN
   ============================================================ */

function startLoadingAnimation() {
  const fill = document.getElementById('loadingFill');
  if (!fill) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 88) { clearInterval(interval); progress = 88; }
    fill.style.width = `${progress}%`;
  }, 180);

  document.body.classList.add('loading');
}

function finishLoading() {
  const fill = document.getElementById('loadingFill');
  const screen = document.getElementById('loadingScreen');
  if (!fill || !screen) return;

  fill.style.width = '100%';

  setTimeout(() => {
    screen.classList.add('fade-out');
    document.body.classList.remove('loading');
    setTimeout(() => screen.remove(), 700);
  }, 400);
}


/* ============================================================
   8. PARTICLE / CANVAS BACKGROUND
   ============================================================ */

function initParticles() {
  if (PROFILE && PROFILE.siteSettings && PROFILE.siteSettings.particlesEnabled === false) return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = canvas.offsetWidth;
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
    const color = isDark ? '180, 180, 255' : '99, 102, 241';

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    /* Draw lines between nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 120) * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(drawParticles);
  }

  resize();
  createParticles();
  drawParticles();

  const resizeObs = new ResizeObserver(() => {
    resize();
    createParticles();
  });
  resizeObs.observe(canvas.parentElement);
}


/* ============================================================
   9. FLOATING RESEARCH ICONS
   ============================================================ */

function initFloatingIcons() {
  const container = document.getElementById('heroFloatingIcons');
  if (!container) return;

  const icons = [
    'fas fa-dna', 'fas fa-flask', 'fas fa-microscope', 'fas fa-atom',
    'fas fa-vials', 'fas fa-brain', 'fas fa-pills', 'fas fa-cut',
    'fas fa-laptop-code', 'fas fa-chart-bar', 'fas fa-dna', 'fas fa-fire',
  ];

  icons.forEach((icon, i) => {
    const el = document.createElement('i');
    el.className = `floating-icon ${icon}`;
    el.style.cssText = `
      left: ${Math.random() * 90 + 5}%;
      top: ${Math.random() * 90 + 5}%;
      --float-duration: ${10 + Math.random() * 8}s;
      --float-delay: ${Math.random() * -12}s;
      font-size: ${1.2 + Math.random() * 1.5}rem;
    `;
    el.setAttribute('aria-hidden', 'true');
    container.appendChild(el);
  });
}


/* ============================================================
   10. HERO SECTION
   ============================================================ */

function renderHero() {
  const p = PROFILE.personal;
  if (!p) return;

  /* Photo */
  const photo = document.getElementById('heroPhoto');
  if (photo) {
    if (p.profileImage) {
      photo.src = p.profileImage;
      photo.alt = p.profileImageAlt || p.name;
      photo.onerror = () => showPhotoPlaceholder(photo, p.name);
    } else {
      showPhotoPlaceholder(photo, p.name);
    }
  }

  setTextById('heroName', p.name || '');
  setTextById('heroInstitution', `${p.institution || ''}`);
  setTextById('heroDepartment', `${p.department || ''}`);

  /* Research focus chips */
  const focusEl = document.getElementById('heroResearchFocus');
  if (focusEl && p.researchFocus) {
    focusEl.innerHTML = p.researchFocus
      .split('|')
      .map(f => `<span class="focus-chip">${escapeHtml(f.trim())}</span>`)
      .join('');
  }

  /* Buttons */
  const btnsEl = document.getElementById('heroButtons');
  if (btnsEl && p.heroButtons) {
    btnsEl.innerHTML = p.heroButtons.map(btn => {
      let href = '#contact';
      if (btn.action === 'resume' && PROFILE.resume) {
        href = PROFILE.resume.file || '#';
      } else if (btn.action === 'publications') {
        href = '#publications';
      } else if (btn.action === 'contact') {
        href = '#contact';
      }
      const isDownload = btn.action === 'resume' ? 'download' : '';
      return `
        <a href="${href}" class="btn btn-${btn.style || 'primary'}" ${isDownload} aria-label="${escapeHtml(btn.label)}">
          ${btn.icon ? `<i class="${escapeHtml(btn.icon)}" aria-hidden="true"></i>` : ''}
          ${escapeHtml(btn.label)}
        </a>
      `;
    }).join('');
  }
}

function renderHeroQuickStats() {
  const container = document.getElementById('heroQuickStats');
  if (!container || !PROFILE.statistics) return;

  const top3 = PROFILE.statistics.slice(0, 3);
  container.innerHTML = top3.map(s => `
    <div class="quick-stat">
      <span class="quick-stat-number">${s.value}${s.suffix || ''}</span>
      <span class="quick-stat-label">${escapeHtml(s.label)}</span>
    </div>
  `).join('');
}

function showPhotoPlaceholder(img, name) {
  const wrapper = img.parentElement;
  img.style.display = 'none';
  const placeholder = document.createElement('div');
  placeholder.className = 'hero-photo-placeholder';
  placeholder.textContent = getInitials(name || '');
  placeholder.setAttribute('aria-label', `Profile photo placeholder for ${name}`);
  wrapper.insertBefore(placeholder, img);
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}


/* ============================================================
   11. TYPING EFFECT
   ============================================================ */

function initTypingEffect() {
  const el = document.getElementById('heroTyping');
  if (!el || !PROFILE.personal) return;

  const texts = PROFILE.personal.typingTexts || [PROFILE.personal.designation];
  let textIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 45;
  const PAUSE_AFTER_TYPE = 2200;
  const PAUSE_AFTER_DELETE = 400;

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
        typingTimeout = setTimeout(type, PAUSE_AFTER_DELETE);
        return;
      }
    }

    typingTimeout = setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  type();
}


/* ============================================================
   12. ABOUT SECTION
   ============================================================ */

function renderAbout() {
  const a = PROFILE.about;
  if (!a) return;

  const bioEl = document.getElementById('aboutBio');
  if (bioEl) {
    bioEl.innerHTML = (a.biography || '').split('\n\n').map(para =>
      `<p>${escapeHtml(para).replace(/\n/g, '<br/>')}</p>`
    ).join('');
  }

  setTextById('aboutVision', a.researchVision || '');
  setTextById('aboutPhilosophy', a.researchPhilosophy || '');
  setTextById('aboutCurrentWork', a.currentWork || '');

  const objEl = document.getElementById('aboutObjectives');
  if (objEl && a.researchObjectives) {
    objEl.innerHTML = a.researchObjectives.map(obj => `
      <li class="objective-item">${escapeHtml(obj)}</li>
    `).join('');
  }
}


/* ============================================================
   13. STATISTICS & ANIMATED COUNTERS
   ============================================================ */

function renderStatistics() {
  const grid = document.getElementById('statsGrid');
  if (!grid || !PROFILE.statistics) return;

  grid.innerHTML = PROFILE.statistics.map(stat => `
    <div class="stat-card reveal" role="listitem">
      <div class="stat-icon"><i class="${escapeHtml(stat.icon)}" aria-hidden="true"></i></div>
      <div class="stat-number" data-target="${stat.value}" data-suffix="${stat.suffix || ''}">0</div>
      <div class="stat-label">${escapeHtml(stat.label)}</div>
    </div>
  `).join('');
}

function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(counter => animateCounter(counter));
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.getElementById('statistics');
  if (statsSection) counterObserver.observe(statsSection);
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}


/* ============================================================
   14. EDUCATION TIMELINE
   ============================================================ */

function renderEducation() {
  const container = document.getElementById('educationTimeline');
  if (!container || !PROFILE.education) return;

  container.classList.add('stagger-children');

  container.innerHTML = PROFILE.education.map(edu => `
    <div class="timeline-item reveal" role="listitem">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-title">${escapeHtml(edu.degree)}</div>
            <div class="timeline-subtitle">${escapeHtml(edu.field)}</div>
            <div class="timeline-meta">
              <span class="timeline-meta-item">
                <i class="fas fa-university" aria-hidden="true"></i>
                ${escapeHtml(edu.institution)}
              </span>
              <span class="timeline-meta-item">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                ${escapeHtml(edu.location)}
              </span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;flex-shrink:0;">
            <span class="timeline-duration-badge">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              ${escapeHtml(edu.duration)}
            </span>
            <span class="timeline-status-badge ${edu.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">
              ${escapeHtml(edu.status)}
            </span>
          </div>
        </div>

        ${edu.cgpa ? `<div class="timeline-cgpa">📊 CGPA / Score: ${escapeHtml(edu.cgpa)}</div>` : ''}

        ${edu.thesis ? `
          <div class="timeline-description">
            <strong>Thesis:</strong> ${escapeHtml(edu.thesis)}
            ${edu.supervisor ? ` — <em>Supervisor: ${escapeHtml(edu.supervisor)}</em>` : ''}
          </div>
        ` : ''}

        ${edu.achievements && edu.achievements.length ? `
          <div class="timeline-achievements">
            ${edu.achievements.map(a => `<span class="badge">${escapeHtml(a)}</span>`).join('')}
          </div>
        ` : ''}

        ${edu.coursework && edu.coursework.length ? `
          <div class="timeline-tech-list">
            ${edu.coursework.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}


/* ============================================================
   15. RESEARCH INTERESTS
   ============================================================ */

function renderResearchInterests() {
  const grid = document.getElementById('researchGrid');
  if (!grid || !PROFILE.researchInterests) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.researchInterests.map(item => `
    <div class="research-card reveal" role="listitem"
         style="--card-color:${item.color};--card-color-bg:${hexToRgba(item.color, 0.1)};">
      <div class="research-icon">
        <i class="${escapeHtml(item.icon)}" aria-hidden="true"></i>
      </div>
      <div class="research-card-title">${escapeHtml(item.title)}</div>
      <p class="research-card-desc">${escapeHtml(item.description)}</p>
      ${item.keywords ? `
        <div class="research-keywords">
          ${item.keywords.map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}


/* ============================================================
   16. EXPERIENCE TIMELINE
   ============================================================ */

function renderExperience() {
  const container = document.getElementById('experienceTimeline');
  if (!container || !PROFILE.experience) return;

  container.classList.add('stagger-children');

  container.innerHTML = PROFILE.experience.map(exp => `
    <div class="timeline-item reveal" role="listitem">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-title">${escapeHtml(exp.role)}</div>
            <div class="timeline-subtitle">${escapeHtml(exp.institution)}</div>
            <div class="timeline-meta">
              <span class="timeline-meta-item">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                ${escapeHtml(exp.location)}
              </span>
              <span class="timeline-meta-item">
                <span class="badge">${escapeHtml(exp.type)}</span>
              </span>
            </div>
          </div>
          <span class="timeline-duration-badge">
            <i class="fas fa-calendar" aria-hidden="true"></i>
            ${escapeHtml(exp.duration)}
          </span>
        </div>

        <p class="timeline-description">${escapeHtml(exp.description)}</p>

        ${exp.responsibilities && exp.responsibilities.length ? `
          <ul class="timeline-responsibilities">
            ${exp.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        ` : ''}

        ${exp.technologies && exp.technologies.length ? `
          <div class="timeline-tech-list">
            ${exp.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}

        ${exp.achievements && exp.achievements.length ? `
          <div class="timeline-achievements">
            ${exp.achievements.map(a => `<span class="badge">${escapeHtml(a)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}


/* ============================================================
   17. PUBLICATIONS
   ============================================================ */

function renderPublications() {
  const container = document.getElementById('pubList');
  if (!container || !PROFILE.publications) return;

  const filterBtns = document.getElementById('pubFilterBtns');
  const years = [...new Set(PROFILE.publications.map(p => p.year))].sort((a, b) => b - a);

  if (filterBtns) {
    filterBtns.innerHTML = `
      <button class="filter-btn active" data-year="all" aria-pressed="true">All</button>
      ${years.map(y => `
        <button class="filter-btn" data-year="${y}" aria-pressed="false">${y}</button>
      `).join('')}
    `;

    filterBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBtns.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      filterPublications(btn.dataset.year, document.getElementById('pubSearch')?.value || '');
    });
  }

  renderPublicationList(PROFILE.publications);
}

function renderPublicationList(pubs) {
  const container = document.getElementById('pubList');
  const noResults = document.getElementById('pubNoResults');
  if (!container) return;

  if (!pubs.length) {
    container.innerHTML = '';
    if (noResults) noResults.hidden = false;
    return;
  }

  if (noResults) noResults.hidden = true;

  container.innerHTML = pubs.map((pub, idx) => `
    <article class="pub-card ${pub.featured ? 'featured-pub' : ''} reveal" role="listitem" aria-label="${escapeHtml(pub.title)}">
      <div class="pub-number" aria-hidden="true">${String(idx + 1).padStart(2, '0')}</div>
      <div class="pub-content">
        <div class="pub-title">${escapeHtml(pub.title)}</div>
        <div class="pub-authors">${pub.authors ? pub.authors.join(', ') : ''}</div>
        <div class="pub-journal-line">
          <span>${escapeHtml(pub.journal)}</span>
          ${pub.year ? `<span>(${pub.year})</span>` : ''}
          ${pub.volume ? `<span>Vol. ${pub.volume}${pub.issue ? `, No. ${pub.issue}` : ''}</span>` : ''}
          ${pub.pages ? `<span>pp. ${pub.pages}</span>` : ''}
          ${pub.impactFactor ? `<span class="pub-if">IF: ${pub.impactFactor}</span>` : ''}
        </div>
        ${pub.abstract ? `<p class="pub-abstract">${escapeHtml(pub.abstract)}</p>` : ''}
        ${pub.keywords && pub.keywords.length ? `
          <div class="pub-keywords">
            ${pub.keywords.map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="pub-links">
          ${pub.links && pub.links.doi ? `
            <a href="${escapeHtml(pub.links.doi)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i> DOI
            </a>
          ` : ''}
          ${pub.links && pub.links.pdf ? `
            <a href="${escapeHtml(pub.links.pdf)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
              <i class="fas fa-file-pdf" aria-hidden="true"></i> PDF
            </a>
          ` : ''}
          ${pub.links && pub.links.pubmed ? `
            <a href="${escapeHtml(pub.links.pubmed)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
              <i class="fas fa-bookmark" aria-hidden="true"></i> PubMed
            </a>
          ` : ''}
          ${pub.citations ? `
            <span class="pub-citations">
              <i class="fas fa-quote-right" aria-hidden="true"></i>
              ${pub.citations} citations
            </span>
          ` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

function initPublicationSearch() {
  const searchInput = document.getElementById('pubSearch');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const activeYearBtn = document.querySelector('#pubFilterBtns .filter-btn.active');
      const year = activeYearBtn ? activeYearBtn.dataset.year : 'all';
      filterPublications(year, searchInput.value);
    }, 250);
  });
}

function filterPublications(year, query) {
  if (!PROFILE.publications) return;

  const q = query.trim().toLowerCase();

  const filtered = PROFILE.publications.filter(pub => {
    const matchYear = year === 'all' || String(pub.year) === String(year);
    const matchQuery = !q ||
      pub.title.toLowerCase().includes(q) ||
      (pub.authors && pub.authors.join(' ').toLowerCase().includes(q)) ||
      (pub.journal && pub.journal.toLowerCase().includes(q)) ||
      (pub.keywords && pub.keywords.some(k => k.toLowerCase().includes(q)));
    return matchYear && matchQuery;
  });

  renderPublicationList(filtered);
}


/* ============================================================
   18. PROJECTS
   ============================================================ */

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !PROFILE.projects) return;

  const allTags = [...new Set(PROFILE.projects.flatMap(p => p.tags || []))];
  const filterBtns = document.getElementById('projectFilterBtns');

  if (filterBtns) {
    filterBtns.innerHTML = `
      <button class="filter-btn active" data-tag="all" aria-pressed="true">All</button>
      ${allTags.map(tag => `
        <button class="filter-btn" data-tag="${escapeHtml(tag)}" aria-pressed="false">${escapeHtml(tag)}</button>
      `).join('')}
    `;

    filterBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBtns.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      renderProjectCards(btn.dataset.tag);
    });
  }

  renderProjectCards('all');
}

function renderProjectCards(tag) {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !PROFILE.projects) return;

  const filtered = tag === 'all'
    ? PROFILE.projects
    : PROFILE.projects.filter(p => p.tags && p.tags.includes(tag));

  grid.innerHTML = filtered.map(proj => `
    <article class="project-card reveal" role="listitem" data-project-id="${escapeHtml(proj.id)}" aria-label="${escapeHtml(proj.title)}">
      ${proj.image
        ? `<img class="project-card-img" src="${escapeHtml(proj.image)}" alt="${escapeHtml(proj.title)}" loading="lazy" onerror="this.outerHTML='<div class=\\"project-card-img-placeholder\\"><i class=\\"fas fa-microscope\\" aria-hidden=\\"true\\"></i></div>'">`
        : `<div class="project-card-img-placeholder"><i class="fas fa-flask" aria-hidden="true"></i></div>`
      }
      <div class="project-card-body">
        <div class="project-card-header">
          <h3 class="project-card-title">${escapeHtml(proj.title)}</h3>
          <span class="project-status-badge ${proj.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">
            ${escapeHtml(proj.status || 'N/A')}
          </span>
        </div>
        <p class="project-card-desc">${escapeHtml(proj.shortDescription || proj.description)}</p>
        <div class="project-card-tags">
          ${(proj.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="project-card-footer">
          <div class="project-card-links">
            ${proj.links && proj.links.github ? `
              <a href="${escapeHtml(proj.links.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" aria-label="GitHub for ${escapeHtml(proj.title)}">
                <i class="fab fa-github" aria-hidden="true"></i>
              </a>
            ` : ''}
            ${proj.links && proj.links.paper ? `
              <a href="${escapeHtml(proj.links.paper)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" aria-label="Paper for ${escapeHtml(proj.title)}">
                <i class="fas fa-file-alt" aria-hidden="true"></i>
              </a>
            ` : ''}
          </div>
          <button class="btn btn-secondary btn-sm project-read-more"
                  data-project-id="${escapeHtml(proj.id)}"
                  aria-label="Read more about ${escapeHtml(proj.title)}">
            Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalClose');
  if (!modal || !closeBtn) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.project-read-more');
    if (!btn) return;
    const projectId = btn.dataset.projectId;
    const project = PROFILE.projects.find(p => p.id === projectId);
    if (project) openProjectModal(project);
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openProjectModal(proj) {
  const modal = document.getElementById('projectModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    ${proj.image
      ? `<img class="modal-project-img" src="${escapeHtml(proj.image)}" alt="${escapeHtml(proj.title)}" loading="lazy" onerror="this.style.display='none'">`
      : ''
    }
    <div class="modal-project-title">${escapeHtml(proj.title)}</div>

    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
      <span class="project-status-badge ${proj.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">
        ${escapeHtml(proj.status || '')}
      </span>
      ${proj.duration ? `<span class="timeline-duration-badge"><i class="fas fa-calendar" aria-hidden="true"></i> ${escapeHtml(proj.duration)}</span>` : ''}
      ${proj.fundingSource ? `<span class="badge"><i class="fas fa-coins" aria-hidden="true"></i> ${escapeHtml(proj.fundingSource)}</span>` : ''}
    </div>

    <div class="modal-section-label">Description</div>
    <p class="modal-text">${escapeHtml(proj.description)}</p>

    ${proj.methodology ? `
      <div class="modal-section-label">Methodology</div>
      <p class="modal-text">${escapeHtml(proj.methodology)}</p>
    ` : ''}

    ${proj.results ? `
      <div class="modal-section-label">Results & Impact</div>
      <p class="modal-text">${escapeHtml(proj.results)}</p>
    ` : ''}

    ${proj.technologies && proj.technologies.length ? `
      <div class="modal-section-label">Technologies & Tools</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.5rem;">
        ${proj.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    ` : ''}

    ${proj.tags && proj.tags.length ? `
      <div class="modal-section-label">Research Areas</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.5rem;">
        ${proj.tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('')}
      </div>
    ` : ''}

    <div class="modal-links">
      ${proj.links && proj.links.github ? `
        <a href="${escapeHtml(proj.links.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
          <i class="fab fa-github" aria-hidden="true"></i> GitHub
        </a>
      ` : ''}
      ${proj.links && proj.links.demo ? `
        <a href="${escapeHtml(proj.links.demo)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
          <i class="fas fa-play-circle" aria-hidden="true"></i> Demo
        </a>
      ` : ''}
      ${proj.links && proj.links.paper ? `
        <a href="${escapeHtml(proj.links.paper)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
          <i class="fas fa-file-alt" aria-hidden="true"></i> Paper
        </a>
      ` : ''}
    </div>
  `;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
}


/* ============================================================
   19. SKILLS
   ============================================================ */

function renderSkills() {
  renderSkillBars('skillBarsResearch', PROFILE.skills && PROFILE.skills.research);
  renderSkillBars('skillBarsProgramming', PROFILE.skills && PROFILE.skills.programming);
  renderSkillBars('skillBarsBioinformatics', PROFILE.skills && PROFILE.skills.bioinformatics);
  renderSkillBars('skillBarsSoft', PROFILE.skills && PROFILE.skills.soft);
  renderLabSkills();
  renderTechnicalSkills();
}

function renderSkillBars(containerId, skills) {
  const container = document.getElementById(containerId);
  if (!container || !skills) return;

  container.innerHTML = skills.map(skill => `
    <div class="skill-bar-item">
      <div class="skill-bar-header">
        <span class="skill-bar-name">${escapeHtml(skill.name)}</span>
        <span class="skill-bar-pct">${skill.level}%</span>
      </div>
      <div class="skill-bar-track" role="progressbar" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(skill.name)}">
        <div class="skill-bar-fill"
             data-level="${skill.level}"
             style="background: ${skill.color || 'var(--gradient-primary)'};">
        </div>
      </div>
    </div>
  `).join('');
}

function renderLabSkills() {
  const grid = document.getElementById('labSkillsGrid');
  if (!grid || !PROFILE.laboratorySkills) return;

  grid.innerHTML = PROFILE.laboratorySkills.map(s => `
    <div class="lab-skill-badge reveal" role="listitem" title="${escapeHtml(s.category || '')}">
      <i class="${escapeHtml(s.icon)}" aria-hidden="true"></i>
      ${escapeHtml(s.name)}
    </div>
  `).join('');
}

function renderTechnicalSkills() {
  const container = document.getElementById('technicalSkillsList');
  if (!container || !PROFILE.technicalSkills) return;

  container.innerHTML = PROFILE.technicalSkills.map(cat => `
    <div class="tech-skill-category">
      <div class="tech-skill-cat-name">${escapeHtml(cat.category)}</div>
      <div class="tech-skill-items">
        ${cat.items.map(item => `<span class="tech-skill-item">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

/* Animate skill bars on scroll into view */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill[data-level]');
  if (!bars.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        fill.style.width = `${fill.dataset.level}%`;
        obs.unobserve(fill);
      }
    });
  }, { threshold: 0.2 });

  bars.forEach(bar => obs.observe(bar));
}

/* Language bars */
function initLanguageBars() {
  const bars = document.querySelectorAll('.language-bar-fill[data-level]');
  if (!bars.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = `${entry.target.dataset.level}%`;
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  bars.forEach(bar => obs.observe(bar));
}


/* ============================================================
   20. CERTIFICATIONS
   ============================================================ */

function renderCertifications() {
  const grid = document.getElementById('certificationsGrid');
  if (!grid || !PROFILE.certifications) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.certifications.map(cert => `
    <div class="cert-card reveal" role="listitem">
      <div class="cert-icon" style="background:${hexToRgba(cert.color || '#6366f1', 0.12)};color:${cert.color || 'var(--color-primary)'};">
        <i class="${escapeHtml(cert.icon || 'fas fa-certificate')}" aria-hidden="true"></i>
      </div>
      <div class="cert-title">${escapeHtml(cert.title)}</div>
      <div class="cert-provider">${escapeHtml(cert.provider)}</div>
      <div class="cert-date">
        <i class="fas fa-calendar-check" aria-hidden="true"></i>
        ${escapeHtml(cert.date)}
      </div>
      ${cert.credentialId ? `<div class="cert-id">ID: ${escapeHtml(cert.credentialId)}</div>` : ''}
      ${cert.link ? `
        <div class="cert-card-footer">
          <a href="${escapeHtml(cert.link)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" aria-label="View ${escapeHtml(cert.title)} certificate">
            <i class="fas fa-external-link-alt" aria-hidden="true"></i> View Certificate
          </a>
        </div>
      ` : ''}
    </div>
  `).join('');
}


/* ============================================================
   21. AWARDS & ACHIEVEMENTS
   ============================================================ */

function renderAwards() {
  renderAwardsTimeline();
  renderAchievementsList();
}

function renderAwardsTimeline() {
  const container = document.getElementById('awardsTimeline');
  if (!container || !PROFILE.awards) return;

  container.classList.add('stagger-children');

  container.innerHTML = PROFILE.awards.map(award => `
    <div class="timeline-item reveal" role="listitem">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="award-card">
        <div class="award-icon-wrapper">
          <i class="${escapeHtml(award.icon || 'fas fa-award')}" aria-hidden="true"></i>
        </div>
        <div class="award-content">
          <div class="award-title">${escapeHtml(award.title)}</div>
          <div class="award-org">${escapeHtml(award.organization)}</div>
          <div class="award-meta">
            <span class="award-year">${escapeHtml(String(award.year))}</span>
            <span class="award-type">${escapeHtml(award.type)}</span>
            ${award.amount ? `<span class="award-amount">${escapeHtml(award.amount)}</span>` : ''}
          </div>
          <p class="award-desc">${escapeHtml(award.description)}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function renderAchievementsList() {
  if (!PROFILE.achievements) return;

  const filterRow = document.getElementById('achievementsFilterRow');
  const list = document.getElementById('achievementsList');
  if (!filterRow || !list) return;

  const categories = ['All', ...new Set(PROFILE.achievements.map(a => a.category).filter(Boolean))];

  filterRow.innerHTML = categories.map((cat, i) => `
    <button class="ach-filter-btn${i === 0 ? ' active' : ''}"
            data-cat="${escapeHtml(cat)}"
            aria-pressed="${i === 0}">${escapeHtml(cat)}</button>
  `).join('');

  filterRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.ach-filter-btn');
    if (!btn) return;
    filterRow.querySelectorAll('.ach-filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderAchievementCards(btn.dataset.cat);
  });

  renderAchievementCards('All');
}

function renderAchievementCards(category) {
  const list = document.getElementById('achievementsList');
  if (!list || !PROFILE.achievements) return;

  const filtered = category === 'All'
    ? PROFILE.achievements
    : PROFILE.achievements.filter(a => a.category === category);

  if (!filtered.length) {
    list.innerHTML = `<div class="ach-empty">No items in this category.</div>`;
    return;
  }

  list.innerHTML = filtered.map(item => `
    <div class="achievement-card" role="listitem">
      <div class="achievement-card-icon"
           style="background:${hexToRgba(item.color || '#6366f1', 0.12)};color:${item.color || 'var(--color-primary)'};">
        <i class="${escapeHtml(item.icon || 'fas fa-star')}" aria-hidden="true"></i>
      </div>
      <div class="achievement-card-body">
        <div class="achievement-card-cat" style="color:${item.color || 'var(--color-primary)'};">
          ${escapeHtml(item.category || '')}
        </div>
        <div class="achievement-card-title">${escapeHtml(item.title || '')}</div>
        ${item.detail ? `<div class="achievement-card-detail">${escapeHtml(item.detail)}</div>` : ''}
        ${item.meta ? `<div class="achievement-card-meta">${escapeHtml(item.meta)}</div>` : ''}
      </div>
    </div>
  `).join('');
}


/* ============================================================
   22. PATENTS
   ============================================================ */

function renderPatents() {
  const grid = document.getElementById('patentsGrid');
  if (!grid || !PROFILE.patents) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.patents.map(patent => `
    <div class="patent-card reveal" role="listitem">
      <div class="patent-icon"><i class="fas fa-certificate" aria-hidden="true"></i></div>
      <div class="patent-title">${escapeHtml(patent.title)}</div>
      <div class="patent-inventors">
        <strong>Inventors:</strong> ${patent.inventors ? patent.inventors.join(', ') : ''}
      </div>
      <div class="patent-meta">
        <span class="badge"><i class="fas fa-file-signature" aria-hidden="true"></i> ${escapeHtml(patent.applicationNumber)}</span>
        <span class="timeline-status-badge ${patent.status.includes('Ongoing') || patent.status.includes('Pending') ? 'status-ongoing' : 'status-completed'}">
          ${escapeHtml(patent.status)}
        </span>
        <span class="tag">${escapeHtml(patent.filingDate)}</span>
        <span class="tag">${escapeHtml(patent.patentOffice)}</span>
      </div>
      ${patent.abstract ? `<p class="patent-abstract">${escapeHtml(patent.abstract)}</p>` : ''}
    </div>
  `).join('');
}


/* ============================================================
   23. TEACHING EXPERIENCE
   ============================================================ */

function renderTeaching() {
  const container = document.getElementById('teachingTimeline');
  if (!container || !PROFILE.teaching) return;

  container.classList.add('stagger-children');

  container.innerHTML = PROFILE.teaching.map(t => `
    <div class="timeline-item reveal" role="listitem">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-title">${escapeHtml(t.role)}</div>
            <div class="timeline-subtitle">${escapeHtml(t.course)}${t.courseCode ? ` (${t.courseCode})` : ''}</div>
            <div class="timeline-meta">
              <span class="timeline-meta-item">
                <i class="fas fa-university" aria-hidden="true"></i>
                ${escapeHtml(t.institution)}
              </span>
              <span class="timeline-meta-item">
                <i class="fas fa-users" aria-hidden="true"></i>
                ${t.studentsCount} students
              </span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;flex-shrink:0;">
            <span class="timeline-duration-badge">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              ${escapeHtml(t.semester)}
            </span>
            <span class="badge">${escapeHtml(t.level)}</span>
          </div>
        </div>
        <p class="timeline-description">${escapeHtml(t.description)}</p>
        ${t.responsibilities && t.responsibilities.length ? `
          <ul class="timeline-responsibilities">
            ${t.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');
}


/* ============================================================
   24. CONFERENCES & WORKSHOPS
   ============================================================ */

function renderConferences() {
  const confGrid = document.getElementById('conferencesGrid');
  const wsGrid = document.getElementById('workshopsGrid');

  if (confGrid && PROFILE.conferencePresentations) {
    confGrid.classList.add('stagger-children');
    confGrid.innerHTML = PROFILE.conferencePresentations.map(conf => `
      <div class="conf-card reveal" role="listitem">
        <div>
          <span class="conf-type-badge ${getConfTypeClass(conf.type)}">
            <i class="${getConfTypeIcon(conf.type)}" aria-hidden="true"></i>
            ${escapeHtml(conf.type)}
          </span>
        </div>
        <div class="conf-title">${escapeHtml(conf.title)}</div>
        <div class="conf-event">${escapeHtml(conf.conference)}</div>
        <div class="conf-meta">
          <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(conf.location)}</span>
          <span><i class="fas fa-calendar" aria-hidden="true"></i> ${escapeHtml(conf.date)}</span>
        </div>
        ${conf.award ? `
          <div class="conf-award">
            <i class="fas fa-trophy" aria-hidden="true"></i>
            ${escapeHtml(conf.award)}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  if (wsGrid && PROFILE.workshops) {
    wsGrid.classList.add('stagger-children');
    wsGrid.innerHTML = PROFILE.workshops.map(ws => `
      <div class="workshop-card reveal" role="listitem">
        <span class="conf-type-badge type-workshop">
          <i class="fas fa-tools" aria-hidden="true"></i>
          ${escapeHtml(ws.type)}
        </span>
        <div class="workshop-title">${escapeHtml(ws.title)}</div>
        <div class="workshop-organizer">${escapeHtml(ws.organizer)}</div>
        <div class="workshop-meta">
          <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(ws.location)}</span>
          <span><i class="fas fa-calendar" aria-hidden="true"></i> ${escapeHtml(ws.date)}</span>
          <span><i class="fas fa-clock" aria-hidden="true"></i> ${escapeHtml(ws.duration)}</span>
        </div>
      </div>
    `).join('');
  }
}

function getConfTypeClass(type) {
  if (!type) return 'type-oral';
  const t = type.toLowerCase();
  if (t.includes('poster')) return 'type-poster';
  if (t.includes('workshop')) return 'type-workshop';
  return 'type-oral';
}

function getConfTypeIcon(type) {
  if (!type) return 'fas fa-microphone';
  const t = type.toLowerCase();
  if (t.includes('poster')) return 'fas fa-image';
  if (t.includes('workshop')) return 'fas fa-tools';
  return 'fas fa-microphone';
}


/* ============================================================
   25. LANGUAGES
   ============================================================ */

function renderLanguages() {
  const grid = document.getElementById('languagesGrid');
  if (!grid || !PROFILE.languages) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.languages.map(lang => `
    <div class="language-card reveal" role="listitem">
      <div class="language-name">${escapeHtml(lang.language)}</div>
      <div class="language-proficiency">${escapeHtml(lang.proficiency)}</div>
      <div class="language-bar-track" role="progressbar" aria-valuenow="${lang.level}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(lang.language)} proficiency">
        <div class="language-bar-fill" data-level="${lang.level}"></div>
      </div>
    </div>
  `).join('');

  initLanguageBars();
}


/* ============================================================
   26. MEMBERSHIPS
   ============================================================ */

function renderMemberships() {
  const grid = document.getElementById('membershipsGrid');
  if (!grid || !PROFILE.memberships) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.memberships.map(mem => `
    <div class="membership-card reveal" role="listitem">
      <div class="membership-icon"><i class="${escapeHtml(mem.icon)}" aria-hidden="true"></i></div>
      <div class="membership-org">${escapeHtml(mem.organization)}</div>
      <div class="membership-role">${escapeHtml(mem.role)}</div>
      <div class="membership-since">Since ${escapeHtml(String(mem.since))}</div>
    </div>
  `).join('');
}


/* ============================================================
   27. TESTIMONIALS
   ============================================================ */

function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid || !PROFILE.testimonials) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.testimonials.map(t => `
    <div class="testimonial-card reveal" role="listitem">
      <div class="testimonial-quote-icon" aria-hidden="true">"</div>
      <p class="testimonial-text">"${escapeHtml(t.quote)}"</p>
      <div class="testimonial-author">
        ${t.image
          ? `<img class="testimonial-photo" src="${escapeHtml(t.image)}" alt="${escapeHtml(t.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\"testimonial-photo-placeholder\\"><i class=\\"fas fa-user\\" aria-hidden=\\"true\\"></i></div>'">`
          : `<div class="testimonial-photo-placeholder"><i class="fas fa-user" aria-hidden="true"></i></div>`
        }
        <div>
          <div class="testimonial-author-name">${escapeHtml(t.name)}</div>
          <div class="testimonial-author-role">${escapeHtml(t.designation)} · ${escapeHtml(t.institution)}</div>
          ${t.rating ? `<div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}


/* ============================================================
   28. GALLERY
   ============================================================ */

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const filterBtns = document.getElementById('galleryFilterBtns');
  if (!grid || !PROFILE.gallery) return;

  galleryItems = PROFILE.gallery;

  /* Build category filters */
  const allCats = [...new Set(PROFILE.gallery.map(g => g.category).filter(Boolean))];
  if (filterBtns) {
    filterBtns.innerHTML = `
      <button class="filter-btn active" data-cat="all" aria-pressed="true">All</button>
      ${allCats.map(c => `
        <button class="filter-btn" data-cat="${escapeHtml(c)}" aria-pressed="false">${escapeHtml(c)}</button>
      `).join('')}
    `;
  }

  renderGalleryGrid('all');
}

function renderGalleryGrid(category) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const filtered = category === 'all'
    ? PROFILE.gallery
    : PROFILE.gallery.filter(g => g.category === category);

  galleryItems = filtered;

  grid.innerHTML = filtered.map((item, idx) => `
    <div class="gallery-item reveal" role="listitem" data-index="${idx}" tabindex="0"
         aria-label="${escapeHtml(item.title)}">
      <img
        class="gallery-img"
        data-src="${escapeHtml(item.image)}"
        alt="${escapeHtml(item.title)}"
        loading="lazy"
      />
      <div class="gallery-overlay">
        <span class="gallery-caption">${escapeHtml(item.title)}</span>
      </div>
      <div class="gallery-zoom-icon" aria-hidden="true"><i class="fas fa-search-plus"></i></div>
    </div>
  `).join('');

  initLazyImages();
}

function initGalleryFilter() {
  const filterBtns = document.getElementById('galleryFilterBtns');
  if (!filterBtns) return;

  filterBtns.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBtns.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderGalleryGrid(btn.dataset.cat);
  });
}

function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const imgObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => imgObs.observe(img));
}

function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (!lightbox) return;

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) {
      lightboxIndex = parseInt(item.dataset.index, 10);
      showLightboxImage(lightboxIndex);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  prevBtn && prevBtn.addEventListener('click', () => navigateLightbox(-1));
  nextBtn && nextBtn.addEventListener('click', () => navigateLightbox(1));

  function showLightboxImage(idx) {
    const item = galleryItems[idx];
    if (!item || !lightboxImg) return;
    lightboxImg.src = item.image;
    lightboxImg.alt = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.caption || item.title;
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
    showLightboxImage(lightboxIndex);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
}


/* ============================================================
   29. BLOG
   ============================================================ */

function renderBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid || !PROFILE.blogs) return;

  grid.classList.add('stagger-children');

  grid.innerHTML = PROFILE.blogs.map(post => `
    <article class="blog-card reveal" role="listitem">
      ${post.image
        ? `<img class="blog-img" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.outerHTML='<div class=\\"blog-img-placeholder\\"><i class=\\"fas fa-pen-nib\\" aria-hidden=\\"true\\"></i></div>'">`
        : `<div class="blog-img-placeholder"><i class="fas fa-pen-nib" aria-hidden="true"></i></div>`
      }
      <div class="blog-body">
        <div class="blog-meta">
          <span class="blog-date">${escapeHtml(post.date)}</span>
          <span class="blog-read-time">
            <i class="fas fa-clock" aria-hidden="true"></i>
            ${escapeHtml(post.readTime)}
          </span>
        </div>
        <h3 class="blog-title">${escapeHtml(post.title)}</h3>
        <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="blog-tags">
          ${(post.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="blog-card-footer">
          <a href="${escapeHtml(post.link || '#')}" class="btn btn-secondary btn-sm" aria-label="Read: ${escapeHtml(post.title)}">
            Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </article>
  `).join('');
}


/* ============================================================
   30. CONTACT
   ============================================================ */

function renderContact() {
  const contact = PROFILE.contact;
  const social = PROFILE.socialLinks;
  const personal = PROFILE.personal;
  if (!contact) return;

  const cardsEl = document.getElementById('contactCards');
  if (cardsEl) {
    const items = [
      { icon: 'fas fa-envelope', label: 'Email', value: contact.email, copy: true },
      { icon: 'fas fa-phone', label: 'Phone', value: contact.phone, copy: false },
      { icon: 'fas fa-map-marker-alt', label: 'Address', value: contact.officeAddress, copy: false },
      { icon: 'fas fa-clock', label: 'Office Hours', value: contact.officeHours, copy: false },
    ].filter(item => item.value);

    cardsEl.innerHTML = items.map(item => `
      <div class="contact-card">
        <div class="contact-card-icon">
          <i class="${escapeHtml(item.icon)}" aria-hidden="true"></i>
        </div>
        <div>
          <div class="contact-card-label">${escapeHtml(item.label)}</div>
          <div class="contact-card-value">${escapeHtml(item.value)}</div>
        </div>
        ${item.copy ? `
          <button class="copy-btn" data-copy="${escapeHtml(item.value)}" aria-label="Copy ${escapeHtml(item.label)}">
            <i class="fas fa-copy" aria-hidden="true"></i>
          </button>
        ` : ''}
      </div>
    `).join('');

    /* Copy button handler */
    cardsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;
      copyToClipboard(btn.dataset.copy);
      showToast('Copied to clipboard!');
    });
  }

  /* Social links */
  const socialEl = document.getElementById('contactSocial');
  if (socialEl && social) {
    const links = buildSocialLinks(social);
    socialEl.innerHTML = links.map(link => `
      <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener"
         class="contact-social-link ${link.cls}" aria-label="${escapeHtml(link.label)}">
        <i class="${escapeHtml(link.icon)}" aria-hidden="true"></i>
        ${escapeHtml(link.label)}
      </a>
    `).join('');
  }

  /* Map placeholder */
  const mapAddress = document.getElementById('mapAddress');
  const mapInstitution = document.getElementById('mapInstitution');
  if (mapAddress) mapAddress.textContent = contact.institutionAddress || '';
  if (mapInstitution) mapInstitution.textContent = personal ? personal.institution : '';

  /* Response time */
  const respEl = document.getElementById('contactResponseTime');
  if (respEl && contact.responseTime) {
    respEl.innerHTML = `
      <i class="fas fa-reply" aria-hidden="true"></i>
      <span>${escapeHtml(contact.responseTime)}</span>
    `;
  }
}


/* ============================================================
   31. FOOTER
   ============================================================ */

function renderFooter() {
  const p = PROFILE.personal;
  const contact = PROFILE.contact;
  const social = PROFILE.socialLinks;

  setTextById('footerName', p ? p.name : '');
  setTextById('footerTagline', p ? (p.tagline || p.designation) : '');

  const footerSocial = document.getElementById('footerSocial');
  if (footerSocial && social) {
    const links = buildSocialLinks(social);
    footerSocial.innerHTML = links.map(link => `
      <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener"
         class="footer-social-icon" aria-label="${escapeHtml(link.label)}"
         title="${escapeHtml(link.label)}">
        <i class="${escapeHtml(link.icon)}" aria-hidden="true"></i>
      </a>
    `).join('');
  }

  const footerContact = document.getElementById('footerContactInfo');
  if (footerContact && contact) {
    footerContact.innerHTML = [
      contact.email ? `<div class="footer-contact-item"><i class="fas fa-envelope"></i>${escapeHtml(contact.email)}</div>` : '',
      contact.phone ? `<div class="footer-contact-item"><i class="fas fa-phone"></i>${escapeHtml(contact.phone)}</div>` : '',
      p && p.institution ? `<div class="footer-contact-item"><i class="fas fa-university"></i>${escapeHtml(p.institution)}</div>` : '',
    ].join('');
  }

  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy && p) {
    const year = new Date().getFullYear();
    footerCopy.innerHTML = `
      © ${year} ${escapeHtml(p.name)}. All rights reserved.
      Built with <span style="color:var(--color-secondary)">♥</span> using HTML5, CSS3 & Vanilla JS.
    `;
  }
}

function buildSocialLinks(social) {
  const map = [
    { key: 'googleScholar', icon: 'fas fa-graduation-cap', label: 'Google Scholar', cls: 'scholar' },
    { key: 'orcid', icon: 'fab fa-orcid', label: 'ORCID', cls: 'orcid' },
    { key: 'researchgate', icon: 'fab fa-researchgate', label: 'ResearchGate', cls: 'rg' },
    { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn', cls: 'linkedin' },
    { key: 'twitter', icon: 'fab fa-twitter', label: 'Twitter', cls: 'twitter' },
    { key: 'github', icon: 'fab fa-github', label: 'GitHub', cls: 'github' },
    { key: 'pubmed', icon: 'fas fa-book-medical', label: 'PubMed', cls: 'pubmed' },
  ];
  return map
    .filter(m => social[m.key])
    .map(m => ({ ...m, href: social[m.key] }));
}


/* ============================================================
   32. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {
  /* Trigger skill bars and language bars as part of reveal */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  /* Observe existing and dynamically added reveal elements */
  function observeReveal() {
    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      .forEach(el => revealObs.observe(el));
  }

  observeReveal();

  /* Also kick off skill bars after a short delay to let DOM settle */
  setTimeout(() => {
    observeReveal();
    initSkillBars();
  }, 300);
}


/* ============================================================
   BACK TO TOP
   ============================================================ */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

function initKeyboardNavigation() {
  /* Gallery keyboard open */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.classList.contains('gallery-item')) {
      document.activeElement.click();
    }
  });
}


/* ============================================================
   33. UTILITY HELPERS
   ============================================================ */

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(99,102,241,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      /* Fallback for non-secure contexts */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (err) {
    console.warn('[Portfolio] Clipboard copy failed:', err);
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.hidden = false;

  setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

/* Smooth scroll for all anchor links */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href === '#') return;
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    const offset = 68; /* navbar height */
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});