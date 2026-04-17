import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// If the above line causes a TS error, it might be due to environment-specific type resolution.
// getReactNativePersistence is typically exported from 'firebase/auth' in RN environments.

// Replace these with your actual Firebase config keys from the Firebase console
const firebaseConfig = {
  apiKey: "[GCP_API_KEY]",
  authDomain: "medimind-ai-7nctq.firebaseapp.com",
  projectId: "medimind-ai-7nctq",
  storageBucket: "medimind-ai-7nctq.firebasestorage.app",
  messagingSenderId: "2916352478",
  appId: "1:2916352478:web:bae903cbdfdcfd1a7f5d4f"
};

import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for Expo
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const functions = getFunctions(app);

// Helper for results
export const saveTestResult = async (userId: string, resultData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'results'), {
      ...resultData,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const getUserResults = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'results'),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
};

export { app, auth, db, functions };
