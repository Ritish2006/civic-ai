// Smart Bharat – Complaint Portal Page
SB.pages.complaint = {
  selectedCategory: '',
  uploadedImage: null,

  render() {
    return `
<div class="complaint-page container">
  <div style="margin-bottom:32px">
    <h1 style="margin-bottom:8px">📢 Complaint Portal</h1>
    <p style="color:var(--text-muted)">File civic complaints with AI auto-categorization and formal complaint generation</p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 380px;gap:24px">
    <div class="card">
      <!-- Category Selection -->
      <h3 style="margin-bottom:16px"><i class="fa fa-tags" style="color:var(--saffron)"></i> Select Category</h3>
      <div class="category-grid" style="margin-bottom:28px">
        ${[
          { id:'road', icon:'fa-road', label:'Road Damage' },
          { id:'garbage', icon:'fa-trash', label:'Garbage' },
          { id:'water', icon:'fa-tint', label:'Water Leakage' },
          { id:'electricity', icon:'fa-bolt', label:'Electricity' },
          { id:'streetlight', icon:'fa-lightbulb-o', label:'Streetlight' },
          { id:'drainage', icon:'fa-water', label:'Drainage' },
          { id:'sanitation', icon:'fa-recycle', label:'Sanitation' },
          { id:'other', icon:'fa-ellipsis-h', label:'Other' }
        ].map(c => `
          <div class="category-btn" id="cat-${c.id}" onclick="SB.pages.complaint.selectCategory('${c.id}','${c.label}')">
            <i class="fa ${c.icon}"></i>
            ${c.label}
          </div>`).join('')}
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Describe the Issue <span class="required">*</span></label>
        <textarea class="form-textarea" id="c-description" placeholder="Describe the civic issue in detail (location, severity, duration)..." rows="4"></textarea>
      </div>

      <!-- Location -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">State</label>
          <select class="form-select" id="c-state">
            <option value="">Select State</option>
            ${['Delhi','Maharashtra','Tamil Nadu','Karnataka','Kerala','Uttar Pradesh','West Bengal','Gujarat','Rajasthan','Telangana'].map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">City / District</label>
          <input type="text" class="form-input" id="c-city" placeholder="e.g. Mumbai">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Specific Address / Landmark</label>
        <input type="text" class="form-input" id="c-address" placeholder="e.g. Near XYZ Metro Station, ABC Road">
      </div>

      <!-- Image Upload -->
      <div class="form-group">
        <label class="form-label">Upload Photo (Optional)</label>
        <div class="upload-zone" id="upload-zone" onclick="document.getElementById('complaint-img').click()" ondragover="SB.pages.complaint.onDragOver(event)" ondrop="SB.pages.complaint.onDrop(event)">
          <i class="fa fa-camera"></i>
          <p style="margin:8px 0 4px;font-weight:600;color:var(--text-primary)">Click or drag photo here</p>
          <p style="font-size:0.82rem;color:var(--text-muted)">JPG, PNG up to 10MB</p>
        </div>
        <input type="file" id="complaint-img" accept="image/*" style="display:none" onchange="SB.pages.complaint.handleImage(this)">
        <div id="img-preview" style="display:none;margin-top:12px">
          <img id="img-preview-src" style="max-height:160px;border-radius:10px;object-fit:cover">
          <button style="margin-top:6px;font-size:0.8rem;color:#EF4444" onclick="SB.pages.complaint.removeImage()">✕ Remove</button>
        </div>
      </div>

      <!-- Contact -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Your Name</label>
          <input type="text" class="form-input" id="c-name" placeholder="Full Name" value="${SB.auth.currentUser?.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone / Email</label>
          <input type="text" class="form-input" id="c-contact" placeholder="Mobile or Email">
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-block" id="submit-complaint-btn" onclick="SB.pages.complaint.submitComplaint()">
        <i class="fa fa-paper-plane"></i> Submit Complaint with AI Analysis
      </button>
    </div>

    <!-- Info Panel -->
    <div>
      <div class="card" style="margin-bottom:16px">
        <h4 style="margin-bottom:12px">⚡ AI Features</h4>
        ${['Auto-detects complaint category from description','Generates a formal complaint letter','Suggests responsible department','Assigns unique Complaint ID','Tracks resolution status'].map(f =>
          `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:0.85rem"><span style="color:#22C55E">✓</span><span>${f}</span></div>`
        ).join('')}
      </div>
      <div class="card" style="margin-bottom:16px">
        <h4 style="margin-bottom:12px">📞 Emergency Helplines</h4>
        ${[
          { n:'Police', num:'100' }, { n:'Ambulance', num:'108' },
          { n:'Fire', num:'101' }, { n:'Disaster', num:'1078' },
          { n:'Women Helpline', num:'1091' }, { n:'Child Helpline', num:'1098' }
        ].map(h =>
          `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem"><span>${h.n}</span><strong style="color:var(--blue)">${h.num}</strong></div>`
        ).join('')}
      </div>
      <div class="card">
        <h4 style="margin-bottom:12px">📋 Recent Complaints</h4>
        <div id="recent-complaints">
          ${this.renderRecentComplaints()}
        </div>
        <button class="btn btn-outline btn-sm btn-block" style="margin-top:12px" onclick="navigateTo('tracking')">
          <i class="fa fa-list"></i> View All
        </button>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  <div class="modal-overlay" id="complaint-success-modal">
    <div class="modal" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:16px">✅</div>
      <h3 style="margin-bottom:8px">Complaint Submitted!</h3>
      <p style="color:var(--text-muted);margin-bottom:20px">Your complaint has been registered and assigned to the relevant department.</p>
      <div style="background:var(--bg-secondary);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:4px">Complaint ID</div>
        <div id="modal-complaint-id" style="font-family:monospace;font-size:1.3rem;font-weight:800;color:var(--blue)"></div>
      </div>
      <div id="modal-formal-complaint" style="background:var(--bg-secondary);border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;font-size:0.85rem;max-height:200px;overflow-y:auto"></div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-primary" style="flex:1" onclick="navigateTo('tracking')"><i class="fa fa-list"></i> Track Status</button>
        <button class="btn btn-outline" style="flex:1" onclick="SB.ui.closeModal('complaint-success-modal')">Close</button>
      </div>
    </div>
  </div>
