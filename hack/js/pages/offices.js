// Smart Bharat – Nearby Offices Page
SB.pages.offices = {
  map: null,
  markers: [],

  render() {
    return `
<div class="offices-page container">
  <div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px">
    <div>
      <h1 style="margin-bottom:8px">📍 Nearby Government Offices</h1>
      <p style="color:var(--text-muted)">Find Passport Seva Kendras, RTOs, Police Stations, and Collector Offices near you.</p>
    </div>
    <div style="display:flex;gap:10px">
      <select class="form-select" id="office-type-filter" onchange="SB.pages.offices.filterOffices(this.value)" style="width:200px">
        <option value="All">All Offices</option>
        <option value="Passport">Passport Offices</option>
        <option value="RTO">RTOs</option>
        <option value="Police">Police Stations</option>
        <option value="Collector">Collector Offices</option>
        <option value="Taluk">Taluk Offices</option>
      </select>
      <button class="btn btn-primary" onclick="SB.pages.offices.locateMe()">
        <i class="fa fa-crosshairs"></i> Locate Me
      </button>
    </div>
  </div>

  <div class="grid" style="grid-template-columns:300px 1fr;gap:24px">
    <div style="display:flex;flex-direction:column;gap:12px;height:480px;overflow-y:auto;padding-right:8px" id="office-list">
      <!-- Populated by JS -->
    </div>
    <div id="offices-map" class="card" style="padding:0"></div>
  </div>
</div>`;
  },

  init() {
    this.initMap();
    this.renderList(SB.govtOffices);
  },

  initMap() {
    if (this.map) {
      this.map.remove();
    }
    
    // Default to India center
    this.map = L.map('offices-map').setView(SB.config.mapCenter, SB.config.mapZoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarkers(SB.govtOffices);
  },

  addMarkers(offices) {
    // Clear old markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const icons = {
      'Passport': 'blue', 'RTO': 'orange', 'Police': 'red', 'Collector': 'green', 'Taluk': 'purple'
    };

    offices.forEach(office => {
      const color = icons[office.type] || 'blue';
      const markerHtml = `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`;
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([office.lat, office.lng], { icon: customIcon }).addTo(this.map);
      marker.bindPopup(`<b>${office.name}</b><br>${office.type}<br>${office.address}`);
      
      marker.on('click', () => {
        document.querySelectorAll('.office-card').forEach(c => c.style.borderColor = 'var(--border)');
        const card = document.getElementById(`office-card-${office.name.replace(/\s+/g,'-')}`);
        if(card) {
          card.style.borderColor = 'var(--blue)';
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      this.markers.push(marker);
    });
  },

  renderList(offices) {
    const list = document.getElementById('office-list');
    const typeColors = { Passport:'blue', RTO:'saffron', Police:'red', Collector:'green', Taluk:'purple' };
    
    list.innerHTML = offices.map(o => `
      <div class="office-card hover-lift" id="office-card-${o.name.replace(/\s+/g,'-')}" style="cursor:pointer" onclick="SB.pages.offices.focusMap(${o.lat}, ${o.lng})">
        <div class="badge badge-${typeColors[o.type]||'blue'} office-type-badge">${o.type}</div>
        <h4 style="margin-bottom:4px;font-size:0.95rem">${o.name}</h4>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px"><i class="fa fa-map-marker"></i> ${o.address}</p>
        <button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:0.75rem" onclick="window.open('https://maps.google.com/?q=${o.lat},${o.lng}')">
          <i class="fa fa-external-link"></i> Get Directions
        </button>
      </div>
    `).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px">No offices found for this category.</p>';
  },

  filterOffices(type) {
    const filtered = type === 'All' ? SB.govtOffices : SB.govtOffices.filter(o => o.type === type);
    this.addMarkers(filtered);
    this.renderList(filtered);
    
    if (filtered.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  },

  focusMap(lat, lng) {
    this.map.setView([lat, lng], 14);
  },

  locateMe() {
    if (!navigator.geolocation) {
      SB.ui.toast("Geolocation is not supported by your browser", "error");
      return;
    }
    
    const btn = document.querySelector('.btn-primary i.fa-crosshairs').parentElement;
    btn.innerHTML = '<i class="fa fa-spinner animate-spin"></i> Locating...';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Add user marker
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:#EF4444;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(239,68,68,0.8);animation:pulse 2s infinite"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        L.marker([lat, lng], { icon: userIcon }).addTo(this.map).bindPopup("You are here").openPopup();
        this.map.setView([lat, lng], 10);
        
        btn.innerHTML = '<i class="fa fa-crosshairs"></i> Locate Me';
        SB.ui.toast("Location found!", "success");
      },
      () => {
        btn.innerHTML = '<i class="fa fa-crosshairs"></i> Locate Me';
        SB.ui.toast("Unable to retrieve your location", "error");
      }
    );
  }
};
