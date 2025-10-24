import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDlj-1N6zSVhylKAhIjOAANGsoqcVDGm40",
  authDomain: "dnd5etools-73.firebaseapp.com",
  projectId: "dnd5etools-73",
  storageBucket: "dnd5etools-73.appspot.com",
  messagingSenderId: "858373640437",
  appId: "1:858373640437:web:e891576fe9bbbcd501b5bc"
};
const app = initializeApp(firebaseConfig);
getAuth(app);
new GoogleAuthProvider();
export {
  app as a
};
