// Smart Bharat – Home Page
SB.pages = SB.pages || {};

SB.pages.home = {
  render() {
    const t = (k) => SB.i18n.t(k);
    return `
<!-- HERO -->
<section class="hero-section">
  <div class="blob blob-saffron" style="width:400px;height:400px;top:-100px;right:10%;animation-delay:0s"></div>
  <div class="blob blob-blue" style="width:300px;height:300px;bottom:-50px;left:5%;animation-delay:2s"></div>
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content animate-fadeUp">
        <div class="hero-badge">
          <span>🤖</span> <span>Powered by Gemini AI</span>
          <span style="margin-left:8px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:999px;font-size:0.75rem">NEW</span>
        </div>
        <h1 class="hero-title">${t('hero_title').replace('\n','<br>')}<br><span class="highlight">${t('appName') || 'Smart Bharat'}</span></h1>
        <p class="hero-subtitle">${t('hero_subtitle')}</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" onclick="navigateTo('chat')">
            <i class="fa fa-robot"></i> ${t('ask_ai')}
          </button>
          <button class="btn btn-white btn-lg" onclick="navigateTo('schemes')">
            <i class="fa fa-star"></i> ${t('explore_schemes')}
          </button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat-item">
            <span class="hero-stat-number" id="hs-users">2.4Cr+</span>
            <span class="hero-stat-label">${t('stats_users')}</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-number">1000+</span>
            <span class="hero-stat-label">${t('stats_schemes')}</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-number">36</span>
            <span class="hero-stat-label">${t('stats_states')}</span>
          </div>
        </div>
      </div>
      <div class="hero-image-wrap animate-fadeUp delay-200">
        <div style="position:relative">
          <div style="width:480px;height:480px;border-radius:32px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:32px;flex-direction:column;gap:16px">
            <!-- Mock AI Chat UI inside hero -->
            <div style="width:100%;background:rgba(255,255,255,0.1);border-radius:16px;padding:16px;border:1px solid rgba(255,255,255,0.15)">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF6B00,#FF8C33);display:flex;align-items:center;justify-content:center;font-size:1rem">🤖</div>
                <div>
                  <div style="color:#fff;font-weight:700;font-size:0.88rem">Smart Bharat AI</div>
                  <div style="color:rgba(255,255,255,0.5);font-size:0.72rem">● Online</div>
                </div>
              </div>
              <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px;margin-bottom:10px">
                <p style="color:rgba(255,255,255,0.85);font-size:0.82rem;line-height:1.5">Namaste! 🙏 I can help you with PM Kisan, Ayushman Bharat, Passport applications and 1000+ more services.</p>
              </div>
              <div style="background:rgba(0,82,165,0.4);border-radius:12px;padding:10px;margin-left:auto;max-width:80%">
                <p style="color:#fff;font-size:0.82rem">How do I apply for PM Kisan?</p>
              </div>
            </div>
            <div style="display:flex;gap:10px;width:100%">
              ${['🌾 PM Kisan', '🏥 Ayushman', '🛂 Passport', '🗳️ Voter ID'].map(s =>
                `<div style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:8px 4px;text-align:center;color:rgba(255,255,255,0.8);font-size:0.7rem;font-weight:600">${s}</div>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section features-section">
  <div class="container">
    <div class="section-header">
      <div class="label"><i class="fa fa-bolt"></i> ${t('features_label')}</div>
      <h2>${t('features_title')}</h2>
      <p>${t('features_subtitle')}</p>
    </div>
    <div class="grid grid-3" style="grid-template-columns:repeat(3,1fr)">
      ${[
        { icon:'fa-robot', color:'blue', title:'AI Chat Assistant', desc:'ChatGPT-like interface with streaming responses, voice input, file upload, and markdown support for all civic queries.', page:'chat' },
        { icon:'fa-star', color:'saffron', title:'Scheme Recommender', desc:'Enter your profile and get personalized government scheme recommendations with eligibility and application steps.', page:'schemes' },
        { icon:'fa-exclamation-triangle', color:'green', title:'Complaint Portal', desc:'File civic complaints with photo upload. AI auto-categorizes and generates formal complaints instantly.', page:'complaint' },
        { icon:'fa-file-text', color:'blue', title:'Document Assistant', desc:'Step-by-step guides for Passport, Driving License, Voter ID, PAN, Aadhaar and more with fees and FAQs.', page:'documents' },
        { icon:'fa-map-marker', color:'saffron', title:'Nearby Offices', desc:'Interactive map showing Passport offices, RTOs, Police stations, Collector offices and more near you.', page:'offices' },
        { icon:'fa-globe', color:'green', title:'Multilingual Support', desc:'Full support for English, Hindi, Tamil, Telugu, Kannada and Malayalam. Switch language instantly.', page:'home' }
      ].map(f => `
        <div class="feature-card hover-lift" onclick="navigateTo('${f.page}')">
          <div class="card-icon card-icon-${f.color}"><i class="fa ${f.icon}"></i></div>
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
          <div style="margin-top:16px;color:var(--blue);font-size:0.85rem;font-weight:600">Learn more <i class="fa fa-arrow-right"></i></div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- STATS -->
<section class="section stat-section">
  <div class="container">
    <div class="grid grid-4">
      ${[
        { n: 24000000, label: t('stats_users'), suffix: '+' },
        { n: 1000, label: t('stats_schemes'), suffix: '+' },
        { n: 850000, label: t('stats_complaints'), suffix: '+' },
        { n: 36, label: t('stats_states'), suffix: '' }
      ].map((s, i) => `
        <div class="stat-card">
          <div class="stat-number" id="stat-${i}">${s.suffix}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="label"><i class="fa fa-cog"></i> SIMPLE PROCESS</div>
      <h2>${t('how_it_works')}</h2>
      <p>Get help in just 3 simple steps</p>
    </div>
    <div class="grid grid-3">
      ${[
        { n:'1', icon:'fa-user-plus', title:'Create Account', desc:'Sign up with email or Google. Your data is secure and encrypted.' },
        { n:'2', icon:'fa-comments', title:'Ask Your Question', desc:'Type or speak your question in any of 6 supported Indian languages.' },
        { n:'3', icon:'fa-check-circle', title:'Get Instant Help', desc:'Receive AI-powered answers with official links and step-by-step guidance.' }
      ].map(s => `
        <div class="step-card card hover-lift">
          <div class="step-number">${s.n}</div>
          <div style="font-size:2rem;margin-bottom:12px;color:var(--blue)"><i class="fa ${s.icon}"></i></div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section testimonials-section">
  <div class="container">
    <div class="section-header">
      <div class="label"><i class="fa fa-heart"></i> CITIZEN STORIES</div>
      <h2>${t('testimonials')}</h2>
    </div>
    <div class="grid grid-3">
      ${[
        { text: '"Smart Bharat helped me apply for PM Kisan in just 10 minutes. The step-by-step guide in Hindi was extremely helpful!"', name: 'Ramesh Kumar', role: 'Farmer, Uttar Pradesh', rating: 5 },
        { text: '"I got my passport renewal done without any agent! The document checklist was spot on and saved me ₹5,000 in agent fees."', name: 'Priya Nair', role: 'Teacher, Kerala', rating: 5 },
        { text: '"Filed a road damage complaint and got it resolved in 3 days. The tracking system is amazing. Super impressed!"', name: 'Murugan S.', role: 'Auto Driver, Tamil Nadu', rating: 5 }
      ].map(t => `
        <div class="testimonial-card hover-lift">
          <div class="stars">${'⭐'.repeat(t.rating)}</div>
          <p class="testimonial-text">${t.text}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.name.charAt(0)}</div>
            <div>
              <div class="testimonial-name">${t.name}</div>
              <div class="testimonial-role">${t.role}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section" style="background:var(--gradient-hero)">
  <div class="container" style="text-align:center">
    <h2 style="color:#fff;margin-bottom:16px">Ready to Access Your Government Services?</h2>
    <p style="color:rgba(255,255,255,0.7);max-width:500px;margin:0 auto 32px">Join 2.4 crore citizens already using Smart Bharat AI</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" onclick="navigateTo('chat')">
        <i class="fa fa-robot"></i> Start with AI Assistant
      </button>
      <button class="btn btn-white btn-lg" onclick="navigateTo('login')">
        <i class="fa fa-user-plus"></i> Create Free Account
      </button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="flag-stripe"></div>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">🇮🇳 Smart Bharat</div>
        <p class="footer-tagline">${t('footer_desc')}</p>
        <div style="display:flex;gap:12px;margin-top:16px">
          ${['fa-twitter','fa-facebook','fa-instagram','fa-youtube'].map(i => `
            <a href="#" style="width:36px;height:36px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);transition:all 0.2s" onmouseover="this.style.background='var(--saffron)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.6)'">
              <i class="fa ${i}"></i>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="footer-links">
        <h4>Services</h4>
        <ul>
          <li><a href="#" onclick="navigateTo('chat')">AI Assistant</a></li>
          <li><a href="#" onclick="navigateTo('schemes')">Scheme Finder</a></li>
          <li><a href="#" onclick="navigateTo('complaint')">File Complaint</a></li>
          <li><a href="#" onclick="navigateTo('documents')">Document Help</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="https://india.gov.in" target="_blank">India.gov.in</a></li>
          <li><a href="https://mygov.in" target="_blank">MyGov.in</a></li>
          <li><a href="https://digilocker.gov.in" target="_blank">DigiLocker</a></li>
          <li><a href="https://umang.gov.in" target="_blank">UMANG App</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Contact</h4>
        <ul>
          <li><a href="#">📞 1800-11-0001</a></li>
          <li><a href="#">📧 help@smartbharat.in</a></li>
          <li><a href="#">📍 New Delhi, India</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 Smart Bharat. Made with ❤️ for India.</span>
      <span>A Digital India Initiative</span>
    </div>
  </div>
</footer>`;
  },

  init() {
    // Animate stats
    const stats = [
      { id: 'stat-0', n: 24000000, suffix: '+' },
      { id: 'stat-1', n: 1000, suffix: '+' },
      { id: 'stat-2', n: 850000, suffix: '+' },
      { id: 'stat-3', n: 36, suffix: '' }
    ];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stats.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) SB.ui.animateCount(el, s.n);
          });
          observer.disconnect();
        }
      });
    });
    const statSection = document.querySelector('.stat-section');
    if (statSection) observer.observe(statSection);

    // Animate on scroll
    const animEls = document.querySelectorAll('.feature-card, .step-card, .testimonial-card');
    const aObs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('animate-fadeUp'), i * 80);
          aObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    animEls.forEach(el => { el.style.opacity = '0'; aObs.observe(el); });
  }
};
