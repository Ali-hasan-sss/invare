// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkcbV240dlPntbAXcuejXCuW7Q6pJ_bkQ",
  authDomain: "invare-bd572.firebaseapp.com",
  projectId: "invare-bd572",
  storageBucket: "invare-bd572.firebasestorage.app",
  messagingSenderId: "268628072160",
  appId: "1:268628072160:web:493db1deffb5c97c0ae285",
  measurementId: "G-S7R8T5F5Z9",
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (typeof window !== "undefined") {
  try {
    // Only initialize if no apps exist
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase Auth
    if (app) {
      auth = getAuth(app);
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Export with null checks
export { app, auth };
