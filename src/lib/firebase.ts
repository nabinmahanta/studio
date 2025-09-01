import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChjCZQBiLmr6YxkivJ8xIsIS_EwtUoF4k",
  authDomain: "lekha-sahayak-htnae.firebaseapp.com",
  projectId: "lekha-sahayak-htnae",
  storageBucket: "lekha-sahayak-htnae.appspot.com",
  messagingSenderId: "952217493126",
  appId: "1:952217493126:web:890a51bcfeb2fb60433b07"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
