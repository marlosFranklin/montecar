import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw34KU0K-A5Sq513f3xe3o75NSMiutL2M",
  authDomain: "webcarros-c24cb.firebaseapp.com",
  projectId: "webcarros-c24cb",
  storageBucket: "webcarros-c24cb.firebasestorage.app",
  messagingSenderId: "858573237758",
  appId: "1:858573237758:web:adb5a4040c75dee86624af",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
