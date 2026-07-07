// Smart Bharat – Login/Signup Page
SB.pages.login = {
  isLoginMode: true,

  render() {
    return `
<div class="login-page">
  <div class="login-card animate-scaleIn">
    <div class="login-header">
      <div class="brand">🇮🇳</div>
      <h2 id="auth-title">${this.isLoginMode ? 'Welcome Back' : 'Create an Account'}</h2>
      <p id="auth-subtitle">${this.isLoginMode ? 'Login to access your civic dashboard' : 'Join Smart Bharat to access government services'}</p>
    </div>

    <!-- Demo Accounts Note -->
    <div style="background:var(--blue-pale);border:1px solid var(--blue);border-radius:10px;padding:12px;margin-bottom:20px;font-size:0.8rem;color:var(--text-primary)">
      <strong>Demo Accounts:</strong><br>
      User: <code>demo@smartbharat.in</code> / <code>demo123</code><br>
      Admin: <code>admin@smartbharat.in</code> / <code>admin123</code>
    </div>

    <form id="auth-form" onsubmit="SB.pages.login.handleSubmit(event)">
      <div class="form-group" id="name-group" style="${this.isLoginMode ? 'display:none' : ''}">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-input" id="auth-name" placeholder="Rahul Sharma">
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="auth-email" placeholder="demo@smartbharat.in" required value="demo@smartbharat.in">
      </div>
      <div class="form-group">
        <div style="display:flex;justify-content:space-between">
          <label class="form-label">Password</label>
          ${this.isLoginMode ? '<a href="#" style="font-size:0.8rem;color:var(--blue)">Forgot?</a>' : ''}
        </div>
        <input type="password" class="form-input" id="auth-password" placeholder="••••••••" required value="demo123">
      </div>

      <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit-btn" style="margin-top:24px">
        ${this.isLoginMode ? 'Login to Account' : 'Create Account'}
      </button>
    </form>

    <div class="divider-text">OR CONTINUE WITH</div>

    <button class="social-btn" onclick="SB.pages.login.handleGoogleLogin()" id="google-btn">
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google">
      Google
    </button>

    <div style="text-align:center;margin-top:24px;font-size:0.9rem">
      ${this.isLoginMode ? "Don't have an account?" : "Already have an account?"}
      <a href="#" style="color:var(--blue);font-weight:600" onclick="SB.pages.login.toggleMode()">
        ${this.isLoginMode ? 'Sign up' : 'Log in'}
      </a>
    </div>
  </div>
</div>`;
  },

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    SB.router.refresh();
  },

  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('auth-submit-btn');
    const email = document.getElementById('auth-email').value;
    const pwd = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    btn.innerHTML = '<i class="fa fa-spinner animate-spin"></i> Processing...';
    btn.disabled = true;

    try {
      let user;
      if (this.isLoginMode) {
        user = await SB.auth.login(email, pwd);
        SB.ui.toast(`Welcome back, ${user.name}!`, 'success');
      } else {
        if (!name) throw new Error('Name is required');
        user = await SB.auth.register(name, email, pwd);
        SB.ui.toast(`Account created! Welcome, ${user.name}!`, 'success');
      }
      
      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'admin') navigateTo('admin');
        else navigateTo('dashboard');
      }, 500);
      
    } catch(err) {
      SB.ui.toast(err.message, 'error');
      btn.innerHTML = this.isLoginMode ? 'Login to Account' : 'Create Account';
      btn.disabled = false;
    }
  },

  async handleGoogleLogin() {
    const btn = document.getElementById('google-btn');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa fa-spinner animate-spin"></i> Connecting...';
    btn.disabled = true;

    try {
      const user = await SB.auth.loginWithGoogle();
      SB.ui.toast(`Logged in with Google as ${user.name}`, 'success');
      setTimeout(() => navigateTo('dashboard'), 500);
    } catch(err) {
      SB.ui.toast('Google login failed', 'error');
      btn.innerHTML = oldHtml;
      btn.disabled = false;
    }
  },

  init() {
    // If already logged in, redirect
    if (SB.auth.currentUser) {
      navigateTo(SB.auth.currentUser.role === 'admin' ? 'admin' : 'dashboard');
    }
  }
};
