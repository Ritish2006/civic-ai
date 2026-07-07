// Smart Bharat – Client-side Router
SB.router = {
  currentPage: 'home',
  pages: ['home', 'chat', 'schemes', 'complaint', 'tracking', 'documents', 'offices', 'dashboard', 'admin', 'login'],

  init() {
    const hash = location.hash.replace('#', '') || 'home';
    const saved = localStorage.getItem('sb_lang') || 'en';
    SB.i18n.currentLang = saved;
    document.getElementById('current-lang-label').textContent = saved.toUpperCase();
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      this.navigate(location.hash.replace('#', '') || 'home');
    });
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('main-nav');
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });
  },

  navigate(page) {
    if (!this.pages.includes(page)) page = 'home';
    this.currentPage = page;
    location.hash = page;
    this.updateNavLinks(page);
    this.render(page);
    window.scrollTo(0, 0);
  },

  refresh() {
    this.render(this.currentPage);
  },

  updateNavLinks(page) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  },

  render(page) {
    const main = document.getElementById('app-main');
    main.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'page-enter';

    switch(page) {
      case 'home':       container.innerHTML = SB.pages.home.render(); break;
      case 'chat':       container.innerHTML = SB.pages.chat.render(); break;
      case 'schemes':    container.innerHTML = SB.pages.schemes.render(); break;
      case 'complaint':  container.innerHTML = SB.pages.complaint.render(); break;
      case 'tracking':   container.innerHTML = SB.pages.tracking.render(); break;
      case 'documents':  container.innerHTML = SB.pages.documents.render(); break;
      case 'offices':    container.innerHTML = SB.pages.offices.render(); break;
      case 'dashboard':  container.innerHTML = SB.pages.dashboard.render(); break;
      case 'admin':      container.innerHTML = SB.pages.admin.render(); break;
      case 'login':      container.innerHTML = SB.pages.login.render(); break;
      default:           container.innerHTML = SB.pages.home.render();
    }

    main.appendChild(container);

    // Init page-specific JS after render
    setTimeout(() => {
      if (SB.pages[page] && SB.pages[page].init) SB.pages[page].init();
    }, 50);
  }
};

function navigateTo(page) {
  SB.router.navigate(page);
  document.querySelectorAll('.lang-dropdown, .user-menu').forEach(el => el.classList.remove('open'));
}
