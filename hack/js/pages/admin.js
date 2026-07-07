// Smart Bharat – Admin Dashboard Page
SB.pages.admin = {
  render() {
    if (!SB.auth.currentUser || SB.auth.currentUser.role !== 'admin') {
      setTimeout(() => {
        SB.ui.toast('Access Denied. Admin privileges required.', 'error');
        navigateTo('home');
      }, 100);
      return '';
    }

    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    return `
<div class="admin-page container animate-fadeUp">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
    <div>
      <h1 style="margin-bottom:8px">🛡️ Admin Portal</h1>
      <p style="color:var(--text-muted)">Manage civic complaints and system analytics</p>
    </div>
    <div class="badge badge-saffron" style="font-size:0.9rem;padding:8px 16px">Admin Access</div>
  </div>

  <div class="grid grid-4" style="margin-bottom:32px">
    <div class="admin-stat">
      <div class="admin-stat-icon" style="background:var(--blue-pale);color:var(--blue)"><i class="fa fa-list"></i></div>
      <div>
        <div class="admin-stat-value">${total}</div>
        <div class="admin-stat-label">Total Complaints</div>
      </div>
    </div>
    <div class="admin-stat">
      <div class="admin-stat-icon" style="background:rgba(234,179,8,0.1);color:#B45309"><i class="fa fa-clock-o"></i></div>
      <div>
        <div class="admin-stat-value">${pending}</div>
        <div class="admin-stat-label">Pending Review</div>
      </div>
    </div>
    <div class="admin-stat">
      <div class="admin-stat-icon" style="background:var(--india-green-pale);color:var(--india-green)"><i class="fa fa-check"></i></div>
      <div>
        <div class="admin-stat-value">${resolved}</div>
        <div class="admin-stat-label">Resolved</div>
      </div>
    </div>
    <div class="admin-stat">
      <div class="admin-stat-icon" style="background:rgba(139,92,246,0.1);color:#8B5CF6"><i class="fa fa-robot"></i></div>
      <div>
        <div class="admin-stat-value">845</div>
        <div class="admin-stat-label">AI Queries Today</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3>Complaint Management</h3>
      <input type="text" class="form-input" placeholder="Search ID or Keyword..." style="width:250px" oninput="SB.pages.admin.filterTable(this.value)">
    </div>
    
    <div class="data-table-wrap">
      <table class="data-table" id="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Location</th>
            <th>Date Filed</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.slice().reverse().map(c => `
            <tr data-search="${c.id} ${c.category} ${c.city}">
              <td style="font-family:monospace;font-weight:600">${c.id}</td>
              <td>${c.category}</td>
              <td>${c.city}</td>
              <td>${SB.ui.formatDate(c.date)}</td>
              <td>
                <select class="form-select form-select-sm" style="padding:4px 8px;font-size:0.8rem;background:transparent;border:1px solid var(--border)" onchange="SB.pages.admin.updateStatus('${c.id}', this.value)">
                  <option value="pending" ${c.status==='pending'?'selected':''}>Pending</option>
                  <option value="progress" ${c.status==='progress'?'selected':''}>In Progress</option>
                  <option value="resolved" ${c.status==='resolved'?'selected':''}>Resolved</option>
                  <option value="rejected" ${c.status==='rejected'?'selected':''}>Rejected</option>
                </select>
              </td>
              <td><button class="btn btn-ghost btn-sm" onclick="navigateTo('tracking'); setTimeout(()=>SB.pages.tracking.showDetail('${c.id}'),100)">View</button></td>
            </tr>
          `).join('')}
          ${complaints.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:20px">No complaints found in system.</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  },

  updateStatus(id, newStatus) {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const idx = complaints.findIndex(c => c.id === id);
    if (idx > -1) {
      complaints[idx].status = newStatus;
      complaints[idx].timeline = complaints[idx].timeline || [];
      complaints[idx].timeline.push({ status: 'Admin Update', time: new Date().toISOString(), note: 'Status changed to ' + newStatus });
      localStorage.setItem('sb_complaints', JSON.stringify(complaints));
      SB.ui.toast(`Complaint ${id} marked as ${newStatus}`, 'success');
      
      // Update counters without full re-render
      setTimeout(() => SB.router.refresh(), 500);
    }
  },

  filterTable(query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#admin-table tbody tr[data-search]');
    rows.forEach(r => {
      const text = r.getAttribute('data-search').toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  },

  init() {}
};
