import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARaSyxZzenwAu9KYm4s12L2ip_SveoU-0",
  authDomain: "invare-sa.firebaseapp.com",
  projectId: "invare-sa",
  storageBucket: "invare-sa.firebasestorage.app",
  messagingSenderId: "631292521850",
  appId: "1:631292521850:web:3872c41c78e75c7a7e7ac3",
  measurementId: "G-ZGNJPSHDPX",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { app, auth, provider };
