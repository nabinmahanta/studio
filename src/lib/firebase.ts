import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "lekha-sahayak-htnae",
  "appId": "1:952217493126:web:890a51bcfeb2fb60433b07",
  "storageBucket": "lekha-sahayak-htnae.firebasestorage.app",
  "apiKey": "AIzaSyChjCZQBiLmr6YxkivJ8xIsIS_EwtUoF4k",
  "authDomain": "lekha-sahayak-htnae.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "952217493126"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
