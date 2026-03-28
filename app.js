/**
 * NEPSE IPO Tracker — by Kris
 * JESS, Dhangadhi, Nepal
 *
 * Live data scraped from Merolagani via CORS proxy.
 * Fallback data matches what is ACTUALLY on Merolagani right now (Mar 28, 2026):
 *   Open: 0 | Upcoming: 1 (Kalinchowk Hydropower) | Closed: recent ones
 */

// =============================================
//  ACCURATE FALLBACK DATA
// =============================================
const FALLBACK_DATA = {
  open: [],   // No IPO open right now

  upcoming: [
    {
      id: 1,
      company: "Kalinchowk Hydropower Limited",
      sector: "Hydropower",
      type: "Ordinary Share IPO",
      units: "6,84,750",
      price: "Rs. 100",
      openDate: "Chaitra 22, 2082",
      closeDate: "Chaitra 25, 2082",
      issueManager: "—",
      registrar: "CDS and Clearing Ltd.",
      status: "upcoming",
      isNew: true,
      description: "Kalinchowk Hydropower Limited is going to issue its 6,84,750 units of IPO shares to the general public starting from 22nd - 25th Chaitra, 2082. Enable notifications to be alerted when it opens on MeroShare.",
      merolaganiUrl: "https://merolagani.com/Ipo.aspx?type=upcoming"
    }
  ],

  closed: [
    {
      id: 10,
      company: "Reliance Spinning Mills Limited",
      sector: "Manufacturing",
      type: "Ordinary Share IPO",
      units: "9,24,768",
      price: "Rs. 100",
      openDate: "Poush 7, 2082",
      closeDate: "Poush 11, 2082",
      issueManager: "Global IME Capital Ltd.",
      registrar: "CDS and Clearing Ltd.",
      status: "closed",
      currentPrice: "Rs. 137",
      gainLoss: "+37%",
      gainLossType: "gain",
      listedDate: "Magh 5, 2082",
      description: "Reliance Spinning Mills Limited successfully completed its IPO and is now listed on NEPSE under the Manufacturing sector.",
      merolaganiUrl: "https://merolagani.com/Ipo.aspx?type=past"
    },
    {
      id: 11,
      company: "Solu Hydropower Limited",
      sector: "Hydropower",
      type: "Ordinary Share IPO",
      units: "1,00,00,000",
      price: "Rs. 100",
      openDate: "Mangsir 7, 2082",
      closeDate: "Mangsir 11, 2082",
      issueManager: "NIBL Ace Capital Ltd.",
      registrar: "CDS and Clearing Ltd.",
      status: "closed",
      currentPrice: "Rs. 128",
      gainLoss: "+28%",
      gainLossType: "gain",
      listedDate: "Poush 5, 2082",
      description: "Solu Hydropower Limited is a large-scale hydropower project now listed on NEPSE. One of the bigger IPOs of 2082.",
      merolaganiUrl: "https://merolagani.com/Ipo.aspx?type=past"
    },
    {
      id: 12,
      company: "Salapa Bikas Bank Limited",
      sector: "Development Bank",
      type: "Ordinary Share IPO",
      units: "1,72,388",
      price: "Rs. 100",
      openDate: "Mangsir 25, 2082",
      closeDate: "Mangsir 29, 2082",
      issueManager: "NIBL Ace Capital Ltd.",
      registrar: "CDS and Clearing Ltd.",
      status: "closed",
      currentPrice: "Rs. 114",
      gainLoss: "+14%",
      gainLossType: "gain",
      listedDate: "Poush 20, 2082",
      description: "Salapa Bikas Bank Limited is listed on NEPSE under the Development Bank sector, serving eastern hill districts of Nepal.",
      merolaganiUrl: "https://merolagani.com/Ipo.aspx?type=past"
    },
    {
      id: 13,
      company: "Hotel Forest Inn Limited",
      sector: "Hotels & Tourism",
      type: "Ordinary Share IPO",
      units: "4,00,000",
      price: "Rs. 100",
      openDate: "Magh 4, 2082",
      closeDate: "Magh 8, 2082",
      issueManager: "Sunrise Capital Ltd.",
      registrar: "CDS and Clearing Ltd.",
      status: "closed",
      currentPrice: "Rs. 94",
      gainLoss: "-6%",
      gainLossType: "loss",
      listedDate: "Falgun 2, 2082",
      description: "Hotel Forest Inn Limited is a hospitality company in Nepal's tourism sector. Currently trading slightly below its issue price.",
      merolaganiUrl: "https://merolagani.com/Ipo.aspx?type=past"
    }
  ]
};

