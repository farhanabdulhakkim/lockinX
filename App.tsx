import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './src/services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from './src/store/authStore';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    // Firebase Listener: Watches for login/logout events
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Real-time listener for the user's Firestore profile (friendCode, username, streaks, etc.)
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() });
            } else {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error reading user profile:", error);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeUserDoc) {
          unsubscribeUserDoc();
          unsubscribeUserDoc = null;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      unsubscribeAuth();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
