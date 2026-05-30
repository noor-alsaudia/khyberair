// Firebase Configuration & Initialization
// Note: Replace these placeholder values with your actual Firebase Project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  databaseURL: "YOUR_DATABASE_URL_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Global State Management
let currentUser = null;
const CLOUD = {
  enabled: true,
  es: null,
  connect: function() {
    console.log("Connecting to Cloud Sync...");
  },
  pull: function() {
    console.log("Pulling updates...");
  }
};

// Authentication State Observer
auth.onAuthStateChanged(function(user) {
  if (user) {
    currentUser = {
      uid: user.uid,
      email: user.email,
      role: 'staff', // Default role mapping
      perms: {
        paxEdit: true,
        grpEdit: true
      }
    };
    
    // Fetch or verify user specific details/roles from the database if needed
    db.ref('users/' + user.uid).once('value').then(function(snapshot) {
      if (snapshot.exists()) {
        const data = snapshot.val();
        currentUser.role = data.role || 'staff';
        if (data.perms) {
          currentUser.perms = Object.assign(currentUser.perms, data.perms);
        }
      }
      applyRolePermissions();
      addLogoutButton();
    });

  } else {
    currentUser = null;
    window.location.href = "login.html"; // Redirect if not authenticated
  }
});

// Apply Role-Based UI Permissions
function applyRolePermissions(){
  var role = currentUser ? currentUser.role : 'viewer';
  
  // Hide Staff Accounts menu for non-admin
  var navUsers = document.getElementById('nav-users');
  if(navUsers && role !== 'admin') navUsers.style.display = 'none';

  // Hide Add Passenger actions if no explicit permission
  if(currentUser && !currentUser.perms.paxEdit){
    var navAddPax = document.getElementById('nav-add-pax');
    if(navAddPax) navAddPax.style.display = 'none';
    var tbAdd = document.getElementById('tb-add-pax');
    if(tbAdd) tbAdd.style.display = 'none';
  }
  
  // Hide New Group option for non-staff/non-admin
  if(currentUser && !currentUser.perms.grpEdit){
    var addGrp = document.getElementById('nav-add-grp');
    if(addGrp) addGrp.style.display = 'none';
  }
}

// Dynamically Add Logout Button to UI Footer
function addLogoutButton(){
  var sf = document.querySelector('.sfooter');
  if(!sf || document.getElementById('logout-btn')) return;
  
  var btn = document.createElement('button');
  btn.id = 'logout-btn';
  btn.className = 'btn';
  btn.style.cssText = 'width: 100%; margin-top: 10px; justify-content: center;';
  btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
  
  btn.addEventListener('click', function() {
    auth.signOut().then(function() {
      window.location.href = "login.html";
    }).catch(function(error) {
      alert("Logout failed: " + error.message);
    });
  });
  
  sf.appendChild(btn);
}

// Document Setup Event Listeners
document.addEventListener("DOMContentLoaded", function() {
  // Mobile Sidebar Toggle Management
  var menuBtn = document.querySelector('.menu-btn');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Cloud Sync Initial Triggers
  setTimeout(function(){ CLOUD.pull(); }, 300);
  setInterval(function(){ if(CLOUD.enabled && CLOUD.es && CLOUD.es.readyState === 2){ CLOUD.connect(); } }, 25000);
  setInterval(function(){ if(CLOUD.enabled && !document.hidden){ CLOUD.pull(); } }, 30000);
});