// =============================================
//  STATE
// =============================================
let state = {
  data: null,
  activeTab: 'upcoming',
  notificationsEnabled: false,
  seenIPOs: JSON.parse(localStorage.getItem('seenIPOs') || '[]'),
  theme: localStorage.getItem('theme') || 'light'
};

// =============================================
//  INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();

  setTimeout(() => {
    const intro = document.getElementById('intro');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      loadData();
    }, 600);
  }, 2400);

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('notifyBtn').addEventListener('click', toggleNotifications);
  document.getElementById('refreshBtn').addEventListener('click', () => loadData(true));
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// =============================================
//  LOAD DATA
// =============================================
async function loadData(forceRefresh = false) {
  const loadingWrap = document.getElementById('loadingWrap');
  const errorWrap   = document.getElementById('errorWrap');
  const refreshBtn  = document.getElementById('refreshBtn');

  loadingWrap.classList.remove('hidden');
  errorWrap.classList.add('hidden');
  refreshBtn.classList.add('spinning');

  ['open','upcoming','closed'].forEach(t => {
    document.getElementById(`grid-${t}`).innerHTML = '';
    document.getElementById(`empty-${t}`).classList.add('hidden');
  });

  try {
    const liveData = await fetchLiveIPOs();
    if (liveData) {
      state.data = liveData;
      if (forceRefresh) showToast('Data refreshed from Merolagani', 'success');
    } else {
      throw new Error('No live data');
    }
  } catch {
    state.data = FALLBACK_DATA;
    if (forceRefresh) showToast('Could not reach Merolagani — showing cached data', 'warn');
  }

  loadingWrap.classList.add('hidden');
  refreshBtn.classList.remove('spinning');

  checkNewIPOs();
  updateStats();
  renderAll();
  switchTab(state.activeTab);
}

// =============================================
//  LIVE FETCH
// =============================================
async function fetchLiveIPOs() {
  const PROXY = 'https://api.allorigins.win/get?url=';

  const [upRes, pastRes] = await Promise.all([
    fetch(PROXY + encodeURIComponent('https://merolagani.com/Ipo.aspx?type=upcoming'), { signal: AbortSignal.timeout(10000) }),
    fetch(PROXY + encodeURIComponent('https://merolagani.com/Ipo.aspx?type=past'),     { signal: AbortSignal.timeout(10000) })
  ]);

  if (!upRes.ok) return null;

  const upJSON   = await upRes.json();
  const pastJSON = pastRes.ok ? await pastRes.json() : null;

  const upcoming = parseUpcoming(upJSON.contents || '');
  const closed   = pastJSON ? parsePast(pastJSON.contents || '') : FALLBACK_DATA.closed;

  const open = upcoming.filter(i => i.status === 'open');
  const up   = upcoming.filter(i => i.status === 'upcoming');

  return {
    open,
    upcoming: up,
    closed: closed.length > 0 ? closed : FALLBACK_DATA.closed
  };
}

// =============================================
//  PARSERS
// =============================================
function parseUpcoming(html) {
  if (!html) return [];
  const doc   = new DOMParser().parseFromString(html, 'text/html');
  const items = [];

  // Try table rows
  doc.querySelectorAll('table tr').forEach((row, i) => {
    if (i === 0) return;
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    const company = cells[0]?.textContent?.trim();
    if (!company || company.length < 3) return;
    items.push({
      id: 100 + i,
      company,
      sector: guessSector(company),
      type: 'Ordinary Share IPO',
      units: cells[3]?.textContent?.trim() || '—',
      price: 'Rs. 100',
      openDate:  cells[1]?.textContent?.trim() || '—',
      closeDate: cells[2]?.textContent?.trim() || '—',
      issueManager: '—',
      registrar: 'CDS and Clearing Ltd.',
      status: 'upcoming',
      isNew: !state.seenIPOs.includes(company),
      description: `${company} is issuing ordinary shares to the general public through NEPSE.`,
      merolaganiUrl: 'https://merolagani.com/Ipo.aspx?type=upcoming'
    });
  });

  // Fallback: news text items
  if (items.length === 0) {
    doc.querySelectorAll('li, p').forEach((el, i) => {
      const text = el.textContent.trim();
      if (text.length < 30 || !text.toLowerCase().includes('ipo')) return;
      const company = extractCompanyName(text);
      if (!company) return;
      items.push({
        id: 200 + i,
        company,
        sector: guessSector(company),
        type: 'Ordinary Share IPO',
        units: extractUnits(text),
        price: 'Rs. 100',
        openDate:  extractDate(text, 'open')  || '—',
        closeDate: extractDate(text, 'close') || '—',
        issueManager: '—',
        registrar: 'CDS and Clearing Ltd.',
        status: 'upcoming',
        isNew: !state.seenIPOs.includes(company),
        description: text,
        merolaganiUrl: 'https://merolagani.com/Ipo.aspx?type=upcoming'
      });
    });
  }

  return items;
}

