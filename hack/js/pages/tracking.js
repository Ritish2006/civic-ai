// Smart Bharat – Complaint Tracking Page
SB.pages.tracking = {
  render() {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    return `
<div class="tracking-page container">
  <div style="margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div>
      <h1 style="margin-bottom:8px">📋 Complaint Tracking</h1>
      <p style="color:var(--text-muted)">Track status and updates for your filed complaints</p>
    </div>
    <div style="display:flex;gap:10px">
      <input type="text" class="form-input" placeholder="🔍 Search by ID..." id="track-search" oninput="SB.pages.tracking.search(this.value)" style="width:220px">
      <button class="btn btn-primary" onclick="navigateTo('complaint')"><i class="fa fa-plus"></i> New Complaint</button>
    </div>
  </div>

  ${complaints.length === 0 ? `
    <div style="text-align:center;padding:80px 20px">
      <div style="font-size:4rem;margin-bottom:16px">📋</div>
      <h3 style="margin-bottom:8px">No Complaints Filed</h3>
      <p style="color:var(--text-muted);margin-bottom:24px">You haven't filed any complaints yet.</p>
      <button class="btn btn-primary" onclick="navigateTo('complaint')"><i class="fa fa-plus"></i> File a Complaint</button>
    </div>
  ` : `
    <div id="complaints-list">
      ${complaints.slice().reverse().map(c => this.renderComplaintCard(c)).join('')}
    </div>
  `}

  <!-- Detail Modal -->
  <div class="modal-overlay" id="complaint-detail-modal">
    <div class="modal" style="max-width:620px">
      <div class="modal-header">
        <h3>Complaint Details</h3>
        <button class="modal-close" onclick="SB.ui.closeModal('complaint-detail-modal')"><i class="fa fa-times"></i></button>
      </div>
      <div id="complaint-detail-content"></div>
    </div>
  </div>
</div>`;
  },

  renderComplaintCard(c) {
    const statusColors = { pending:'yellow', progress:'blue', resolved:'green', rejected:'red' };
    const st = c.status || 'pending';
    const daysAgo = Math.floor((Date.now() - new Date(c.date)) / 86400000);
    return `
    <div class="complaint-status-card hover-lift" style="cursor:pointer" onclick="SB.pages.tracking.showDetail('${c.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <span class="complaint-id">${c.id}</span>
            <span class="status-pill status-${statusColors[st]}">${st.charAt(0).toUpperCase()+st.slice(1)}</span>
          </div>
          <div style="font-size:0.88rem;font-weight:600">${c.category}</div>
        </div>
        <div style="text-align:right;font-size:0.8rem;color:var(--text-muted)">
          <div>${SB.ui.formatDate(c.date)}</div>
          <div>${daysAgo === 0 ? 'Today' : daysAgo + ' days ago'}</div>
        </div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">${c.description?.slice(0,120)}...</p>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="font-size:0.82rem;color:var(--text-muted)">
          <i class="fa fa-building"></i> ${c.dept} &nbsp;
          <i class="fa fa-map-marker"></i> ${c.city}
        </div>
        <div class="progress" style="width:200px;max-width:100%">
          <div class="progress-bar ${st==='resolved'?'green':st==='progress'?'':st==='rejected'?'saffron':''}" style="width:${st==='resolved'?'100':st==='progress'?'50':st==='rejected'?'100':'15'}%"></div>
        </div>
      </div>
    </div>`;
  },

  showDetail(id) {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const c = complaints.find(x => x.id === id);
    if (!c) return;
    const statusColors = { pending:'yellow', progress:'blue', resolved:'green', rejected:'red' };
    const timeline = c.timeline || [{ status:'Submitted', time: c.date, note:'Complaint registered' }];
    document.getElementById('complaint-detail-content').innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <span class="complaint-id">${c.id}</span>
        <span class="status-pill status-${statusColors[c.status]||'yellow'}">${c.status}</span>
        <span class="badge badge-blue">${c.category}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:0.85rem">
        <div><strong>Department:</strong><br>${c.dept}</div>
        <div><strong>Location:</strong><br>${c.city}</div>
        <div><strong>Filed:</strong><br>${SB.ui.formatDate(c.date)}</div>
        <div><strong>Expected:</strong><br>${c.status === 'resolved' ? 'Resolved' : '7–10 working days'}</div>
      </div>
      <h4 style="margin-bottom:12px">Timeline</h4>
      <div class="timeline">
        ${timeline.map((t, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i===0?'active':'completed'}"><i class="fa fa-check"></i></div>
            <div class="timeline-body">
              <div class="timeline-title">${t.status}</div>
              <div class="timeline-time">${SB.ui.formatDate(t.time)} · ${t.note}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px;background:var(--bg-secondary);border-radius:10px;padding:14px;font-size:0.84rem">
        <strong>Formal Complaint:</strong><br>${c.formal || c.description}
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-outline btn-sm" onclick="SB.ui.copyToClipboard('${c.id}','Complaint ID copied!')">
          <i class="fa fa-copy"></i> Copy ID
        </button>
        <button class="btn btn-ghost btn-sm" onclick="SB.pages.tracking.updateStatus('${c.id}')">
          <i class="fa fa-refresh"></i> Simulate Update
        </button>
      </div>`;
    SB.ui.openModal('complaint-detail-modal');
  },

  search(query) {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const q = query.toLowerCase();
    const filtered = complaints.filter(c =>
      c.id.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
    const list = document.getElementById('complaints-list');
    if (list) list.innerHTML = filtered.slice().reverse().map(c => this.renderComplaintCard(c)).join('') || '<p style="color:var(--text-muted);padding:20px">No complaints found</p>';
  },

  updateStatus(id) {
    const complaints = JSON.parse(localStorage.getItem('sb_complaints') || '[]');
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return;
    const statuses = ['pending', 'progress', 'resolved'];
    const current = statuses.indexOf(complaints[idx].status);
    complaints[idx].status = statuses[(current + 1) % statuses.length];
    complaints[idx].timeline = complaints[idx].timeline || [];
    complaints[idx].timeline.push({ status: 'Status Updated', time: new Date().toISOString(), note: 'Status updated to ' + complaints[idx].status });
    localStorage.setItem('sb_complaints', JSON.stringify(complaints));
    SB.ui.toast('Status updated to: ' + complaints[idx].status, 'success');
    SB.ui.closeModal('complaint-detail-modal');
    SB.router.refresh();
  },

  init() {}
};
