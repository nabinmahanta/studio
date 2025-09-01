import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "khatapay-5a219",
  "appId": "1:602356943444:web:f8515e2193b3334e341a02",
  "storageBucket": "khatapay-5a219.appspot.com",
  "apiKey": "AIzaSyAzYBDG70p6dtmHk3fXgYI_LpCj4C12dZA",
  "authDomain": "khatapay-5a219.firebaseapp.com",
  "messagingSenderId": "602356943444"
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
