import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfGW6ZzVDvCX8Nps6S4Zz55I50v0i-tVw",
  authDomain: "pnle-smartcards.firebaseapp.com",
  projectId: "pnle-smartcards",
  storageBucket: "pnle-smartcards.firebasestorage.app",
  messagingSenderId: "1023812034966",
  appId: "1:1023812034966:web:59ff31d3bd0ef044ecfdb7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };