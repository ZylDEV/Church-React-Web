import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // ← tambahkan ini

const firebaseConfig = {
  apiKey: "AIzaSyBtyV2FrQ7pjtLf_hHZb30MRvPJ5e8pHUw",
  authDomain: "web-gereja-2249d.firebaseapp.com",
  databaseURL: "https://web-gereja-2249d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-gereja-2249d",
  storageBucket: "web-gereja-2249d.appspot.com", // ← perbaiki ini
  messagingSenderId: "857796575870",
  appId: "1:857796575870:web:b6045888cbe8731edece2f",
  measurementId: "G-RMQRYG02G1"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const storage = getStorage(app); // ← inisialisasi storage

export { db, storage }; // ← ekspor keduanya
