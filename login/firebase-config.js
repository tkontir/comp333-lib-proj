/* Firebase Configuration and Initialization */

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2JOabdyNAqneol6KC2O_XIRtz74JSnmA",
  authDomain: "comp333-6beb3.firebaseapp.com",
  projectId: "comp333-6beb3",
  storageBucket: "comp333-6beb3.firebasestorage.app",
  messagingSenderId: "265472657782",
  appId: "1:265472657782:web:edb748f413e78f4ddc1257",
  measurementId: "G-T17NKC4JE0"
};

// Initialize Firebase and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth instance for use in other modules
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };
