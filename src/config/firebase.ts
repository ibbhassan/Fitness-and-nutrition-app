import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "evoke-fitness-8e8e8",
  appId: "1:803703987761:web:bf2f28442f12fdc5b0ff10",
  storageBucket: "evoke-fitness-8e8e8.firebasestorage.app",
  apiKey: "AIzaSyDe-qytkBRmHNzB6O0Bo2Xho5NNHjT6Egs",
  authDomain: "evoke-fitness-8e8e8.firebaseapp.com",
  messagingSenderId: "803703987761",
  measurementId: "G-6J6V0YBVC5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);
