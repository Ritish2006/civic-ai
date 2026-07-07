// Smart Bharat – Auth Module (demo mode + Firebase stub)
SB.auth = {
  currentUser: null,
  demoUsers: {
    'demo@smartbharat.in': { password: 'demo123', name: 'Rahul Sharma', email: 'demo@smartbharat.in', role: 'user' },
    'admin@smartbharat.in': { password: 'admin123', name: 'Admin User', email: 'admin@smartbharat.in', role: 'admin' }
  },

  init() {
    const saved = localStorage.getItem('sb_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.updateUI();
    }
  },

  login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.demoUsers[email];
        if (user && user.password === password) {
          this.currentUser = { name: user.name, email: user.email, role: user.role };
          localStorage.setItem('sb_user', JSON.stringify(this.currentUser));
          this.updateUI();
          resolve(this.currentUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  },

  loginWithGoogle() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = { name: 'Google User', email: 'google@gmail.com', role: 'user' };
        this.currentUser = user;
        localStorage.setItem('sb_user', JSON.stringify(user));
        this.updateUI();
        resolve(user);
      }, 1200);
    });
  },

  register(name, email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = { name, email, role: 'user' };
        this.currentUser = user;
        localStorage.setItem('sb_user', JSON.stringify(user));
        this.updateUI();
        resolve(user);
      }, 1200);
    });
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('sb_user');
    this.updateUI();
    navigateTo('home');
    SB.ui.toast('Logged out successfully', 'info');
  },

  updateUI() {
    const authSection = document.getElementById('auth-section');
    const avatarSection = document.getElementById('user-avatar-section');
    const avatar = document.getElementById('user-avatar');
    const menuName = document.getElementById('user-menu-name');
    const menuEmail = document.getElementById('user-menu-email');

    if (this.currentUser) {
      authSection.style.display = 'none';
      avatarSection.style.display = 'flex';
      avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
      if (menuName) menuName.textContent = this.currentUser.name;
      if (menuEmail) menuEmail.textContent = this.currentUser.email;
    } else {
      authSection.style.display = 'flex';
      avatarSection.style.display = 'none';
    }
  },

  requireAuth() {
    if (!this.currentUser) {
      SB.ui.toast('Please login to continue', 'warning');
      navigateTo('login');
      return false;
    }
    return true;
  }
};

function logout() { SB.auth.logout(); }
function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('open');
}
