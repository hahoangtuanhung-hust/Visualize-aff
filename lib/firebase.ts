import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7AKyzHUNDuLjRFPp8ZGceVRzcDLZ-HlE",
  authDomain: "shopee-voucher-hub.firebaseapp.com",
  projectId: "shopee-voucher-hub",
  storageBucket: "shopee-voucher-hub.firebasestorage.app",
  messagingSenderId: "450342021515",
  appId: "1:450342021515:web:ca21750ba79e500bcca78e",
  measurementId: "G-6360XJGW4N"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Initialize Analytics safely on client side
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)));
}

export { app, db, analytics };
