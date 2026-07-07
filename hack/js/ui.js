// Smart Bharat – UI Utilities
SB.ui = {

  // Toast notifications
  toast(message, type = 'info', duration = 3500) {
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa ${icons[type] || icons.info} toast-icon"></i><span class="toast-body">${message}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fa fa-times"></i></button>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, duration);
  },

  // Render skeleton loaders
  skeleton(lines = 3) {
    return Array.from({ length: lines }, (_, i) =>
      `<div class="skeleton skeleton-text" style="width:${[100,80,60][i%3]}%"></div>`
    ).join('');
  },

  // Format numbers
  formatNumber(n) {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },

  // Generate complaint ID
  generateComplaintId() {
    const prefix = 'SB';
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${year}${rand}`;
  },

  // Animate count up
  animateCount(el, target, duration = 1500) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString('en-IN');
      if (start >= target) clearInterval(timer);
    }, 16);
  },

  // Render markdown
  renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
      return marked.parse(text);
    }
    return text.replace(/\n/g, '<br>');
  },

  // Debounce
  debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  },

  // Copy to clipboard
  async copyToClipboard(text, label = 'Copied!') {
    try {
      await navigator.clipboard.writeText(text);
      this.toast(label, 'success');
    } catch { this.toast('Failed to copy', 'error'); }
  },

  // Format date
  formatDate(date = new Date()) {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
  },

  // Format time
  formatTime(date = new Date()) {
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  },

  // Switch tab
  switchTab(tabId, panelId, groupPrefix) {
    document.querySelectorAll(`.tab-btn[data-group="${groupPrefix}"]`).forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`.tab-panel[data-group="${groupPrefix}"]`).forEach(p => p.classList.remove('active'));
    document.querySelector(`#${tabId}`)?.classList.add('active');
    document.querySelector(`#${panelId}`)?.classList.add('active');
  },

  // Open / close modal
  openModal(id) { document.getElementById(id)?.classList.add('open'); },
  closeModal(id) { document.getElementById(id)?.classList.remove('open'); },

  // Render stars
  stars(n = 5) {
    return Array.from({ length: 5 }, (_, i) => `<i class="fa fa-star${i < n ? '' : '-o'}"></i>`).join('');
  }
};

// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').className = isDark ? 'fa fa-moon' : 'fa fa-sun';
  localStorage.setItem('sb_theme', isDark ? 'light' : 'dark');
}

function toggleMobileNav() {
  document.getElementById('mobile-nav-drawer').classList.toggle('open');
  document.getElementById('mobile-nav-overlay').style.display = 'block';
}
function closeMobileNav() {
  document.getElementById('mobile-nav-drawer').classList.remove('open');
  document.getElementById('mobile-nav-overlay').style.display = 'none';
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-switcher')) document.getElementById('lang-dropdown')?.classList.remove('open');
  if (!e.target.closest('.user-avatar-menu')) document.getElementById('user-menu')?.classList.remove('open');
});
