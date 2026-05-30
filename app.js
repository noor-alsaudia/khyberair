// ════════════════════════════════════════════════════════════
// AL SAUDIA TRAVEL & UMRAH — MAIN APPLICATION LOGIC
// ════════════════════════════════════════════════════════════

var DEVICE_ID = (function(){
  var d = localStorage.getItem('ast4_did');
  if(!d){ d = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem('ast4_did', d); }
  return d;
})();

var RECS = [];
var GROUPS = [];
var SALES = [];
var PARTIES = { customer: [], supplier: [] };
var USERS = [];
var PACKAGES = [];
var EXTRAS = null;
var QUOTES = [];
var nextPkgId = 1, nextQuoteId = 1;
var calcResult = null;
var nextRecId = 1, nextGrpId = 1, nextSaleId = 1, nextInvId = 1;
var editInvId = null, editGrpId = null, editUserId = null;

// currentUser data (updated on login)
var currentUser = null;

var currentScreen = 'dash';
var paxCounter = 0;
var RF = { search:'', visa:'', cus:'', grp:'' };
var grpFilter = { search:'', status:'' };

// ── DATA MANAGEMENT ──

function loadData() {
  try { RECS = JSON.parse(localStorage.getItem('ast4_recs') || '[]'); } catch(e) { RECS = []; }
  try { GROUPS = JSON.parse(localStorage.getItem('ast4_groups') || '[]'); } catch(e) { GROUPS = []; }
  try { SALES = JSON.parse(localStorage.getItem('ast4_sales') || '[]'); } catch(e) { SALES = []; }
  try {
    var p = JSON.parse(localStorage.getItem('ast4_parties') || 'null');
    PARTIES = p || { customer:['PVT PAX','WELCOME','DIRECT'], supplier:['PAK HARMAIN','WAQAS INT'] };
  } catch(e) { PARTIES = { customer:['PVT PAX'], supplier:['PAK HARMAIN'] }; }
  try {
    var u = JSON.parse(localStorage.getItem('ast4_users') || 'null');
    USERS = u || [];
  } catch(e) { USERS = []; }
  try {
    var pk = JSON.parse(localStorage.getItem('ast4_packages') || 'null');
    PACKAGES = (pk && pk.length) ? pk : getDefaultPackages();
  } catch(e) { PACKAGES = getDefaultPackages(); }
  try {
    EXTRAS = JSON.parse(localStorage.getItem('ast4_extras') || 'null') || getDefaultExtras();
  } catch(e) { EXTRAS = getDefaultExtras(); }
  try { QUOTES = JSON.parse(localStorage.getItem('ast4_quotes') || '[]'); } catch(e) { QUOTES = []; }
  
  nextPkgId = Math.max(0, ...PACKAGES.map(function(p){return p.id||0;})) + 1;
  nextQuoteId = Math.max(0, ...QUOTES.map(function(q){return q.id||0;})) + 1;
  recalcIds();
}

function recalcIds() {
  nextRecId = Math.max(0, ...RECS.map(function(r){return r.id||0;})) + 1;
  nextGrpId = Math.max(0, ...GROUPS.map(function(g){return g.id||0;})) + 1;
  nextSaleId = Math.max(0, ...SALES.map(function(s){return s.id||0;})) + 1;
  nextInvId = Math.max(0, ...RECS.map(function(r){return r.invId||0;}), 0) + 1;
}

function saveData() {
  try {
    localStorage.setItem('ast4_recs', JSON.stringify(RECS));
    localStorage.setItem('ast4_groups', JSON.stringify(GROUPS));
    localStorage.setItem('ast4_sales', JSON.stringify(SALES));
    localStorage.setItem('ast4_parties', JSON.stringify(PARTIES));
    localStorage.setItem('ast4_users', JSON.stringify(USERS));
    localStorage.setItem('ast4_packages', JSON.stringify(PACKAGES));
    if (EXTRAS) localStorage.setItem('ast4_extras', JSON.stringify(EXTRAS));
    localStorage.setItem('ast4_quotes', JSON.stringify(QUOTES));
    
    if (CLOUD.enabled) CLOUD.push();
    if (GSHEETS.enabled) {
      clearTimeout(window._gsSaveTimer);
      window._gsSaveTimer = setTimeout(function(){ GSHEETS.push(); }, 3000);
    }
  } catch(e) {
    toast('Save error: ' + e.message, 'err');
  }
}

// ── UI HELPERS ──

function $(id) { return document.getElementById(id); }
function v(id) { var e = $(id); return e ? e.value : ''; }
function sv(id, val) { var e = $(id); if(e) e.value = (val === null || val === undefined) ? '' : val; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function fmtDate(d) {
  if (!d) return '—';
  try { var dt = new Date(d); if (isNaN(dt)) return d;
    return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  } catch(e) { return d; }
}

function fmtPKR(n) {
  if (!n && n !== 0) return '—';
  return 'PKR ' + parseInt(n).toLocaleString('en-PK');
}

function toast(msg, type) {
  type = type || 'ok';
  var t = $('toast');
  if (!t) return;
  $('toast-msg').textContent = msg;
  t.className = 'toast show ' + (type === 'ok' ? '' : type);
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){ t.classList.remove('show'); }, 3500);
}

function nav(s, el) {
  document.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
  if (el) el.classList.add('active');
  
  document.querySelectorAll('.screen').forEach(function(x){ x.classList.remove('active'); });
  var sc = $('s-'+s);
  if (sc) sc.classList.add('active');
  
  currentScreen = s;
  if (s === 'dash') renderDash();
  else if (s === 'records') { populateRecFilters(); renderRecs(); }
  else if (s === 'groups') renderGroups();
  else if (s === 'umrah') renderUmrah();
  // ... other render calls based on screen
}

// ── PASSENGER MANAGEMENT ──

function addPaxBlock(data) {
  paxCounter++;
  // Logic to inject HTML for a new passenger row
}

function saveInvoice() {
  // Logic to gather all pax blocks and save to RECS array
}

// ── GROUP MANAGEMENT ──

function parsePNR() {
  var raw = v('pnr-raw').trim();
  // Regex logic to extract Flight, Dates, Routes from PNR text
}

function saveGroup() {
  // Logic to save airline group details
}

// ── UMRAH CALCULATOR ──

function calculateUmrah() {
  // Logic to calculate SAR and PKR rates based on dates and selected hotels
}

// ── FIREBASE & SYNC ──

var CLOUD = {
  enabled: false,
  push: function() {
    // Logic to send data to Firebase Realtime DB
  },
  pull: function() {
    // Logic to fetch data from Firebase
  },
  applyRemote: function(data) {
    // Logic to update local storage and UI when remote data changes
  }
};

// ── AUTHENTICATION ──

function doLogin() {
  var u = $('li-user').value;
  var p = $('li-pass').value;
  // Firebase Authentication logic
}

function startApp() {
    loadData();
    buildAllScreens();
    // Initial sync
    CLOUD.pull();
}

// ... Additional logic for Printing, Expiry Alerts, and Package Designer ...
