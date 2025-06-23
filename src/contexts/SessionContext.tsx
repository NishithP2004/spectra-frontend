import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

interface SessionState {
  namespace: string | null;
  vnc_passwd: string | null;
  session_id: string | null;
  isActive: boolean;
  isLoading: boolean;
}

interface SessionContextType {
  sessionState: SessionState;
  startSession: (enableRecording: boolean) => Promise<{ success: boolean; message: string; sessionId?: string }>;
  endSession: () => Promise<{ success: boolean; message: string }>;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Global request deduplication
const activeRequests = new Map<string, Promise<{ success: boolean; message: string; sessionId?: string }>>();

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>({
    namespace: null,
    vnc_passwd: null,
    session_id: null,
    isActive: false,
    isLoading: false,
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:80';
  const requestIdRef = useRef(0);

  const startSession = useCallback(async (enableRecording: boolean): Promise<{ success: boolean; message: string; sessionId?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    // Create a unique request key
    const requestKey = `start-session-${currentUser.uid}-${enableRecording}`;
    
    // Check if there's already an active request for this user and configuration
    if (activeRequests.has(requestKey)) {
      console.log(`[SessionContext] Request already in progress for key: ${requestKey}`);
      return activeRequests.get(requestKey)!;
    }

    // Prevent multiple simultaneous requests
    if (sessionState.isLoading) {
      console.log(`[SessionContext] Session is already loading, skipping request`);
      return { success: false, message: 'Session is already being started' };
    }

    const currentRequestId = ++requestIdRef.current;
    console.log(`[SessionContext] Starting session request ${currentRequestId} for user ${currentUser.uid}`);

    setSessionState(prev => ({ ...prev, isLoading: true }));

    const requestPromise = (async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log(`[SessionContext] Making API request to ${BACKEND_URL}/start-session`);
        const response = await fetch(`${BACKEND_URL}/start-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            enable_recording: enableRecording,
          }),
        });

        const data = await response.json();
        console.log(`[SessionContext] API response for request ${currentRequestId}:`, data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start session');
        }

        // Check if session already exists
        if (data.message === 'Session exists') {
          setSessionState({
            namespace: data.namespace,
            vnc_passwd: data.vnc_passwd,
            session_id: data.session_id,
            isActive: true,
            isLoading: false,
          });

          // Create agent session with existing session ID
          await createAgentSession(data.session_id, token);
          
          return { 
            success: true, 
            message: 'Session already exists and is ready',
            sessionId: data.session_id
          };
        }

        // New session created
        setSessionState({
          namespace: data.namespace,
          vnc_passwd: data.vnc_passwd,
          session_id: data.session_id,
          isActive: true,
          isLoading: false,
        });

        // Create agent session with new session ID
        await createAgentSession(data.session_id, token);

        return { 
          success: true, 
          message: 'Session started successfully',
          sessionId: data.session_id
        };
      } catch (error) {
        console.error(`[SessionContext] Error in request ${currentRequestId}:`, error);
        setSessionState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to start session' 
        };
      } finally {
        // Remove the request from active requests
        activeRequests.delete(requestKey);
      }
    })();

    // Store the request promise
    activeRequests.set(requestKey, requestPromise);

    return requestPromise;
  }, [currentUser, BACKEND_URL, sessionState.isLoading]);

  // Function to create agent session with retry logic
  const createAgentSession = async (sessionId: string, token: string) => {
    const maxRetries = 5;
    const initialDelay = 2000; // 2 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[SessionContext] Attempt ${i + 1} to create agent session for sessionId: ${sessionId}`);
        
        const agentSessionUrl = `${BACKEND_URL}/agent/apps/spectra-agent/users/${currentUser!.uid}/sessions/${sessionId}`;
        
        const response = await fetch(agentSessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log(`[SessionContext] Agent session created successfully:`, data);
          return; // Success, exit the loop
        }

        // Check for "Session already exists" which is a success condition
        if (response.status === 400 && data.detail && data.detail.includes('Session already exists')) {
          console.log(`[SessionContext] Agent session already exists for sessionId: ${sessionId}`);
          return; // Success, exit the loop
        }

        // For other errors, throw to trigger retry
        throw new Error(data.detail || `Failed to create agent session: ${response.status}`);

      } catch (error) {
        console.error(`[SessionContext] Error creating agent session (Attempt ${i + 1}):`, error);
        
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          console.log(`[SessionContext] Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`[SessionContext] Max retries reached for agent session creation.`);
          // Don't rethrow, as we don't want to fail the main session startup
        }
      }
    }
  };

  const endSession = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !sessionState.isActive) {
      return { success: false, message: 'No active session to end' };
    }

    // Prevent multiple simultaneous requests
    if (sessionState.isLoading) {
      return { success: false, message: 'Session is already being ended' };
    }

    setSessionState(prev => ({ ...prev, isLoading: true }));

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BACKEND_URL}/end-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to end session');
      }

      // Clear session state
      setSessionState({
        namespace: null,
        vnc_passwd: null,
        session_id: null,
        isActive: false,
        isLoading: false,
      });

      return { success: true, message: data.message || 'Session ended successfully' };
    } catch (error) {
      console.error('Error ending session:', error);
      setSessionState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to end session' 
      };
    }
  }, [currentUser, sessionState.isActive, sessionState.isLoading, BACKEND_URL]);

  const clearSession = useCallback(() => {
    setSessionState({
      namespace: null,
      vnc_passwd: null,
      session_id: null,
      isActive: false,
      isLoading: false,
    });
  }, []);

  const value = {
    sessionState,
    startSession,
    endSession,
    clearSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
} 