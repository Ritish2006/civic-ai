// Smart Bharat – Documents Assistant Page
SB.pages.documents = {
  activeService: 'passport',

  render() {
    return `
<div class="documents-page container">
  <div style="margin-bottom:32px">
    <h1 style="margin-bottom:8px">📄 Document Assistant</h1>
    <p style="color:var(--text-muted)">Step-by-step guides, required documents, and official links for government services</p>
  </div>

  <div class="doc-service-grid">
    ${Object.entries(SB.documentServices).map(([key, s]) => `
      <div class="doc-service-card ${key === this.activeService ? 'active' : ''}" onclick="SB.pages.documents.selectService('${key}')">
        <i class="fa ${s.icon}"></i>
        <span>${s.name}</span>
      </div>
    `).join('')}
  </div>

  <div id="doc-content-area">
    ${this.renderActiveService()}
  </div>
</div>`;
  },

  renderActiveService() {
    const s = SB.documentServices[this.activeService];
    if (!s) return '';
    return `
    <div class="doc-detail-box animate-fadeUp">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:16px">
        <div>
          <h2 style="display:flex;align-items:center;gap:12px">
            <i class="fa ${s.icon}" style="color:var(--blue)"></i> ${s.name} Guide
          </h2>
          <p style="color:var(--text-secondary);margin-top:8px">${s.description}</p>
        </div>
        <div style="display:flex;gap:12px">
          <a href="${s.portal}" target="_blank" class="btn btn-primary">
            <i class="fa fa-external-link"></i> Official Portal
          </a>
          <button class="btn btn-outline" onclick="SB.ui.copyToClipboard('${s.portal}', 'Link Copied!')">
            <i class="fa fa-link"></i> Copy Link
          </button>
        </div>
      </div>

      <div class="grid grid-2" style="margin-bottom:32px">
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px">
          <h4 style="margin-bottom:12px"><i class="fa fa-clock-o"></i> Processing Time</h4>
          <p style="font-size:0.9rem">${s.processingTime}</p>
        </div>
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px">
          <h4 style="margin-bottom:12px"><i class="fa fa-money"></i> Estimated Fees</h4>
          <ul style="font-size:0.9rem">
            ${Object.entries(s.fees).map(([k,v]) => `<li><strong>${k.toUpperCase()}:</strong> ${v}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="grid grid-2">
        <div>
          <h3 style="margin-bottom:16px"><i class="fa fa-list-ol"></i> Step-by-Step Process</h3>
          <div>
            ${s.steps.map((step, i) => `
              <div class="doc-step">
                <div class="doc-step-num">${i + 1}</div>
                <div class="doc-step-content">
                  <h4>${step.title}</h4>
                  <p>${step.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <h3 style="margin-bottom:16px"><i class="fa fa-file-text-o"></i> Required Documents</h3>
          <ul style="background:var(--bg-secondary);padding:20px;border-radius:12px;list-style:none">
            ${s.requiredDocs.map(d => `
              <li style="margin-bottom:12px;display:flex;gap:8px">
                <i class="fa fa-check-circle" style="color:var(--india-green);margin-top:2px"></i>
                <span style="font-size:0.9rem;color:var(--text-secondary)">${d}</span>
              </li>
            `).join('')}
          </ul>

          <h3 style="margin:24px 0 16px"><i class="fa fa-question-circle-o"></i> FAQs</h3>
          <div>
            ${s.faqs.map(faq => `
              <div style="margin-bottom:16px">
                <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px">Q: ${faq.q}</div>
                <div style="font-size:0.85rem;color:var(--text-muted)">A: ${faq.a}</div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top:24px;padding:16px;background:rgba(255,107,0,0.1);border-radius:10px;display:inline-block">
             <strong>Helpline:</strong> <span style="color:var(--saffron);font-weight:700">${s.helpline}</span>
          </div>
        </div>
      </div>
    </div>`;
  },

  selectService(key) {
    this.activeService = key;
    document.querySelectorAll('.doc-service-card').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('doc-content-area').innerHTML = this.renderActiveService();
  },

  init() {}
};
