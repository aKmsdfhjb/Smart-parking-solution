// Authentication Service
// Handles user authentication using Firebase Auth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'user'
): Promise<User> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update display name
    await updateProfile(userCredential.user, { displayName: name });

    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
      email,
      name,
      role,
      createdAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return {
      uid: userCredential.user.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register user');
  }
}

/**
 * Sign in with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return {
      uid: userCredential.user.uid,
      ...userDoc.data(),
    } as User;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUserData(
  uid: string
): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return null;
    }

    return {
      uid,
      ...userDoc.data(),
    } as User;
  } catch (error: any) {
    console.error('Get user data error:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
