import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getAuth, initializeAuth, type Persistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDB4ltZmpAwirgQnwNDwvqeMnuSKZiEVY",
  authDomain: "heatradar-689ef.firebaseapp.com",
  projectId: "heatradar-689ef",
  storageBucket: "heatradar-689ef.firebasestorage.app",
  messagingSenderId: "717353489884",
  appId: "1:717353489884:web:9e0461cedaf38cbe28ab19",
  measurementId: "G-DWWENX9TGB",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = initializePersistentAuth();
export const db = getFirestore(firebaseApp);

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

function initializePersistentAuth() {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}
