// Smart Bharat – User Dashboard Page
SB.pages.dashboard = {
  render() {
    if (!SB.auth.requireAuth()) return '';
    const user = SB.auth.currentUser;
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const pendingCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;
    
    return `
<div class="dashboard-page container animate-fadeUp">
  <div style="margin-bottom:32px">
    <h1 style="margin-bottom:8px">👤 My Dashboard</h1>
    <p style="color:var(--text-muted)">Manage your profile, complaints, and saved schemes.</p>
  </div>
  
  <div class="dashboard-grid">
    <!-- Sidebar -->
    <div class="dashboard-sidebar">
      <div class="dashboard-sidebar-card" style="text-align:center">
        <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <h3 style="margin-bottom:4px">${user.name}</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">${user.email}</p>
        <div class="badge badge-blue">Citizen Profile</div>
      </div>
      
      <div class="dashboard-sidebar-card" style="padding:12px">
        <div class="dashboard-nav-item active" onclick="SB.ui.switchTab('d-tab-overview', 'd-panel-overview', 'dashboard')">
          <i class="fa fa-th-large"></i> Overview
        </div>
        <div class="dashboard-nav-item" onclick="SB.ui.switchTab('d-tab-complaints', 'd-panel-complaints', 'dashboard')">
          <i class="fa fa-exclamation-triangle"></i> My Complaints
          ${pendingCount > 0 ? `<span style="margin-left:auto;background:#EF4444;color:white;border-radius:10px;padding:2px 8px;font-size:0.7rem;font-weight:700">${pendingCount}</span>` : ''}
        </div>
        <div class="dashboard-nav-item" onclick="SB.ui.switchTab('d-tab-schemes', 'd-panel-schemes', 'dashboard')">
          <i class="fa fa-star"></i> Saved Schemes
        </div>
        <div class="dashboard-nav-item" onclick="SB.ui.switchTab('d-tab-docs', 'd-panel-docs', 'dashboard')">
          <i class="fa fa-file-text"></i> My Documents
        </div>
        <div class="dashboard-nav-item" onclick="SB.ui.switchTab('d-tab-settings', 'd-panel-settings', 'dashboard')">
          <i class="fa fa-cog"></i> Settings
        </div>
        <div class="divider" style="margin:8px 0"></div>
        <div class="dashboard-nav-item" style="color:#EF4444" onclick="logout()">
          <i class="fa fa-sign-out"></i> Logout
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div>
      <!-- Overview Panel -->
      <div id="d-panel-overview" class="tab-panel active" data-group="dashboard">
        <div class="grid grid-3" style="margin-bottom:24px">
          <div class="card card-gradient">
            <h4 style="margin-bottom:12px;color:var(--text-secondary)"><i class="fa fa-exclamation-circle"></i> Active Complaints</h4>
            <div style="font-size:2rem;font-weight:800;color:var(--blue)">${pendingCount}</div>
          </div>
          <div class="card card-gradient">
            <h4 style="margin-bottom:12px;color:var(--text-secondary)"><i class="fa fa-check-circle"></i> Resolved</h4>
            <div style="font-size:2rem;font-weight:800;color:var(--india-green)">${complaints.filter(c => c.status === 'resolved').length}</div>
          </div>
          <div class="card card-gradient">
            <h4 style="margin-bottom:12px;color:var(--text-secondary)"><i class="fa fa-star"></i> Saved Schemes</h4>
            <div style="font-size:2rem;font-weight:800;color:var(--saffron)">3</div>
          </div>
        </div>
        
        <div class="card" style="margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h4>Recent Activity</h4>
          </div>
          <div class="timeline">
            ${complaints.length > 0 ? `
              <div class="timeline-item">
                <div class="timeline-dot active"><i class="fa fa-plus"></i></div>
                <div class="timeline-body">
                  <div class="timeline-title">Filed Complaint ${complaints[complaints.length-1].id}</div>
                  <div class="timeline-time">${SB.ui.formatDate(complaints[complaints.length-1].date)}</div>
                </div>
              </div>
            ` : ''}
            <div class="timeline-item">
              <div class="timeline-dot"><i class="fa fa-comment"></i></div>
              <div class="timeline-body">
                <div class="timeline-title">Chatted with AI Assistant</div>
                <div class="timeline-time">Today, 10:30 AM</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"><i class="fa fa-user"></i></div>
              <div class="timeline-body">
                <div class="timeline-title">Account Created</div>
                <div class="timeline-time">Just now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Complaints Panel -->
      <div id="d-panel-complaints" class="tab-panel" data-group="dashboard">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3>My Complaints</h3>
            <button class="btn btn-primary btn-sm" onclick="navigateTo('complaint')">File New</button>
          </div>
          ${complaints.length === 0 ? '<p style="color:var(--text-muted)">No complaints filed yet.</p>' : ''}
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${complaints.slice().reverse().map(c => `
                  <tr>
                    <td style="font-family:monospace;font-weight:600">${c.id}</td>
                    <td>${c.category}</td>
                    <td>${SB.ui.formatDate(c.date)}</td>
                    <td><span class="status-pill status-${c.status}">${c.status}</span></td>
                    <td><button class="btn btn-ghost btn-sm" onclick="navigateTo('tracking'); setTimeout(()=>SB.pages.tracking.showDetail('${c.id}'),100)">View</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Placeholder Panels -->
      <div id="d-panel-schemes" class="tab-panel" data-group="dashboard">
        <div class="card" style="text-align:center;padding:60px 20px">
          <div style="font-size:3rem;margin-bottom:16px">⭐</div>
          <h3>Saved Schemes</h3>
          <p style="color:var(--text-muted);margin-bottom:24px">You have 3 saved schemes.</p>
          <button class="btn btn-outline" onclick="navigateTo('schemes')">Explore More Schemes</button>
        </div>
      </div>
      
      <div id="d-panel-docs" class="tab-panel" data-group="dashboard">
        <div class="card" style="text-align:center;padding:60px 20px">
           <div style="font-size:3rem;margin-bottom:16px">📁</div>
           <h3>My Documents</h3>
           <p style="color:var(--text-muted)">DigiLocker integration coming soon.</p>
        </div>
      </div>
      
      <div id="d-panel-settings" class="tab-panel" data-group="dashboard">
        <div class="card">
          <h3 style="margin-bottom:20px">Account Settings</h3>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" value="${user.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="${user.email}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Language Preference</label>
            <select class="form-select" onchange="SB.i18n.setLang(this.value)">
              <option value="en" ${SB.i18n.currentLang==='en'?'selected':''}>English</option>
              <option value="hi" ${SB.i18n.currentLang==='hi'?'selected':''}>हिन्दी (Hindi)</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="SB.ui.toast('Settings saved', 'success')">Save Changes</button>
        </div>
      </div>
      
    </div>
  </div>
</div>`;
  },
  
  init() {
    // Hook up tab clicks manually since they share IDs globally
    document.querySelectorAll('.dashboard-nav-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.dashboard-nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
};