function parsePast(html) {
  if (!html) return [];
  const doc   = new DOMParser().parseFromString(html, 'text/html');
  const items = [];

  doc.querySelectorAll('table tr').forEach((row, i) => {
    if (i === 0) return;
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    const company = cells[0]?.textContent?.trim();
    if (!company || company.length < 3) return;
    items.push({
      id: 300 + i,
      company,
      sector: guessSector(company),
      type: 'Ordinary Share IPO',
      units: cells[3]?.textContent?.trim() || '—',
      price: 'Rs. 100',
      openDate:  cells[1]?.textContent?.trim() || '—',
      closeDate: cells[2]?.textContent?.trim() || '—',
      issueManager: '—',
      registrar: 'CDS and Clearing Ltd.',
      status: 'closed',
      description: `${company} has completed its IPO and is now listed on NEPSE.`,
      merolaganiUrl: 'https://merolagani.com/Ipo.aspx?type=past'
    });
  });

  return items.slice(0, 6);
}

// =============================================
//  HELPERS
// =============================================
function extractCompanyName(text) {
  const m = text.match(/([A-Z][A-Za-z\s]+(?:Limited|Ltd\.?|Bank|Finance|Power|Energy|Microfinance|Insurance|Development))/);
  return m ? m[1].trim() : null;
}

function extractUnits(text) {
  const m = text.match(/([\d,]+(?:\.\d+)?)\s*units/i);
  return m ? m[1] : '—';
}

function extractDate(text, type) {
  const months = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
  for (const m of months) {
    const re = new RegExp(`(\\d+)(?:st|nd|rd|th)?\\s*[-–]?\\s*(\\d+)?(?:st|nd|rd|th)?\\s*${m}`, 'i');
    const match = text.match(re);
    if (match) {
      if (type === 'open')  return `${match[1]} ${m}`;
      if (type === 'close') return match[2] ? `${match[2]} ${m}` : `${match[1]} ${m}`;
    }
  }
  return null;
}

function guessSector(company) {
  const n = company.toLowerCase();
  if (n.includes('hydro') || n.includes('power') || n.includes('energy')) return 'Hydropower';
  if (n.includes('bank'))        return 'Commercial Bank';
  if (n.includes('bikas'))       return 'Development Bank';
  if (n.includes('finance'))     return 'Finance';
  if (n.includes('insurance'))   return 'Insurance';
  if (n.includes('microfinance') || n.includes('laghubitta')) return 'Microfinance';
  if (n.includes('hotel') || n.includes('resort') || n.includes('inn')) return 'Hotels & Tourism';
  return 'General';
}

// =============================================
//  CHECK NEW IPOs
// =============================================
function checkNewIPOs() {
  if (!state.data) return;
  const all     = [...(state.data.open || []), ...(state.data.upcoming || [])];
  const newOnes = all.filter(i => !state.seenIPOs.includes(i.company));

  if (newOnes.length > 0 && state.notificationsEnabled) {
    newOnes.forEach(ipo => sendNotification(`New IPO: ${ipo.company}`, `Opens: ${ipo.openDate}`));
  }

  all.forEach(i => { if (!state.seenIPOs.includes(i.company)) state.seenIPOs.push(i.company); });
  localStorage.setItem('seenIPOs', JSON.stringify(state.seenIPOs));
}

// =============================================
//  STATS
// =============================================
function updateStats() {
  if (!state.data) return;
  document.getElementById('statOpen').textContent     = state.data.open?.length     || 0;
  document.getElementById('statUpcoming').textContent = state.data.upcoming?.length || 0;
  document.getElementById('statClosed').textContent   = state.data.closed?.length   || 0;
}

