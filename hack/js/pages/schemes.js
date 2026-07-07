// Smart Bharat – Schemes Recommender Page
SB.pages.schemes = {
  profileSubmitted: false,
  recommendations: [],

  render() {
    return `
<div class="schemes-page container">
  <div style="margin-bottom:32px">
    <h1 style="margin-bottom:8px">🌟 Government Scheme Finder</h1>
    <p style="color:var(--text-muted)">Enter your profile to get personalized scheme recommendations powered by AI</p>
  </div>

  <!-- Profile Form -->
  <div style="display:grid;grid-template-columns:360px 1fr;gap:24px;align-items:start">
    <div class="card" style="position:sticky;top:90px">
      <h3 style="margin-bottom:20px"><i class="fa fa-user-circle" style="color:var(--blue)"></i> Your Profile</h3>
      <div class="form-group">
        <label class="form-label">Age <span class="required">*</span></label>
        <input type="number" class="form-input" id="p-age" placeholder="e.g. 28" min="1" max="100">
      </div>
      <div class="form-group">
        <label class="form-label">Gender</label>
        <select class="form-select" id="p-gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">State <span class="required">*</span></label>
        <select class="form-select" id="p-state">
          <option value="">Select State</option>
          ${['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttarakhand','Uttar Pradesh','West Bengal'].map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Occupation</label>
        <select class="form-select" id="p-occupation">
          <option value="farmer">Farmer</option>
          <option value="student">Student</option>
          <option value="business">Business Owner</option>
          <option value="salaried">Salaried Employee</option>
          <option value="unemployed">Unemployed</option>
          <option value="self-employed">Self-Employed</option>
          <option value="senior">Senior Citizen</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Annual Income (₹)</label>
        <input type="number" class="form-input" id="p-income" placeholder="e.g. 150000">
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="p-category">
          <option value="general">General</option>
          <option value="OBC">OBC</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="minority">Minority</option>
          <option value="EWS">EWS</option>
        </select>
      </div>
      <button class="btn btn-primary btn-block" id="scheme-recommend-btn" onclick="SB.pages.schemes.getRecommendations()">
        <i class="fa fa-search"></i> Find My Schemes
      </button>
    </div>

    <div id="schemes-results">
      <!-- Browse All -->
      <div style="margin-bottom:24px">
        <div class="scheme-filter-bar">
          <input type="text" class="form-input" id="scheme-search" placeholder="🔍 Search schemes..." oninput="SB.pages.schemes.filterSchemes(this.value)" style="flex:1">
          ${['All','Agriculture','Health','Housing','Business','Education'].map(c =>
            `<button class="btn btn-ghost btn-sm scheme-cat-btn" data-cat="${c}" onclick="SB.pages.schemes.filterByCategory('${c}')">${c}</button>`
          ).join('')}
        </div>
      </div>
      <div class="grid grid-2" id="schemes-grid">
        ${SB.govtSchemes.map(s => this.renderSchemeCard(s)).join('')}
      </div>
    </div>
  </div>

  <!-- AI Recommendations Modal -->
  <div class="modal-overlay" id="ai-schemes-modal">
    <div class="modal" style="max-width:700px">
      <div class="modal-header">
        <h3>🤖 AI Scheme Recommendations</h3>
        <button class="modal-close" onclick="SB.ui.closeModal('ai-schemes-modal')"><i class="fa fa-times"></i></button>
      </div>
      <div id="ai-schemes-content" style="max-height:60vh;overflow-y:auto"></div>
    </div>
  </div>

  <!-- Scheme Detail Modal -->
  <div class="modal-overlay" id="scheme-detail-modal">
    <div class="modal" style="max-width:640px">
      <div class="modal-header">
        <h3 id="modal-scheme-name">Scheme Details</h3>
        <button class="modal-close" onclick="SB.ui.closeModal('scheme-detail-modal')"><i class="fa fa-times"></i></button>
      </div>
      <div id="scheme-detail-content"></div>
    </div>
  </div>
</div>`;
  },

  renderSchemeCard(s) {
    const catColors = { Agriculture:'saffron', Health:'green', Housing:'blue', Business:'saffron', Education:'green' };
    return `
    <div class="scheme-card hover-lift">
      <div class="scheme-card-header">
        <div>
          <div class="badge badge-${catColors[s.category]||'blue'}" style="margin-bottom:6px">${s.category}</div>
          <div class="scheme-title">${s.name}</div>
          <div class="scheme-ministry">${s.ministry}</div>
        </div>
      </div>
      <p class="scheme-desc">${s.description}</p>
      <div class="scheme-tags">
        ${s.tags.map(t => `<span class="badge badge-blue">${t}</span>`).join('')}
      </div>
      <ul class="scheme-benefits">
        ${s.benefits.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="SB.pages.schemes.showDetail(${s.id})">
          <i class="fa fa-info-circle"></i> Details
        </button>
        <a href="${s.applyUrl}" target="_blank" class="btn btn-primary btn-sm">
          <i class="fa fa-external-link"></i> Apply Now
        </a>
      </div>
    </div>`;
  },

  async getRecommendations() {
    const age = document.getElementById('p-age').value;
    const state = document.getElementById('p-state').value;
    if (!age || !state) { SB.ui.toast('Please fill Age and State', 'warning'); return; }

    const btn = document.getElementById('scheme-recommend-btn');
    btn.innerHTML = '<i class="fa fa-spinner animate-spin"></i> Finding Schemes...';
    btn.disabled = true;

    const profile = {
      age, state,
      gender: document.getElementById('p-gender').value,
      occupation: document.getElementById('p-occupation').value,
      income: document.getElementById('p-income').value || '200000',
      category: document.getElementById('p-category').value
    };

    try {
      SB.ui.openModal('ai-schemes-modal');
      document.getElementById('ai-schemes-content').innerHTML = `<div style="padding:40px;text-align:center"><div class="typing-indicator" style="justify-content:center"><span></span><span></span><span></span></div><p style="margin-top:12px;color:var(--text-muted)">AI is analyzing your profile...</p></div>`;

      const result = await SB.api.recommendSchemes(profile);
      if (typeof result === 'string') {
        document.getElementById('ai-schemes-content').innerHTML = `<div style="padding:8px">${SB.ui.renderMarkdown(result)}</div>`;
      } else {
        document.getElementById('ai-schemes-content').innerHTML = result.map(s => this.renderSchemeCard(s)).join('');
      }
    } catch(e) {
      SB.ui.toast('Failed to get recommendations: ' + e.message, 'error');
      SB.ui.closeModal('ai-schemes-modal');
    }
    btn.innerHTML = '<i class="fa fa-search"></i> Find My Schemes';
    btn.disabled = false;
  },

  showDetail(id) {
    const s = SB.govtSchemes.find(x => x.id === id);
    if (!s) return;
    document.getElementById('modal-scheme-name').textContent = s.name;
    document.getElementById('scheme-detail-content').innerHTML = `
      <div class="badge badge-blue" style="margin-bottom:12px">${s.category} · ${s.ministry}</div>
      <p style="margin-bottom:16px">${s.description}</p>
      <h4 style="margin-bottom:8px">✅ Benefits</h4>
      <ul style="margin-bottom:16px;padding-left:20px">${s.benefits.map(b=>`<li style="margin-bottom:4px;color:var(--text-secondary)">${b}</li>`).join('')}</ul>
      <h4 style="margin-bottom:8px">👤 Eligibility</h4>
      <p style="margin-bottom:16px;color:var(--text-secondary)">${s.eligibility}</p>
      <h4 style="margin-bottom:8px">📄 Required Documents</h4>
      <ul style="margin-bottom:24px;padding-left:20px">${s.documents.map(d=>`<li style="margin-bottom:4px;color:var(--text-secondary)">${d}</li>`).join('')}</ul>
      <a href="${s.applyUrl}" target="_blank" class="btn btn-primary btn-block">
        <i class="fa fa-external-link"></i> Apply on Official Portal
      </a>`;
    SB.ui.openModal('scheme-detail-modal');
  },

  filterSchemes(query) {
    const q = query.toLowerCase();
    const filtered = SB.govtSchemes.filter(s =>
      s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.includes(q))
    );
    document.getElementById('schemes-grid').innerHTML = filtered.map(s => this.renderSchemeCard(s)).join('') || '<p style="color:var(--text-muted)">No schemes found</p>';
  },

  filterByCategory(cat) {
    document.querySelectorAll('.scheme-cat-btn').forEach(b => b.classList.toggle('btn-blue', b.dataset.cat === cat));
    const filtered = cat === 'All' ? SB.govtSchemes : SB.govtSchemes.filter(s => s.category === cat);
    document.getElementById('schemes-grid').innerHTML = filtered.map(s => this.renderSchemeCard(s)).join('') || '<p style="color:var(--text-muted)">No schemes found</p>';
  },

  init() {}
};
