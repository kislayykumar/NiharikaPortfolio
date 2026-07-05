/**
 * utils.js — Shared helpers used across renderer, animations, router
 */

'use strict';

const Utils = (() => {

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
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
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

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    const msg   = document.getElementById('toastMsg');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
  }

  function getInitials(name) {
    return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function buildSocialLinks(social) {
    const map = [
      { key: 'googleScholar', icon: 'fas fa-graduation-cap', label: 'Google Scholar', cls: 'scholar'   },
      { key: 'orcid',         icon: 'fab fa-orcid',          label: 'ORCID',          cls: 'orcid'     },
      { key: 'researchgate',  icon: 'fab fa-researchgate',   label: 'ResearchGate',   cls: 'rg'        },
      { key: 'linkedin',      icon: 'fab fa-linkedin-in',    label: 'LinkedIn',       cls: 'linkedin'  },
      { key: 'twitter',       icon: 'fab fa-twitter',        label: 'Twitter',        cls: 'twitter'   },
      { key: 'instagram',     icon: 'fab fa-instagram',      label: 'Instagram',      cls: 'instagram' },
      { key: 'github',        icon: 'fab fa-github',         label: 'GitHub',         cls: 'github'    },
      { key: 'pubmed',        icon: 'fas fa-book-medical',   label: 'PubMed',         cls: 'pubmed'    },
    ];
    return map.filter(m => social[m.key]).map(m => ({ ...m, href: social[m.key] }));
  }

  return {
    setTextById,
    escapeHtml,
    hexToRgba,
    copyToClipboard,
    showToast,
    getInitials,
    buildSocialLinks,
  };
})();