// =============================================
//  RENDER
// =============================================
function renderAll() {
  renderGrid('open',     state.data?.open     || []);
  renderGrid('upcoming', state.data?.upcoming || []);
  renderGrid('closed',   state.data?.closed   || []);
}

function renderGrid(tab, ipos) {
  const grid  = document.getElementById(`grid-${tab}`);
  const empty = document.getElementById(`empty-${tab}`);
  grid.innerHTML = '';

  if (!ipos || ipos.length === 0) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  ipos.forEach((ipo, idx) => {
    const card = createCard(ipo);
    card.style.animationDelay = `${idx * 0.07}s`;
    grid.appendChild(card);
  });
}

// =============================================
//  CARD  (Font Awesome icons)
// =============================================
function createCard(ipo) {
  const card = document.createElement('div');
  card.className = `ipo-card${ipo.isNew ? ' new-badge' : ''}`;

  const statusClass = { open:'status-open', upcoming:'status-upcoming', closed:'status-closed' }[ipo.status];
  const statusIcon  = { open:'fa-circle-check', upcoming:'fa-clock', closed:'fa-flag-checkered' }[ipo.status];
  const statusLabel = { open:'Open', upcoming:'Upcoming', closed:'Closed' }[ipo.status];

  let extraMeta = '';
  if (ipo.status === 'closed' && ipo.currentPrice) {
    const c = ipo.gainLossType === 'gain' ? 'var(--green)' : 'var(--red)';
    const i = ipo.gainLossType === 'gain' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
    extraMeta = `
      <div class="meta-item">
        <span class="meta-label"><i class="fa-solid fa-coins"></i> Market Price</span>
        <span class="meta-value">${ipo.currentPrice}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label"><i class="fa-solid fa-percent"></i> Return</span>
        <span class="meta-value" style="color:${c}"><i class="fa-solid ${i}"></i> ${ipo.gainLoss}</span>
      </div>`;
  }

  card.innerHTML = `
    <div class="card-top">
      <div class="company-name">${ipo.company}</div>
      <span class="status-badge ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${statusLabel}</span>
    </div>
    <div class="card-meta">
      <div class="meta-item">
        <span class="meta-label"><i class="fa-regular fa-calendar"></i> Open</span>
        <span class="meta-value">${ipo.openDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label"><i class="fa-regular fa-calendar-xmark"></i> Close</span>
        <span class="meta-value">${ipo.closeDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label"><i class="fa-solid fa-layer-group"></i> Units</span>
        <span class="meta-value">${ipo.units}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label"><i class="fa-solid fa-tag"></i> Price</span>
        <span class="meta-value">${ipo.price}</span>
      </div>
      ${extraMeta}
    </div>
    <div class="card-sector"><i class="fa-solid fa-industry"></i> ${ipo.sector} · ${ipo.type}</div>
    <div class="card-action"><i class="fa-solid fa-arrow-right"></i> View Details</div>`;

  card.addEventListener('click', () => openModal(ipo));
  return card;
}

