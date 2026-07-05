/**
 * renderer.js — All section render functions + renderSection() dispatcher
 * Reads from window.PROFILE (set by app.js after JSON load).
 * Each render function targets specific DOM IDs that exist inside the
 * already-injected component HTML partial.
 */

'use strict';

const Renderer = (() => {

  /* shorthand aliases */
  const esc  = Utils.escapeHtml;
  const rgba = Utils.hexToRgba;
  const setText = Utils.setTextById;

  /* ── Meta & SEO ─────────────────────────────────────────────────── */

  function renderMeta() {
    const p = PROFILE.personal;
    if (!p) return;
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = `${p.name} — Academic Portfolio`;

    const setMeta = (id, attr, val) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta-description', 'content', p.metaDescription || `${p.name} — ${p.designation}`);
    setMeta('meta-keywords',    'content', p.metaKeywords    || '');
    setMeta('og-title',         'content', p.name);
    setMeta('og-description',   'content', p.metaDescription || '');
  }

  /* ── Nav Brand ──────────────────────────────────────────────────── */

  function renderNavBrand() {
    const p = PROFILE.personal;
    if (!p) return;
    const parts    = (p.name || '').split(' ');
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : (p.name || 'P').slice(0, 2);
    setText('navBrand', initials + ' Portfolio');
  }

  /* ── Hero ───────────────────────────────────────────────────────── */

  function renderHero() {
    const p = PROFILE.personal;
    if (!p) return;

    const photo = document.getElementById('heroPhoto');
    if (photo) {
      if (p.profileImage) {
        photo.src = p.profileImage;
        photo.alt = p.profileImageAlt || p.name;
        photo.onerror = () => _showPhotoPlaceholder(photo, p.name);
      } else {
        _showPhotoPlaceholder(photo, p.name);
      }
    }

    setText('heroName',        p.name        || '');
    setText('heroInstitution', p.institution || '');
    setText('heroDepartment',  p.department  || '');

    const focusEl = document.getElementById('heroResearchFocus');
    if (focusEl && p.researchFocus) {
      focusEl.innerHTML = p.researchFocus.split('|')
        .map(f => `<span class="focus-chip">${esc(f.trim())}</span>`)
        .join('');
    }

    const btnsEl = document.getElementById('heroButtons');
    if (btnsEl && p.heroButtons) {
      btnsEl.innerHTML = p.heroButtons.map(btn => {
        let href = '#contact';
        if (btn.action === 'resume'       && PROFILE.resume) href = PROFILE.resume.file || '#';
        if (btn.action === 'publications') href = '#publications';
        if (btn.action === 'contact')      href = '#contact';
        const dl = btn.action === 'resume' ? 'download' : '';
        return `
          <a href="${href}" class="btn btn-${btn.style || 'primary'}" ${dl} aria-label="${esc(btn.label)}">
            ${btn.icon ? `<i class="${esc(btn.icon)}" aria-hidden="true"></i>` : ''}
            ${esc(btn.label)}
          </a>`;
      }).join('');
    }

    // Typing effect texts exposed so app.js can pass them to Animations
    return p.typingTexts || [p.designation || ''];
  }

  function renderHeroQuickStats() {
    const container = document.getElementById('heroQuickStats');
    if (!container || !PROFILE.statistics) return;
    container.innerHTML = PROFILE.statistics.slice(0, 3).map(s => `
      <div class="quick-stat">
        <span class="quick-stat-number">${s.value}${esc(s.suffix || '')}</span>
        <span class="quick-stat-label">${esc(s.label)}</span>
      </div>`).join('');
  }

  function _showPhotoPlaceholder(img, name) {
    img.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'hero-photo-placeholder';
    div.textContent = Utils.getInitials(name || '');
    div.setAttribute('aria-label', `Profile photo placeholder for ${name}`);
    img.parentElement.insertBefore(div, img);
  }

  /* ── About + Statistics ─────────────────────────────────────────── */

  function renderAbout() {
    const a = PROFILE.about;
    if (!a) return;

    const bioEl = document.getElementById('aboutBio');
    if (bioEl) {
      bioEl.innerHTML = (a.biography || '').split('\n\n')
        .map(para => `<p>${esc(para).replace(/\n/g, '<br/>')}</p>`)
        .join('');
    }
    setText('aboutVision',      a.researchVision    || '');
    setText('aboutPhilosophy',  a.researchPhilosophy || '');
    setText('aboutCurrentWork', a.currentWork        || '');

    const objEl = document.getElementById('aboutObjectives');
    if (objEl && a.researchObjectives) {
      objEl.innerHTML = a.researchObjectives
        .map(obj => `<li class="objective-item">${esc(obj)}</li>`)
        .join('');
    }
  }

  function renderStatistics() {
    const grid = document.getElementById('statsGrid');
    if (!grid || !PROFILE.statistics) return;
    grid.innerHTML = PROFILE.statistics.map(stat => `
      <div class="stat-card reveal" role="listitem">
        <div class="stat-icon"><i class="${esc(stat.icon)}" aria-hidden="true"></i></div>
        <div class="stat-number" data-target="${stat.value}" data-suffix="${esc(stat.suffix || '')}">0</div>
        <div class="stat-label">${esc(stat.label)}</div>
      </div>`).join('');
  }

  /* ── Education ──────────────────────────────────────────────────── */

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
              <div class="timeline-title">${esc(edu.degree)}</div>
              <div class="timeline-subtitle">${esc(edu.field)}</div>
              <div class="timeline-meta">
                <span class="timeline-meta-item"><i class="fas fa-university" aria-hidden="true"></i> ${esc(edu.institution)}</span>
                <span class="timeline-meta-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(edu.location)}</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;flex-shrink:0;">
              <span class="timeline-duration-badge"><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(edu.duration)}</span>
              <span class="timeline-status-badge ${edu.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">${esc(edu.status)}</span>
            </div>
          </div>
          ${edu.cgpa ? `<div class="timeline-cgpa">📊 CGPA / Score: ${esc(edu.cgpa)}</div>` : ''}
          ${edu.thesis ? `
            <div class="timeline-description">
              <strong>Thesis:</strong> ${esc(edu.thesis)}
              ${edu.supervisor ? ` — <em>Supervisor: ${esc(edu.supervisor)}</em>` : ''}
            </div>` : ''}
          ${(edu.achievements || []).length ? `
            <div class="timeline-achievements">
              ${edu.achievements.map(a => `<span class="badge">${esc(a)}</span>`).join('')}
            </div>` : ''}
          ${(edu.coursework || []).length ? `
            <div class="timeline-tech-list">
              ${edu.coursework.map(c => `<span class="tag">${esc(c)}</span>`).join('')}
            </div>` : ''}
        </div>
      </div>`).join('');
  }

  /* ── Research Interests ─────────────────────────────────────────── */

  function renderResearchInterests() {
    const grid = document.getElementById('researchGrid');
    if (!grid || !PROFILE.researchInterests) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.researchInterests.map(item => `
      <div class="research-card reveal" role="listitem"
           style="--card-color:${item.color};--card-color-bg:${rgba(item.color, 0.1)};">
        <div class="research-icon"><i class="${esc(item.icon)}" aria-hidden="true"></i></div>
        <div class="research-card-title">${esc(item.title)}</div>
        <p class="research-card-desc">${esc(item.description)}</p>
        ${(item.keywords || []).length ? `
          <div class="research-keywords">
            ${item.keywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
          </div>` : ''}
      </div>`).join('');
  }

  /* ── Experience ─────────────────────────────────────────────────── */

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
              <div class="timeline-title">${esc(exp.role)}</div>
              <div class="timeline-subtitle">${esc(exp.institution)}</div>
              <div class="timeline-meta">
                <span class="timeline-meta-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(exp.location)}</span>
                <span class="timeline-meta-item"><span class="badge">${esc(exp.type)}</span></span>
              </div>
            </div>
            <span class="timeline-duration-badge"><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(exp.duration)}</span>
          </div>
          <p class="timeline-description">${esc(exp.description)}</p>
          ${(exp.responsibilities || []).length ? `
            <ul class="timeline-responsibilities">
              ${exp.responsibilities.map(r => `<li>${esc(r)}</li>`).join('')}
            </ul>` : ''}
          ${(exp.technologies || []).length ? `
            <div class="timeline-tech-list">
              ${exp.technologies.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
            </div>` : ''}
          ${(exp.achievements || []).length ? `
            <div class="timeline-achievements">
              ${exp.achievements.map(a => `<span class="badge">${esc(a)}</span>`).join('')}
            </div>` : ''}
        </div>
      </div>`).join('');
  }

  /* ── Publications ───────────────────────────────────────────────── */

  function renderPublications() {
    if (!PROFILE.publications) return;

    const filterBtns = document.getElementById('pubFilterBtns');
    const years = [...new Set(PROFILE.publications.map(p => p.year))].sort((a, b) => b - a);

    if (filterBtns) {
      filterBtns.innerHTML = `
        <button class="filter-btn active" data-year="all" aria-pressed="true">All</button>
        ${years.map(y => `<button class="filter-btn" data-year="${y}" aria-pressed="false">${y}</button>`).join('')}`;

      filterBtns.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterBtns.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        _filterPublications(btn.dataset.year, document.getElementById('pubSearch')?.value || '');
      });
    }

    _renderPublicationList(PROFILE.publications);
  }

  function _renderPublicationList(pubs) {
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
      <article class="pub-card ${pub.featured ? 'featured-pub' : ''} reveal" role="listitem">
        <div class="pub-number" aria-hidden="true">${String(idx + 1).padStart(2, '0')}</div>
        <div class="pub-content">
          <div class="pub-title">${esc(pub.title)}</div>
          <div class="pub-authors">${pub.authors ? pub.authors.join(', ') : ''}</div>
          <div class="pub-journal-line">
            <span>${esc(pub.journal)}</span>
            ${pub.year   ? `<span>(${pub.year})</span>` : ''}
            ${pub.volume ? `<span>Vol. ${esc(pub.volume)}${pub.issue ? `, No. ${esc(pub.issue)}` : ''}</span>` : ''}
            ${pub.pages  ? `<span>pp. ${esc(pub.pages)}</span>` : ''}
            ${pub.impactFactor ? `<span class="pub-if">IF: ${pub.impactFactor}</span>` : ''}
          </div>
          ${pub.abstract ? `<p class="pub-abstract">${esc(pub.abstract)}</p>` : ''}
          ${(pub.keywords || []).length ? `
            <div class="pub-keywords">
              ${pub.keywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
            </div>` : ''}
          <div class="pub-links">
            ${pub.links?.doi    ? `<a href="${esc(pub.links.doi)}"    target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><i class="fas fa-external-link-alt" aria-hidden="true"></i> DOI</a>` : ''}
            ${pub.links?.pdf    ? `<a href="${esc(pub.links.pdf)}"    target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fas fa-file-pdf" aria-hidden="true"></i> PDF</a>` : ''}
            ${pub.links?.pubmed ? `<a href="${esc(pub.links.pubmed)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fas fa-bookmark" aria-hidden="true"></i> PubMed</a>` : ''}
            ${pub.citations ? `<span class="pub-citations"><i class="fas fa-quote-right" aria-hidden="true"></i> ${pub.citations} citations</span>` : ''}
          </div>
        </div>
      </article>`).join('');
  }

  function initPublicationSearch() {
    const input = document.getElementById('pubSearch');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const year = document.querySelector('#pubFilterBtns .filter-btn.active')?.dataset.year || 'all';
        _filterPublications(year, input.value);
      }, 250);
    });
  }

  function _filterPublications(year, query) {
    if (!PROFILE.publications) return;
    const q = query.trim().toLowerCase();
    const filtered = PROFILE.publications.filter(pub => {
      const matchYear  = year === 'all' || String(pub.year) === String(year);
      const matchQuery = !q ||
        pub.title.toLowerCase().includes(q) ||
        (pub.authors  && pub.authors.join(' ').toLowerCase().includes(q)) ||
        (pub.journal  && pub.journal.toLowerCase().includes(q)) ||
        (pub.keywords && pub.keywords.some(k => k.toLowerCase().includes(q)));
      return matchYear && matchQuery;
    });
    _renderPublicationList(filtered);
    Animations.initScrollReveal();
  }

  /* ── Projects ───────────────────────────────────────────────────── */

  function renderProjects() {
    if (!PROFILE.projects) return;
    const allTags   = [...new Set(PROFILE.projects.flatMap(p => p.tags || []))];
    const filterBtns = document.getElementById('projectFilterBtns');

    if (filterBtns) {
      filterBtns.innerHTML = `
        <button class="filter-btn active" data-tag="all" aria-pressed="true">All</button>
        ${allTags.map(tag => `<button class="filter-btn" data-tag="${esc(tag)}" aria-pressed="false">${esc(tag)}</button>`).join('')}`;

      filterBtns.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterBtns.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        _renderProjectCards(btn.dataset.tag);
        Animations.initScrollReveal();
      });
    }
    _renderProjectCards('all');
  }

  function _renderProjectCards(tag) {
    const grid = document.getElementById('projectsGrid');
    if (!grid || !PROFILE.projects) return;
    const list = tag === 'all' ? PROFILE.projects : PROFILE.projects.filter(p => p.tags && p.tags.includes(tag));

    grid.innerHTML = list.map(proj => `
      <article class="project-card reveal" role="listitem" data-project-id="${esc(proj.id)}">
        ${proj.image
          ? `<img class="project-card-img" src="${esc(proj.image)}" alt="${esc(proj.title)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;project-card-img-placeholder&quot;><i class=&quot;fas fa-flask&quot; aria-hidden=&quot;true&quot;></i></div>'">`
          : `<div class="project-card-img-placeholder"><i class="fas fa-flask" aria-hidden="true"></i></div>`}
        <div class="project-card-body">
          <div class="project-card-header">
            <h3 class="project-card-title">${esc(proj.title)}</h3>
            <span class="project-status-badge ${proj.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">${esc(proj.status || '')}</span>
          </div>
          <p class="project-card-desc">${esc(proj.shortDescription || proj.description)}</p>
          <div class="project-card-tags">${(proj.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="project-card-footer">
            <div class="project-card-links">
              ${proj.links?.github ? `<a href="${esc(proj.links.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fab fa-github" aria-hidden="true"></i></a>` : ''}
              ${proj.links?.paper  ? `<a href="${esc(proj.links.paper)}"  target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fas fa-file-alt" aria-hidden="true"></i></a>` : ''}
            </div>
            <button class="btn btn-secondary btn-sm project-read-more" data-project-id="${esc(proj.id)}">
              Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>`).join('');
  }

  function initProjectModal() {
    const modal    = document.getElementById('projectModal');
    const closeBtn = document.getElementById('modalClose');
    if (!modal || !closeBtn) return;

    // Use event delegation on document (modal is in index.html, not component)
    document.addEventListener('click', _onProjectReadMore);
    closeBtn.addEventListener('click', _closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) _closeModal(); });
  }

  function _onProjectReadMore(e) {
    const btn = e.target.closest('.project-read-more');
    if (!btn) return;
    const proj = (PROFILE.projects || []).find(p => p.id === btn.dataset.projectId);
    if (proj) _openProjectModal(proj);
  }

  function _openProjectModal(proj) {
    const modal = document.getElementById('projectModal');
    const body  = document.getElementById('modalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      ${proj.image ? `<img class="modal-project-img" src="${esc(proj.image)}" alt="${esc(proj.title)}" loading="lazy" onerror="this.style.display='none'">` : ''}
      <div class="modal-project-title">${esc(proj.title)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem;">
        <span class="project-status-badge ${proj.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}">${esc(proj.status || '')}</span>
        ${proj.duration     ? `<span class="timeline-duration-badge"><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(proj.duration)}</span>` : ''}
        ${proj.fundingSource ? `<span class="badge"><i class="fas fa-coins" aria-hidden="true"></i> ${esc(proj.fundingSource)}</span>` : ''}
      </div>
      <div class="modal-section-label">Description</div>
      <p class="modal-text">${esc(proj.description)}</p>
      ${proj.methodology ? `<div class="modal-section-label">Methodology</div><p class="modal-text">${esc(proj.methodology)}</p>` : ''}
      ${proj.results      ? `<div class="modal-section-label">Results & Impact</div><p class="modal-text">${esc(proj.results)}</p>` : ''}
      ${(proj.technologies || []).length ? `
        <div class="modal-section-label">Technologies</div>
        <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem;">
          ${proj.technologies.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
        </div>` : ''}
      <div class="modal-links">
        ${proj.links?.github ? `<a href="${esc(proj.links.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fab fa-github" aria-hidden="true"></i> GitHub</a>` : ''}
        ${proj.links?.demo   ? `<a href="${esc(proj.links.demo)}"   target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><i class="fas fa-play-circle" aria-hidden="true"></i> Demo</a>` : ''}
        ${proj.links?.paper  ? `<a href="${esc(proj.links.paper)}"  target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fas fa-file-alt" aria-hidden="true"></i> Paper</a>` : ''}
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modalClose')?.focus();
  }

  function _closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) { modal.hidden = true; document.body.style.overflow = ''; }
  }

  /* ── Skills ─────────────────────────────────────────────────────── */

  function renderSkills() {
    _renderSkillBars('skillBarsResearch',      PROFILE.skills?.research);
    _renderSkillBars('skillBarsProgramming',   PROFILE.skills?.programming);
    _renderSkillBars('skillBarsBioinformatics',PROFILE.skills?.bioinformatics);
    _renderSkillBars('skillBarsSoft',          PROFILE.skills?.soft);
    _renderLabSkills();
    _renderTechnicalSkills();
  }

  function _renderSkillBars(containerId, skills) {
    const container = document.getElementById(containerId);
    if (!container || !skills) return;
    container.innerHTML = skills.map(skill => `
      <div class="skill-bar-item">
        <div class="skill-bar-header">
          <span class="skill-bar-name">${esc(skill.name)}</span>
          <span class="skill-bar-pct">${skill.level}%</span>
        </div>
        <div class="skill-bar-track" role="progressbar" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(skill.name)}">
          <div class="skill-bar-fill" data-level="${skill.level}" style="background:${skill.color || 'var(--gradient-primary)'};"></div>
        </div>
      </div>`).join('');
  }

  function _renderLabSkills() {
    const grid = document.getElementById('labSkillsGrid');
    if (!grid || !PROFILE.laboratorySkills) return;
    grid.innerHTML = PROFILE.laboratorySkills.map(s => `
      <div class="lab-skill-badge reveal" role="listitem" title="${esc(s.category || '')}">
        <i class="${esc(s.icon)}" aria-hidden="true"></i>
        ${esc(s.name)}
      </div>`).join('');
  }

  function _renderTechnicalSkills() {
    const container = document.getElementById('technicalSkillsList');
    if (!container || !PROFILE.technicalSkills) return;
    container.innerHTML = PROFILE.technicalSkills.map(cat => `
      <div class="tech-skill-category">
        <div class="tech-skill-cat-name">${esc(cat.category)}</div>
        <div class="tech-skill-items">
          ${cat.items.map(item => `<span class="tech-skill-item">${esc(item)}</span>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ── Certifications ─────────────────────────────────────────────── */

  function renderCertifications() {
    const grid = document.getElementById('certificationsGrid');
    if (!grid || !PROFILE.certifications) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.certifications.map(cert => `
      <div class="cert-card reveal" role="listitem">
        <div class="cert-icon" style="background:${rgba(cert.color || '#6366f1', 0.12)};color:${cert.color || 'var(--color-primary)'};">
          <i class="${esc(cert.icon || 'fas fa-certificate')}" aria-hidden="true"></i>
        </div>
        <div class="cert-title">${esc(cert.title)}</div>
        <div class="cert-provider">${esc(cert.provider)}</div>
        <div class="cert-date"><i class="fas fa-calendar-check" aria-hidden="true"></i> ${esc(cert.date)}</div>
        ${cert.credentialId ? `<div class="cert-id">ID: ${esc(cert.credentialId)}</div>` : ''}
        ${cert.link ? `
          <div class="cert-card-footer">
            <a href="${esc(cert.link)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i> View Certificate
            </a>
          </div>` : ''}
      </div>`).join('');
  }

  /* ── Awards & Achievements ──────────────────────────────────────── */

  function renderAwards() {
    const container = document.getElementById('awardsTimeline');
    if (!container || !PROFILE.awards) return;
    container.classList.add('stagger-children');
    container.innerHTML = PROFILE.awards.map(award => `
      <div class="timeline-item reveal" role="listitem">
        <div class="timeline-dot" aria-hidden="true"></div>
        <div class="award-card">
          <div class="award-icon-wrapper"><i class="${esc(award.icon || 'fas fa-award')}" aria-hidden="true"></i></div>
          <div class="award-content">
            <div class="award-title">${esc(award.title)}</div>
            <div class="award-org">${esc(award.organization)}</div>
            <div class="award-meta">
              <span class="award-year">${esc(String(award.year))}</span>
              <span class="award-type">${esc(award.type)}</span>
              ${award.amount ? `<span class="award-amount">${esc(award.amount)}</span>` : ''}
            </div>
            <p class="award-desc">${esc(award.description)}</p>
          </div>
        </div>
      </div>`).join('');

    /* ── Achievement highlights — rich cards with category filter ── */
    const list      = document.getElementById('achievementsList');
    const filterRow = document.getElementById('achievementsFilterRow');
    if (!list || !PROFILE.achievements) return;

    const items = PROFILE.achievements;

    /* Detect if new object format or legacy string array */
    const isStructured = items.length > 0 && typeof items[0] === 'object';

    if (!isStructured) {
      /* Legacy string fallback */
      list.innerHTML = items
        .map(item => `<div class="achievement-chip"><span class="achievement-chip-text">${esc(item)}</span></div>`)
        .join('');
      return;
    }

    /* Build category filter pills */
    const categories = ['All', ...new Set(items.map(a => a.category).filter(Boolean))];
    if (filterRow) {
      filterRow.innerHTML = categories.map((cat, i) => `
        <button class="ach-filter-btn ${i === 0 ? 'active' : ''}"
                data-cat="${esc(cat)}"
                aria-pressed="${i === 0}">${esc(cat)}</button>`).join('');

      filterRow.addEventListener('click', (e) => {
        const btn = e.target.closest('.ach-filter-btn');
        if (!btn) return;
        filterRow.querySelectorAll('.ach-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        _renderAchievementCards(items, btn.dataset.cat, list);
      });
    }

    _renderAchievementCards(items, 'All', list);
  }

  function _renderAchievementCards(items, category, container) {
    const filtered = category === 'All'
      ? items
      : items.filter(a => a.category === category);

    if (!filtered.length) {
      container.innerHTML = `<div class="ach-empty">No items in this category.</div>`;
      return;
    }

    container.innerHTML = filtered.map(a => `
      <div class="achievement-card" role="listitem">
        <div class="achievement-card-icon"
             style="background:${rgba(a.color || '#6366f1', 0.12)};color:${a.color || 'var(--color-primary)'};">
          <i class="${esc(a.icon || 'fas fa-star')}" aria-hidden="true"></i>
        </div>
        <div class="achievement-card-body">
          <div class="achievement-card-cat"
               style="color:${a.color || 'var(--color-primary)'};">${esc(a.category || '')}</div>
          <div class="achievement-card-title">${esc(a.title)}</div>
          ${a.detail ? `<div class="achievement-card-detail">${esc(a.detail)}</div>` : ''}
          ${a.meta ? `<div class="achievement-card-meta">${esc(a.meta)}</div>` : ''}
        </div>
      </div>`).join('');
  }

  /* ── Patents ────────────────────────────────────────────────────── */

  function renderPatents() {
    const grid = document.getElementById('patentsGrid');
    if (!grid || !PROFILE.patents) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.patents.map(patent => `
      <div class="patent-card reveal" role="listitem">
        <div class="patent-icon"><i class="fas fa-certificate" aria-hidden="true"></i></div>
        <div class="patent-title">${esc(patent.title)}</div>
        <div class="patent-inventors"><strong>Inventors:</strong> ${(patent.inventors || []).join(', ')}</div>
        <div class="patent-meta">
          <span class="badge"><i class="fas fa-file-signature" aria-hidden="true"></i> ${esc(patent.applicationNumber)}</span>
          <span class="timeline-status-badge ${patent.status.includes('Pending') ? 'status-ongoing' : 'status-completed'}">${esc(patent.status)}</span>
          <span class="tag">${esc(patent.filingDate)}</span>
          <span class="tag">${esc(patent.patentOffice)}</span>
        </div>
        ${patent.abstract ? `<p class="patent-abstract">${esc(patent.abstract)}</p>` : ''}
      </div>`).join('');
  }

  /* ── Test Scores ────────────────────────────────────────────────── */

  function renderTestScores() {
    const grid = document.getElementById('testScoresGrid');
    if (!grid || !PROFILE.testScores) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.testScores.map(ts => `
      <div class="test-score-card reveal" role="listitem">
        <div class="test-score-icon">
          <i class="${esc(ts.icon || 'fas fa-chart-bar')}" aria-hidden="true"></i>
        </div>
        <div class="test-score-body">
          <div class="test-score-exam">${esc(ts.exam)}</div>
          <div class="test-score-assoc">${esc(ts.association)} &middot; ${esc(ts.date)}</div>
          ${ts.description ? `<div class="test-score-desc">${esc(ts.description)}</div>` : ''}
        </div>
        <div class="test-score-result">
          <span class="test-score-number">${esc(ts.score)}${ts.maxScore ? `<span class="test-score-max">/${esc(ts.maxScore)}</span>` : ''}</span>
          ${ts.qualified ? `<span class="test-score-badge">Qualified</span>` : ''}
        </div>
      </div>`).join('');
  }

  /* ── Teaching ───────────────────────────────────────────────────── */

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
              <div class="timeline-title">${esc(t.role)}</div>
              <div class="timeline-subtitle">${esc(t.course)}${t.courseCode ? ` (${esc(t.courseCode)})` : ''}</div>
              <div class="timeline-meta">
                <span class="timeline-meta-item"><i class="fas fa-university" aria-hidden="true"></i> ${esc(t.institution)}</span>
                <span class="timeline-meta-item"><i class="fas fa-users" aria-hidden="true"></i> ${t.studentsCount} students</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;flex-shrink:0;">
              <span class="timeline-duration-badge"><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(t.semester)}</span>
              <span class="badge">${esc(t.level)}</span>
            </div>
          </div>
          <p class="timeline-description">${esc(t.description)}</p>
          ${(t.responsibilities || []).length ? `
            <ul class="timeline-responsibilities">
              ${t.responsibilities.map(r => `<li>${esc(r)}</li>`).join('')}
            </ul>` : ''}
        </div>
      </div>`).join('');
  }

  /* ── Conferences & Workshops ────────────────────────────────────── */

  function renderConferences() {
    const confGrid = document.getElementById('conferencesGrid');
    if (confGrid && PROFILE.conferencePresentations) {
      confGrid.classList.add('stagger-children');
      confGrid.innerHTML = PROFILE.conferencePresentations.map(conf => `
        <div class="conf-card reveal" role="listitem">
          <span class="conf-type-badge ${_confTypeClass(conf.type)}">
            <i class="${_confTypeIcon(conf.type)}" aria-hidden="true"></i> ${esc(conf.type)}
          </span>
          <div class="conf-title">${esc(conf.title)}</div>
          <div class="conf-event">${esc(conf.conference)}</div>
          <div class="conf-meta">
            <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(conf.location)}</span>
            <span><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(conf.date)}</span>
          </div>
          ${conf.award ? `<div class="conf-award"><i class="fas fa-trophy" aria-hidden="true"></i> ${esc(conf.award)}</div>` : ''}
        </div>`).join('');
    }

    const wsGrid = document.getElementById('workshopsGrid');
    if (wsGrid && PROFILE.workshops) {
      wsGrid.classList.add('stagger-children');
      wsGrid.innerHTML = PROFILE.workshops.map(ws => `
        <div class="workshop-card reveal" role="listitem">
          <span class="conf-type-badge type-workshop"><i class="fas fa-tools" aria-hidden="true"></i> ${esc(ws.type)}</span>
          <div class="workshop-title">${esc(ws.title)}</div>
          <div class="workshop-organizer">${esc(ws.organizer)}</div>
          <div class="workshop-meta">
            <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(ws.location)}</span>
            <span><i class="fas fa-calendar" aria-hidden="true"></i> ${esc(ws.date)}</span>
            <span><i class="fas fa-clock" aria-hidden="true"></i> ${esc(ws.duration)}</span>
          </div>
        </div>`).join('');
    }
  }

  function _confTypeClass(type) {
    if (!type) return 'type-oral';
    const t = type.toLowerCase();
    if (t.includes('poster'))   return 'type-poster';
    if (t.includes('workshop')) return 'type-workshop';
    return 'type-oral';
  }
  function _confTypeIcon(type) {
    if (!type) return 'fas fa-microphone';
    const t = type.toLowerCase();
    if (t.includes('poster'))   return 'fas fa-image';
    if (t.includes('workshop')) return 'fas fa-tools';
    return 'fas fa-microphone';
  }

  /* ── Languages ──────────────────────────────────────────────────── */

  function renderLanguages() {
    const grid = document.getElementById('languagesGrid');
    if (!grid || !PROFILE.languages) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.languages.map(lang => `
      <div class="language-card reveal" role="listitem">
        <div class="language-name">${esc(lang.language)}</div>
        <div class="language-proficiency">${esc(lang.proficiency)}</div>
        <div class="language-bar-track" role="progressbar" aria-valuenow="${lang.level}" aria-valuemin="0" aria-valuemax="100">
          <div class="language-bar-fill" data-level="${lang.level}"></div>
        </div>
      </div>`).join('');
  }

  /* ── Memberships ────────────────────────────────────────────────── */

  function renderMemberships() {
    const grid = document.getElementById('membershipsGrid');
    if (!grid || !PROFILE.memberships) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.memberships.map(mem => `
      <div class="membership-card reveal" role="listitem">
        <div class="membership-icon"><i class="${esc(mem.icon)}" aria-hidden="true"></i></div>
        <div class="membership-org">${esc(mem.organization)}</div>
        <div class="membership-role">${esc(mem.role)}</div>
        <div class="membership-since">Since ${esc(String(mem.since))}</div>
      </div>`).join('');
  }

  /* ── Testimonials ───────────────────────────────────────────────── */

  function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid || !PROFILE.testimonials) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.testimonials.map(t => `
      <div class="testimonial-card reveal" role="listitem">
        <div class="testimonial-quote-icon" aria-hidden="true">"</div>
        <p class="testimonial-text">"${esc(t.quote)}"</p>
        <div class="testimonial-author">
          ${t.image
            ? `<img class="testimonial-photo" src="${esc(t.image)}" alt="${esc(t.name)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;testimonial-photo-placeholder&quot;><i class=&quot;fas fa-user&quot; aria-hidden=&quot;true&quot;></i></div>'">`
            : `<div class="testimonial-photo-placeholder"><i class="fas fa-user" aria-hidden="true"></i></div>`}
          <div>
            <div class="testimonial-author-name">${esc(t.name)}</div>
            <div class="testimonial-author-role">${esc(t.designation)} · ${esc(t.institution)}</div>
            ${t.rating ? `<div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>` : ''}
          </div>
        </div>
      </div>`).join('');
  }

  /* ── Gallery ────────────────────────────────────────────────────── */

  function renderGallery() {
    if (!PROFILE.gallery) return;
    const filterBtns = document.getElementById('galleryFilterBtns');
    const allCats = [...new Set(PROFILE.gallery.map(g => g.category).filter(Boolean))];

    if (filterBtns) {
      filterBtns.innerHTML = `
        <button class="filter-btn active" data-cat="all" aria-pressed="true">All</button>
        ${allCats.map(c => `<button class="filter-btn" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}`;
    }

    _renderGalleryGrid('all');
  }

  function _renderGalleryGrid(category) {
    const grid = document.getElementById('galleryGrid');
    if (!grid || !PROFILE.gallery) return;
    const filtered = category === 'all'
      ? PROFILE.gallery
      : PROFILE.gallery.filter(g => g.category === category);

    // Expose filtered list globally for lightbox navigation
    window._galleryItems = filtered;

    grid.innerHTML = filtered.map((item, idx) => `
      <div class="gallery-item reveal" role="listitem" data-index="${idx}" tabindex="0" aria-label="${esc(item.title)}">
        <img class="gallery-img" data-src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" />
        <div class="gallery-overlay">
          <span class="gallery-caption">${esc(item.title)}</span>
        </div>
        <div class="gallery-zoom-icon" aria-hidden="true"><i class="fas fa-search-plus"></i></div>
      </div>`).join('');

    Animations.initLazyImages();
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
      _renderGalleryGrid(btn.dataset.cat);
      Animations.initScrollReveal();
    });
  }

  function initGalleryLightbox() {
    const lightbox   = document.getElementById('lightbox');
    const lbImg      = document.getElementById('lightboxImg');
    const lbCaption  = document.getElementById('lightboxCaption');
    const closeBtn   = document.getElementById('lightboxClose');
    const prevBtn    = document.getElementById('lightboxPrev');
    const nextBtn    = document.getElementById('lightboxNext');
    if (!lightbox) return;

    let idx = 0;

    // Remove old listeners by replacing with clones
    const freshClose = closeBtn.cloneNode(true);
    const freshPrev  = prevBtn.cloneNode(true);
    const freshNext  = nextBtn.cloneNode(true);
    closeBtn.replaceWith(freshClose);
    prevBtn.replaceWith(freshPrev);
    nextBtn.replaceWith(freshNext);

    document.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;
      idx = parseInt(item.dataset.index, 10);
      _showLightboxImage(idx, lbImg, lbCaption);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    });

    freshClose.addEventListener('click', _closeLightbox);
    freshPrev.addEventListener('click',  () => { idx = (idx - 1 + (window._galleryItems || []).length) % (window._galleryItems || [1]).length; _showLightboxImage(idx, lbImg, lbCaption); });
    freshNext.addEventListener('click',  () => { idx = (idx + 1) % (window._galleryItems || [1]).length; _showLightboxImage(idx, lbImg, lbCaption); });

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) _closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')     _closeLightbox();
      if (e.key === 'ArrowLeft')  { idx = (idx - 1 + (window._galleryItems || []).length) % (window._galleryItems || [1]).length; _showLightboxImage(idx, lbImg, lbCaption); }
      if (e.key === 'ArrowRight') { idx = (idx + 1) % (window._galleryItems || [1]).length; _showLightboxImage(idx, lbImg, lbCaption); }
    });
  }

  function _showLightboxImage(i, imgEl, captionEl) {
    const item = (window._galleryItems || [])[i];
    if (!item || !imgEl) return;
    imgEl.src = item.image;
    imgEl.alt = item.title;
    if (captionEl) captionEl.textContent = item.caption || item.title;
  }

  function _closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.hidden = true; document.body.style.overflow = ''; }
  }

  /* ── Blog ───────────────────────────────────────────────────────── */

  function renderBlog() {
    const grid = document.getElementById('blogGrid');
    if (!grid || !PROFILE.blogs) return;
    grid.classList.add('stagger-children');
    grid.innerHTML = PROFILE.blogs.map(post => `
      <article class="blog-card reveal" role="listitem">
        ${post.image
          ? `<img class="blog-img" src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;blog-img-placeholder&quot;><i class=&quot;fas fa-pen-nib&quot; aria-hidden=&quot;true&quot;></i></div>'">`
          : `<div class="blog-img-placeholder"><i class="fas fa-pen-nib" aria-hidden="true"></i></div>`}
        <div class="blog-body">
          <div class="blog-meta">
            <span class="blog-date">${esc(post.date)}</span>
            <span class="blog-read-time"><i class="fas fa-clock" aria-hidden="true"></i> ${esc(post.readTime)}</span>
          </div>
          <h3 class="blog-title">${esc(post.title)}</h3>
          <p class="blog-excerpt">${esc(post.excerpt)}</p>
          <div class="blog-tags">${(post.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="blog-card-footer">
            <a href="${esc(post.link || '#')}" class="btn btn-secondary btn-sm">Read More <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>`).join('');
  }

  /* ── Contact ────────────────────────────────────────────────────── */

  function renderContact() {
    const contact  = PROFILE.contact;
    const social   = PROFILE.socialLinks;
    const personal = PROFILE.personal;
    if (!contact) return;

    const cardsEl = document.getElementById('contactCards');
    if (cardsEl) {
      const items = [
        { icon: 'fas fa-envelope',       label: 'Email',        value: contact.email,        copy: true  },
        { icon: 'fas fa-phone',          label: 'Phone',        value: contact.phone,        copy: false },
        { icon: 'fas fa-map-marker-alt', label: 'Address',      value: contact.officeAddress,copy: false },
        { icon: 'fas fa-clock',          label: 'Office Hours', value: contact.officeHours,  copy: false },
      ].filter(i => i.value);

      cardsEl.innerHTML = items.map(item => `
        <div class="contact-card">
          <div class="contact-card-icon"><i class="${esc(item.icon)}" aria-hidden="true"></i></div>
          <div>
            <div class="contact-card-label">${esc(item.label)}</div>
            <div class="contact-card-value">${esc(item.value)}</div>
          </div>
          ${item.copy ? `<button class="copy-btn" data-copy="${esc(item.value)}" aria-label="Copy ${esc(item.label)}"><i class="fas fa-copy" aria-hidden="true"></i></button>` : ''}
        </div>`).join('');

      cardsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (!btn) return;
        Utils.copyToClipboard(btn.dataset.copy);
        Utils.showToast('Copied to clipboard!');
      });
    }

    const socialEl = document.getElementById('contactSocial');
    if (socialEl && social) {
      const links = Utils.buildSocialLinks(social);
      socialEl.innerHTML = links.map(link => `
        <a href="${esc(link.href)}" target="_blank" rel="noopener" class="contact-social-link ${esc(link.cls)}" aria-label="${esc(link.label)}">
          <i class="${esc(link.icon)}" aria-hidden="true"></i> ${esc(link.label)}
        </a>`).join('');
    }

    setText('mapAddress',     contact.institutionAddress || '');
    setText('mapInstitution', personal ? personal.institution : '');

    const respEl = document.getElementById('contactResponseTime');
    if (respEl && contact.responseTime) {
      respEl.innerHTML = `<i class="fas fa-reply" aria-hidden="true"></i> <span>${esc(contact.responseTime)}</span>`;
    }

    /* ── Contact form ── */
    _initContactForm(contact.email);
  }

  function _initContactForm(recipientEmail) {
    const form      = document.getElementById('contactForm');
    const textarea  = document.getElementById('contactMessage');
    const charCount = document.getElementById('charCount');
    if (!form) return;

    /* Live character counter */
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = len;
        charCount.style.color = len > 900
          ? 'var(--color-secondary)'
          : 'var(--text-muted)';
        if (len > 1000) textarea.value = textarea.value.slice(0, 1000);
      });
    }

    /* Inline validation helpers */
    function setError(inputId, errorId, msg) {
      const input = document.getElementById(inputId);
      const err   = document.getElementById(errorId);
      if (!input || !err) return;
      if (msg) {
        input.classList.add('form-input--error');
        err.textContent = msg;
      } else {
        input.classList.remove('form-input--error');
        err.textContent = '';
      }
    }

    function validateField(inputId, errorId) {
      const input = document.getElementById(inputId);
      if (!input) return true;
      if (!input.value.trim()) {
        setError(inputId, errorId, 'This field is required.');
        return false;
      }
      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        setError(inputId, errorId, 'Please enter a valid email address.');
        return false;
      }
      setError(inputId, errorId, '');
      return true;
    }

    /* Clear error on input */
    [
      ['contactName',    'nameError'],
      ['contactEmail',   'emailError'],
      ['contactSubject', 'subjectError'],
      ['contactMessage', 'messageError'],
    ].forEach(([id, errId]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => validateField(id, errId));
    });

    /* Submit — validate then open mailto */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const validName    = validateField('contactName',    'nameError');
      const validEmail   = validateField('contactEmail',   'emailError');
      const validSubject = validateField('contactSubject', 'subjectError');
      const validMsg     = validateField('contactMessage', 'messageError');

      const successBanner = document.getElementById('formSuccess');
      const errorBanner   = document.getElementById('formError');

      if (!validName || !validEmail || !validSubject || !validMsg) {
        if (errorBanner)   { errorBanner.hidden   = false; }
        if (successBanner) { successBanner.hidden = true;  }
        return;
      }

      if (errorBanner) errorBanner.hidden = true;

      /* Build mailto link */
      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value.trim();

      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:${encodeURIComponent(recipientEmail || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      /* Show success message */
      if (successBanner) successBanner.hidden = false;

      /* Reset form after short delay */
      setTimeout(() => {
        form.reset();
        if (charCount) charCount.textContent = '0';
        if (successBanner) successBanner.hidden = true;
      }, 4000);
    });

    /* Wire direct email link */
    const directLink = document.getElementById('formDirectEmail');
    if (directLink && recipientEmail) {
      directLink.href = `mailto:${recipientEmail}`;
      directLink.textContent = recipientEmail;
    }
  }

  /* ── Footer ─────────────────────────────────────────────────────── */

  function renderFooter() {
    const p       = PROFILE.personal;
    const contact = PROFILE.contact;
    const social  = PROFILE.socialLinks;
    const edu     = PROFILE.education;

    /* Name + degree line */
    setText('footerName', p ? p.name : '');

    const degreeEl = document.getElementById('footerDegree');
    if (degreeEl && p) {
      degreeEl.textContent = p.designation || p.title || '';
    }

    /* Tagline */
    setText('footerTagline', p ? (p.tagline || '') : '');

    /* Institution line */
    const instEl = document.getElementById('footerInstitutionLine');
    if (instEl && p) {
      instEl.innerHTML = `<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${esc(p.department ? p.department + ', ' : '')}${esc(p.institution || '')}`;
    }

    /* Social icons */
    const footerSocial = document.getElementById('footerSocial');
    if (footerSocial && social) {
      const links = Utils.buildSocialLinks(social);
      footerSocial.innerHTML = links.map(link => `
        <a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer"
           class="footer-social-icon footer-social-${esc(link.cls)}"
           aria-label="${esc(link.label)}" title="${esc(link.label)}">
          <i class="${esc(link.icon)}" aria-hidden="true"></i>
        </a>`).join('');
    }

    /* Contact list */
    const footerContact = document.getElementById('footerContactInfo');
    if (footerContact && contact) {
      const items = [
        contact.email    ? { icon: 'fas fa-envelope',       text: contact.email,    href: `mailto:${contact.email}` } : null,
        contact.phone    ? { icon: 'fas fa-phone',          text: contact.phone,    href: `tel:${contact.phone}`    } : null,
        p && p.location  ? { icon: 'fas fa-map-marker-alt', text: p.location,       href: null                      } : null,
      ].filter(Boolean);

      footerContact.innerHTML = items.map(item => `
        <div class="footer-contact-row">
          <span class="footer-contact-icon"><i class="${esc(item.icon)}" aria-hidden="true"></i></span>
          ${item.href
            ? `<a href="${esc(item.href)}" class="footer-contact-value">${esc(item.text)}</a>`
            : `<span class="footer-contact-value">${esc(item.text)}</span>`
          }
        </div>`).join('');
    }

    /* Copyright */
    const footerCopy = document.getElementById('footerCopy');
    if (footerCopy && p) {
      const year = new Date().getFullYear();
      footerCopy.innerHTML = `&copy; ${year} ${esc(p.name)}. All rights reserved.`;
    }
  }

  /* ── Section Dispatcher ─────────────────────────────────────────── */

  function renderSection(name) {
    const map = {
      hero:         () => { renderHero(); renderHeroQuickStats(); },
      about:        () => { renderAbout(); renderStatistics(); },
      education:    renderEducation,
      research:     renderResearchInterests,
      experience:   renderExperience,
      publications: () => { renderPublications(); initPublicationSearch(); },
      projects:     () => { renderProjects(); initProjectModal(); },
      skills:       renderSkills,
      achievements: () => { renderAwards(); renderCertifications(); renderPatents(); renderTestScores(); },
      conferences:  renderConferences,
      teaching:     () => { renderTeaching(); renderLanguages(); renderMemberships(); renderTestimonials(); },
      gallery:      () => { renderGallery(); initGalleryFilter(); initGalleryLightbox(); },
      blog:         renderBlog,
      contact:      renderContact,
    };
    if (map[name]) map[name]();
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  return {
    renderMeta,
    renderNavBrand,
    renderHero,
    renderHeroQuickStats,
    renderFooter,
    renderSection,
    initPublicationSearch,
    initProjectModal,
    initGalleryFilter,
    initGalleryLightbox,
  };
})();
