import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAR3KNF_gyGqinldLAxMhidb42lgvZ1swI",
  authDomain: "paths0.firebaseapp.com",
  projectId: "paths0",
  storageBucket: "paths0.firebasestorage.app",
  messagingSenderId: "473079489172",
  appId: "1:473079489172:web:f7daa8a5e811fc42b98a81",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    console.error("Auth Error", err);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout Error", err);
  }
};

export { onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, type User };
