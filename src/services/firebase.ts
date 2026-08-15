import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYIQuVWTw8wusZpWPQsy_NXxP4B9-nNyg",
  authDomain: "lockin-23bd9.firebaseapp.com",
  databaseURL: "https://lockin-23bd9-default-rtdb.firebaseio.com",
  projectId: "lockin-23bd9",
  storageBucket: "lockin-23bd9.firebasestorage.app",
  messagingSenderId: "873404888910",
  appId: "1:873404888910:web:544d40b8d5a760e42d501f",
  measurementId: "G-MEQGX75L9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with Mobile Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);
