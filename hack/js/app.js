// Smart Bharat – Main Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Hide loader after a minimum time and when DOM is ready
  setTimeout(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.style.display = 'none', 400); // Wait for transition
    }
    
    // Initialize Auth
    SB.auth.init();
    
    // Initialize Theme (check local storage or system preference)
    const savedTheme = localStorage.getItem('sb_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-icon').className = 'fa fa-sun';
    }
    
    // Initialize Router
    SB.router.init();
    
  }, 1600); // 1.5s animation + small buffer
});
