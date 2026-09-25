import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { createOrUpdateUserProfile, getUserProfile, UserProfileData } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshUserProfile: () => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error: any; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
  signInWithGoogle: () => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const formatFirestoreError = (err: any): string => {
    if (!err) return 'Unable to load your profile data.';
    const code = err.code || err.message || '';
    if (code.includes('permission-denied') || code.includes('permission_denied')) {
      return 'Your account is authenticated, but access to your profile data is currently restricted by Firestore security rules.';
    }
    if (code.includes('unavailable') || code.includes('network')) {
      return 'Unable to connect to your profile database. Please check your network connection.';
    }
    return 'Unable to load your profile data. Please try again.';
  };

  const fetchProfile = async (currentUser: User | null, extraFullName?: string) => {
    if (!currentUser) {
      setUserProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const profile = await createOrUpdateUserProfile(
        currentUser,
        extraFullName ? { fullName: extraFullName } : undefined
      );
      setUserProfile(profile);
      setProfileError(null);
    } catch (err: any) {
      console.warn("Firestore profile fetch notice:", err?.message || err);
      setProfileError(formatFirestoreError(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const formatAuthError = (err: any) => {
    if (!err) return null;
    const code = err.code || '';
    const message = err.message || '';

    if (code === 'auth/email-already-in-use') {
      return { message: 'This email is already registered. Please log in instead.' };
    }
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      return { message: 'Invalid email address or password.' };
    }
    if (code === 'auth/weak-password') {
      return { message: 'Password should be at least 6 characters long.' };
    }
    if (code === 'auth/popup-closed-by-user') {
      return { message: 'Google sign-in was closed before completing authentication.' };
    }
    if (code === 'auth/popup-blocked') {
      return { message: 'Google sign-in was blocked by your browser. Please allow redirects.' };
    }
    if (code === 'auth/unauthorized-domain') {
      return { message: 'This domain is not authorized in Firebase Authentication settings.' };
    }
    if (code === 'auth/network-request-failed') {
      return { message: 'Unable to connect to authentication service. Please check your network connection.' };
    }
    if (code === 'auth/invalid-api-key' || !isFirebaseConfigured()) {
      return { message: 'Firebase authentication is not configured properly. Please check your VITE_FIREBASE_API_KEY in .env.' };
    }

    return { message: message || 'An unexpected authentication error occurred.' };
  };

  useEffect(() => {
    let isMounted = true;
    let redirectHandledUid: string | null = null;
    let unsubscribeAuthListener: (() => void) | null = null;

    const initAuth = async () => {
      // 1. Process redirect result first if returning from Google OAuth redirect
      try {
        console.log('[Auth] Initializing auth and checking getRedirectResult...');
        const userCredential = await getRedirectResult(auth);
        
        if (userCredential?.user) {
          console.log('[Auth] Redirect sign-in success for user:', userCredential.user.email);
          redirectHandledUid = userCredential.user.uid;
          if (isMounted) {
            setUser(userCredential.user);
            await fetchProfile(userCredential.user);
          }
        } else {
          console.log('[Auth] No pending redirect operation found (getRedirectResult is null).');
        }
      } catch (err: any) {
        console.error('[Auth] Error during getRedirectResult:', err?.code, err?.message, err);
        if (isMounted) {
          const formatted = formatAuthError(err);
          setProfileError(formatted?.message || err?.message || 'Authentication error during redirect.');
        }
      }

      if (!isMounted) return;

      // 2. Persistent Auth State Listener - attached after redirect processing check
      unsubscribeAuthListener = onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!isMounted) return;
          console.log('[Auth] onAuthStateChanged received:', currentUser ? currentUser.email : 'null');
          
          setUser(currentUser);
          setLoading(false);

          if (currentUser) {
            // Avoid redundant profile creation if already handled for this user by redirect result
            if (redirectHandledUid !== currentUser.uid) {
              await fetchProfile(currentUser);
            }
          } else {
            setUserProfile(null);
            setProfileLoading(false);
            setProfileError(null);
          }
        },
        (error: any) => {
          console.error('[Auth] Firebase auth state listener error:', error?.code, error?.message, error);
          if (isMounted) {
            setLoading(false);
          }
        }
      );
    };

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribeAuthListener) {
        unsubscribeAuthListener();
      }
    };
  }, []);

  const signUp = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        if (fullName) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        const updatedUser = auth.currentUser || userCredential.user;
        setUser({ ...updatedUser });
        setLoading(false);
        // Trigger profile fetch asynchronously
        fetchProfile(updatedUser, fullName);
      } else {
        setLoading(false);
      }

      return { error: null, user: userCredential.user };
    } catch (err: any) {
      setLoading(false);
      return { error: formatAuthError(err), user: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setLoading(false);
      if (userCredential.user) {
        fetchProfile(userCredential.user);
      }
      return { error: null, user: userCredential.user };
    } catch (err: any) {
      setLoading(false);
      return { error: formatAuthError(err), user: null };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
      return { error: null, user: null };
    } catch (err: any) {
      setLoading(false);
      return { error: formatAuthError(err), user: null };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setUser(null);
      setUserProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      setLoading(false);
      return { error: formatAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        profileLoading,
        profileError,
        refreshUserProfile,
        signUp,
        signIn,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
