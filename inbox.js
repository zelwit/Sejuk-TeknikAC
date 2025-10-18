// inbox.js

// Initialize Firebase (pastikan Firebase sudah di-load di HTML sebelum ini)
const auth = firebase.auth();
const db = firebase.firestore();

// Cek login user
auth.onAuthStateChanged(user => {
    if (user) {
        loadNotifications(user);
        loadUserCoins(user);
    } else {
        window.location.href = "index.html";
    }
});

// Load notifikasi
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
              container.innerHTML = `
                  <div class="empty-state">
                      <i class="fas fa-inbox"></i>
                      <h3>Tidak Ada Notifikasi</h3>
                      <p>Anda tidak memiliki notifikasi saat ini.</p>
                  </div>
              `;
              return;
          }

          snapshot.forEach(doc => {
              const n = doc.data();
              const id = doc.id;
              const date = n.timestamp ? new Date(n.timestamp.seconds * 1000) : new Date();
              const formatted = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;

              let actions = "";
              if (n.claimed) {
                  actions = `<button class="notification-btn notification-claimed" disabled><i class="fas fa-check"></i> Sudah Diklaim</button>`;
              } else if (n.coinReward) {
                  actions = `
                      <button class="notification-btn notification-claim" onclick="claimNotification('${id}', ${n.coinReward})"><i class="fas fa-gift"></i> Klaim Hadiah</button>
                      <button class="notification-btn notification-dismiss" onclick="dismissNotification('${id}')"><i class="fas fa-times"></i> Hapus</button>
                  `;
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
                  <div class="notification-item-content">${n.content}</div>
                  <div class="notification-item-actions">${actions}</div>
              `;
              container.appendChild(item);
          });

          // tandai semua notifikasi sebagai read
          markAllAsRead(user.uid);
      })
      .catch(err => {
          console.error(err);
          container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Terjadi Kesalahan</h3><p>Gagal memuat notifikasi.</p></div>`;
      });
}

// Load SJCoin user
function loadUserCoins(user) {
    db.collection("users").doc(user.uid).get()
      .then(doc => {
          if (doc.exists) {
              const coins = doc.data().sjcoin || 0;
              document.getElementById("sjcoinAmount").textContent = coins;
              document.getElementById("sjcoinDisplay").style.display = "flex";
          }
      })
      .catch(console.error);
}

// Tandai semua notifikasi read
function markAllAsRead(uid) {
    db.collection("notifications")
      .where("userId", "==", uid)
      .where("read", "==", false)
      .get()
      .then(snap => {
          const batch = db.batch();
          snap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
          return batch.commit();
      })
      .catch(console.error);
}

// Klaim hadiah
function claimNotification(id, reward) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("notifications").doc(id).update({ claimed: true })
      .then(() => db.collection("users").doc(user.uid).get())
      .then(doc => {
          const current = doc.data().sjcoin || 0;
          return db.collection("users").doc(user.uid).update({ sjcoin: current + reward })
              .then(() => {
                  document.getElementById("sjcoinAmount").textContent = current + reward;
                  loadNotifications(user);
              });
      })
      .catch(console.error);
}

// Hapus notifikasi
function dismissNotification(id) {
    db.collection("notifications").doc(id).delete()
      .then(() => loadNotifications(auth.currentUser))
      .catch(console.error);
}

// Go back
function goBack() {
    window.history.back();
}
