import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        setCurrentUser(result.user);
      });
  }

  async function logout() {
    return signOut(auth).then(() => {
      setCurrentUser(null);
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        user.getIdToken(true).then((idToken) => {
          sessionStorage.setItem("token", idToken);
          console.log("Firebase ID Token saved to sessionStorage.");
        }).catch((error) => {
          console.error("Error getting ID token for sessionStorage:", error);
          sessionStorage.removeItem("token"); // Clear if token retrieval fails
        });
      } else {
        sessionStorage.removeItem("token");
        console.log("User signed out, token removed from sessionStorage.");
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    googleSignIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}