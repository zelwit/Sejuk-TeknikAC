// firebase.js
// Pastikan file ini dipanggil di semua halaman yang butuh Firebase

// Import SDK (gunakan versi modular agar stabil di GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtLHSz7-KU97ALJTQvLRQTG5yj7brcsvc",
  authDomain: "sejuk-teknik.firebaseapp.com",
  projectId: "sejuk-teknik",
  storageBucket: "sejuk-teknik.firebasestorage.app",
  messagingSenderId: "733860478343",
  appId: "1:733860478343:web:172838a08e702d129ae722",
  measurementId: "G-EDJ6Y6J7GC"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut };
