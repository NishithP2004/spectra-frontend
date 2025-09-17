import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
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
  refreshToken: () => Promise<string | null>;
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
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        setCurrentUser(result.user);
      });
  }

  async function logout() {
    // Clear token refresh intervals
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
      tokenRefreshIntervalRef.current = null;
    }
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
      tokenRefreshTimeoutRef.current = null;
    }
    
    return signOut(auth).then(() => {
      setCurrentUser(null);
      sessionStorage.removeItem("token");
    });
  }

  // Function to refresh the Firebase ID token
  const refreshToken = async (user: User) => {
    try {
      const idToken = await user.getIdToken(true); // Force refresh
      sessionStorage.setItem("token", idToken);
      console.log("Firebase ID Token refreshed successfully.");
      return idToken;
    } catch (error) {
      console.error("Error refreshing ID token:", error);
      // If token refresh fails, the user might need to re-authenticate
      sessionStorage.removeItem("token");
      return null;
    }
  };

  // Function to get token expiration time (Firebase tokens expire in 1 hour)
  const getTokenExpirationTime = (token: string): number | null => {
    try {
      // Decode the JWT token to get expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error("Error parsing token expiration:", error);
      return null;
    }
  };

  // Function to schedule token refresh
  const scheduleTokenRefresh = (user: User) => {
    // Clear any existing refresh timeout
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
    }

    // Get current token to check expiration
    user.getIdToken().then((token) => {
      const expirationTime = getTokenExpirationTime(token);
      if (expirationTime) {
        // Refresh token 5 minutes before expiration (55 minutes after issue)
        const refreshTime = expirationTime - Date.now() - (5 * 60 * 1000);
        
        if (refreshTime > 0) {
          tokenRefreshTimeoutRef.current = setTimeout(() => {
            refreshToken(user);
            // Schedule next refresh
            scheduleTokenRefresh(user);
          }, refreshTime);
          
          console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
        } else {
          // Token is already close to expiration, refresh immediately
          refreshToken(user);
          scheduleTokenRefresh(user);
        }
      }
    }).catch((error) => {
      console.error("Error getting token for refresh scheduling:", error);
    });
  };

  // Function to start periodic token refresh (every 30 minutes as backup)
  const startPeriodicTokenRefresh = (user: User) => {
    // Clear any existing interval
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }

    // Refresh token every 30 minutes as a backup
    tokenRefreshIntervalRef.current = setInterval(() => {
      refreshToken(user);
    }, 30 * 60 * 1000); // 30 minutes

    console.log("Periodic token refresh started (every 30 minutes)");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Get initial token and start refresh mechanisms
        user.getIdToken(true).then((idToken) => {
          sessionStorage.setItem("token", idToken);
          console.log("Firebase ID Token saved to sessionStorage.");
          
          // Start token refresh mechanisms
          scheduleTokenRefresh(user);
          startPeriodicTokenRefresh(user);
        }).catch((error) => {
          console.error("Error getting ID token for sessionStorage:", error);
          sessionStorage.removeItem("token");
        });
      } else {
        // Clear all refresh mechanisms when user signs out
        if (tokenRefreshIntervalRef.current) {
          clearInterval(tokenRefreshIntervalRef.current);
          tokenRefreshIntervalRef.current = null;
        }
        if (tokenRefreshTimeoutRef.current) {
          clearTimeout(tokenRefreshTimeoutRef.current);
          tokenRefreshTimeoutRef.current = null;
        }
        
        sessionStorage.removeItem("token");
        console.log("User signed out, token removed from sessionStorage.");
      }
    });

    return () => {
      unsubscribe();
      // Cleanup intervals on unmount
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
    };
  }, []);

  // Public function to manually refresh token
  const refreshTokenPublic = async (): Promise<string | null> => {
    if (currentUser) {
      return await refreshToken(currentUser);
    }
    return null;
  };

  const value = {
    currentUser,
    loading,
    googleSignIn,
    logout,
    refreshToken: refreshTokenPublic
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}