import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkcbV240dlPntbAXcuejXCuW7Q6pJ_bkQ",
  authDomain: "invare-bd572.firebaseapp.com",
  projectId: "invare-bd572",
  storageBucket: "invare-bd572.appspot.com",
  messagingSenderId: "268628072160",
  appId: "1:268628072160:web:493db1deffb5c97c0ae285",
  measurementId: "G-S7R8T5F5Z9",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { app, auth, provider };
