// inbox.js

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDtLHSz7-KU97ALJTQvLRQTG5yj7brcsvc",
    authDomain: "sejuk-teknik.firebaseapp.com",
    projectId: "sejuk-teknik",
    storageBucket: "sejuk-teknik.appspot.com",
    messagingSenderId: "733860478343",
    appId: "1:733860478343:web:172838a08e702d129ae722",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check login
auth.onAuthStateChanged(user => {
    if (user) {
        loadNotifications(user);
        loadUserCoins(user);
    } else {
        window.location.href = "index.html";
    }
});

// Load notifications
function loadNotifications(user) {
    const container = document.getElementById("notificationContainer");
    container.innerHTML = `<div class="loading"><i class="fas fa-spinner"></i><p>Memuat notifikasi...</p></div>`;

    db.collection("notifications")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .get()
      .then(snapshot => {
          container.innerHTML = "";
          if (snapshot.empty) {
              container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>Tidak Ada Notifikasi</h3><p>Anda tidak memiliki notifikasi saat ini.</p></div>`;
              return;
          }

          snapshot.forEach(doc => {
              const n = doc.data();
              const id = doc.id;
              const date = n.timestamp ? new Date(n.timestamp.seconds*1000) : new Date();
              const formatted = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;

              let actions = "";
              if (n.claimed) {
                  actions = `<button class="notification-btn notification-claimed" disabled><i class="fas fa-check"></i> Sudah Diklaim</button>`;
              } else if (n.coinReward) {
                  actions = `<button class="notification-btn notification-claim" onclick="claimNotification('${id}',${n.coinReward})"><i class="fas fa-gift"></i> Klaim Hadiah</button>
                             <button class="notification-btn notification-dismiss" onclick="dismissNotification('${id}')"><i class="fas fa-times"></i> Hapus</button>`;
              } else {
                  actions = `<button class="notification-btn notification-dismiss" onclick="dismissNotification('${id}')"><i class="fas fa-times"></i> Hapus</button>`;
              }

              const item = document.createElement("div");
              item.className = "notification-item" + (n.read ? "" : " unread");
              item.innerHTML = `
                  <div class="notification-item-header">
                      <div class="notification-item-title">${n.title}</div>
                      <div class="notification-item-time">${formatted}</div>
                  </div>
                  <div class="notification-item-content
