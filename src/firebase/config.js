
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjH5nLLG0agqzNCNGFRhvdhgxqbD6tMrw",
  authDomain: "shop-order-system.firebaseapp.com",
  projectId: "shop-order-system",
  storageBucket: "shop-order-system.firebasestorage.app",
  messagingSenderId: "900034740250",
  appId: "1:900034740250:web:0364a7b033fcdd679311a3",
  measurementId: "G-BG1SB1VC8H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);