</div>`;
  },

  renderRecentComplaints() {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    if (!complaints.length) return '<p style="color:var(--text-muted);font-size:0.85rem">No complaints filed yet</p>';
    return complaints.slice(-3).reverse().map(c => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.8rem;font-weight:600">${c.id}</span>
          <span class="status-pill status-${c.status}">${c.status}</span>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">${c.category} · ${c.city}</div>
      </div>`).join('');
  },

  selectCategory(id, label) {
    this.selectedCategory = label;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('cat-' + id)?.classList.add('selected');
  },

  handleImage(input) {
    const file = input.files[0];
    if (!file) return;
    this.uploadedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('img-preview-src').src = e.target.result;
      document.getElementById('img-preview').style.display = 'block';
      document.getElementById('upload-zone').style.display = 'none';
    };
    reader.readAsDataURL(file);
  },

  removeImage() {
    this.uploadedImage = null;
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('complaint-img').value = '';
  },

  onDragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); },
  onDrop(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.getElementById('complaint-img');
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files;
      this.handleImage(input);
    }
  },

  async submitComplaint() {
    const desc = document.getElementById('c-description').value.trim();
    const city = document.getElementById('c-city').value.trim();
    if (!desc) { SB.ui.toast('Please describe the issue', 'warning'); return; }

    const btn = document.getElementById('submit-complaint-btn');
    btn.innerHTML = '<i class="fa fa-spinner animate-spin"></i> AI Analyzing...';
    btn.disabled = true;

    try {
      const result = await SB.api.categorizeComplaint(desc);
      const id = SB.ui.generateComplaintId();
      const complaint = {
        id, description: desc,
        category: this.selectedCategory || result.category || 'Other',
        dept: result.dept || 'Municipal Corporation',
        city: city || document.getElementById('c-state').value,
        formal: result.formal || desc,
        status: 'pending',
        date: new Date().toISOString(),
        timeline: [{ status: 'Submitted', time: new Date().toISOString(), note: 'Complaint registered successfully' }]
      };

      // Save
      const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
      complaints.push(complaint);
      localStorage.setItem('sb_complaints', JSON.stringify(complaints));

      // Show success modal
      document.getElementById('modal-complaint-id').textContent = id;
      document.getElementById('modal-formal-complaint').innerHTML = `
        <strong>Category:</strong> ${complaint.category}<br>
        <strong>Dept:</strong> ${complaint.dept}<br><br>
        <strong>Formal Complaint:</strong><br>${complaint.formal}`;
      SB.ui.openModal('complaint-success-modal');
      SB.ui.toast('Complaint submitted! ID: ' + id, 'success');

      // Reset form
      document.getElementById('c-description').value = '';
      document.getElementById('c-city').value = '';
      this.removeImage();
      this.selectedCategory = '';
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    } catch(e) {
      SB.ui.toast('Error submitting complaint: ' + e.message, 'error');
    }
    btn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Complaint with AI Analysis';
    btn.disabled = false;
  },

  init() {}
};
