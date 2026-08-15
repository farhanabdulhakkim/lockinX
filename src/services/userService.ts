import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const registerUser = async (email: string, password: string, username: string) => {
  // 1. Create Auth Account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Generate Friend Code (e.g., FARHAN-8K2P)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const friendCode = `${prefix}-${randomSuffix}`;

  // 3. Create Firestore Profile with default stats
  await setDoc(doc(db, 'users', user.uid), {
    userId: user.uid,
    username,
    displayName: username,
    profileImage: '',
    friendCode,
    consistencyScore: 0,
    coins: 0,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: new Date().toISOString()
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