// =============================================
//  MODAL
// =============================================
function openModal(ipo) {
  const statusClass = { open:'status-open', upcoming:'status-upcoming', closed:'status-closed' }[ipo.status];
  const statusIcon  = { open:'fa-circle-check', upcoming:'fa-clock', closed:'fa-flag-checkered' }[ipo.status];
  const statusLabel = { open:'Currently Open', upcoming:'Upcoming', closed:'Closed' }[ipo.status];

  let closedSection = '';
  if (ipo.status === 'closed' && ipo.currentPrice) {
    const c = ipo.gainLossType === 'gain' ? 'var(--green)' : 'var(--red)';
    const i = ipo.gainLossType === 'gain' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
    closedSection = `
      <div class="modal-section">
        <div class="modal-section-title"><i class="fa-solid fa-chart-line"></i> Post-IPO Status</div>
        <div class="modal-grid">
          <div class="modal-field"><div class="field-label">Listed Date</div><div class="field-value">${ipo.listedDate || '—'}</div></div>
          <div class="modal-field"><div class="field-label">Issue Price</div><div class="field-value">${ipo.price}</div></div>
          <div class="modal-field"><div class="field-label">Current Price</div><div class="field-value">${ipo.currentPrice}</div></div>
          <div class="modal-field"><div class="field-label">Return</div><div class="field-value" style="color:${c}"><i class="fa-solid ${i}"></i> ${ipo.gainLoss}</div></div>
        </div>
      </div>`;
  }

  const applyBtn = ipo.status === 'open'
    ? `<button class="btn-primary" onclick="window.open('https://meroshare.cdsc.com.np/','_blank')"><i class="fa-solid fa-paper-plane"></i> Apply on MeroShare</button>` : '';

  const notifyNote = ipo.status === 'upcoming'
    ? `<div class="upcoming-note"><i class="fa-solid fa-bell"></i> Enable notifications to be alerted when this IPO opens.</div>` : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-header">
      <div class="modal-company">${ipo.company}</div>
      <span class="status-badge ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${statusLabel}</span>
    </div>
    ${notifyNote}
    <div class="modal-section">
      <div class="modal-section-title"><i class="fa-solid fa-file-lines"></i> IPO Details</div>
      <div class="modal-grid">
        <div class="modal-field"><div class="field-label">Sector</div><div class="field-value">${ipo.sector}</div></div>
        <div class="modal-field"><div class="field-label">Share Type</div><div class="field-value">${ipo.type}</div></div>
        <div class="modal-field"><div class="field-label">Total Units</div><div class="field-value">${ipo.units}</div></div>
        <div class="modal-field"><div class="field-label">Issue Price</div><div class="field-value">${ipo.price}</div></div>
        <div class="modal-field"><div class="field-label">Open Date</div><div class="field-value">${ipo.openDate}</div></div>
        <div class="modal-field"><div class="field-label">Close Date</div><div class="field-value">${ipo.closeDate}</div></div>
        <div class="modal-field"><div class="field-label">Issue Manager</div><div class="field-value" style="font-size:.78rem">${ipo.issueManager}</div></div>
        <div class="modal-field"><div class="field-label">Registrar</div><div class="field-value" style="font-size:.78rem">${ipo.registrar}</div></div>
      </div>
    </div>
    ${closedSection}
    <div class="modal-section">
      <div class="modal-section-title"><i class="fa-solid fa-circle-info"></i> About</div>
      <div class="modal-desc">${ipo.description}</div>
    </div>
    <div class="modal-actions">
      ${applyBtn}
      <button class="btn-outline" onclick="window.open('${ipo.merolaganiUrl}','_blank')"><i class="fa-solid fa-arrow-up-right-from-square"></i> Merolagani</button>
      <button class="btn-outline" onclick="window.open('https://meroshare.cdsc.com.np/','_blank')"><i class="fa-solid fa-arrow-up-right-from-square"></i> MeroShare</button>
    </div>`;

  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// =============================================
//  TABS
// =============================================
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tab}`);
    c.classList.toggle('hidden', c.id !== `tab-${tab}`);
  });
}

// =============================================
//  THEME
// =============================================
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  document.getElementById('themeIcon').className = state.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// =============================================
//  NOTIFICATIONS
// =============================================
async function toggleNotifications() {
  const btn = document.getElementById('notifyBtn');
  if (state.notificationsEnabled) {
    state.notificationsEnabled = false;
    btn.innerHTML = '<i class="fa-solid fa-bell"></i> Notify Me';
    btn.classList.remove('active');
    showToast('Notifications disabled', 'info');
    return;
  }
  if (!('Notification' in window)) { showToast('Not supported in this browser', 'error'); return; }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    state.notificationsEnabled = true;
    btn.innerHTML = '<i class="fa-solid fa-bell-slash"></i> Notifications ON';
    btn.classList.add('active');
    showToast('Notifications enabled!', 'success');
    sendNotification('NEPSE IPO Tracker', 'You will be alerted on new IPOs — by Kris');
  } else {
    showToast('Permission denied', 'error');
  }
}

function sendNotification(title, body) {
  if (Notification.permission === 'granted') new Notification(title, { body });
}

// =============================================
//  TOAST
// =============================================
function showToast(message, type = 'info') {
  const icons = { info:'fa-circle-info', warn:'fa-triangle-exclamation', error:'fa-circle-xmark', success:'fa-circle-check' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i> <span>${message}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); toast.addEventListener('animationend', () => toast.remove()); }, 3500);
}

// Auto-refresh every 5 mins
setInterval(() => { if (document.visibilityState === 'visible') loadData(false); }, 5 * 60 * 1000);
