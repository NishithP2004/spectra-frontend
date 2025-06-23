import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../contexts/SessionContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface SessionManagerProps {
  enableRecording: boolean;
  onSessionReady: (sessionId: string) => void;
  onError: (error: string) => void;
}

// Global singleton to prevent duplicate requests across React StrictMode
class SessionManagerSingleton {
  private static instance: SessionManagerSingleton;
  private isInitializing = false;
  private currentRequest: Promise<{ success: boolean; message: string; sessionId?: string }> | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private onSessionReadyCallback: ((sessionId: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private sessionId: string | null = null;

  static getInstance(): SessionManagerSingleton {
    if (!SessionManagerSingleton.instance) {
      SessionManagerSingleton.instance = new SessionManagerSingleton();
    }
    return SessionManagerSingleton.instance;
  }

  async startSession(
    enableRecording: boolean,
    startSessionFn: (enableRecording: boolean) => Promise<{ success: boolean; message: string; sessionId?: string }>,
    onSessionReady: (sessionId: string) => void,
    onError: (error: string) => void
  ): Promise<{ success: boolean; message: string; sessionId?: string }> {
    console.log('[SessionManagerSingleton] startSession called');

    // If already initializing, return the existing request
    if (this.isInitializing && this.currentRequest) {
      console.log('[SessionManagerSingleton] Request already in progress, returning existing promise');
      this.onSessionReadyCallback = onSessionReady;
      this.onErrorCallback = onError;
      return this.currentRequest;
    }

    this.isInitializing = true;
    this.onSessionReadyCallback = onSessionReady;
    this.onErrorCallback = onError;

    this.currentRequest = (async () => {
      try {
        console.log('[SessionManagerSingleton] Making actual API request');
        const result = await startSessionFn(enableRecording);
        
        if (result.success) {
          // Store the session ID for later use
          this.sessionId = result.sessionId || null;
          // Start countdown
          this.startCountdown();
        } else {
          this.onErrorCallback?.(result.message);
        }
        
        return result;
      } catch (error) {
        console.error('[SessionManagerSingleton] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
        this.onErrorCallback?.(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        this.isInitializing = false;
        this.currentRequest = null;
      }
    })();

    return this.currentRequest;
  }

  private startCountdown() {
    let timeLeft = 10;
    
    this.countdownInterval = setInterval(() => {
      timeLeft--;
      
      if (timeLeft <= 0) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        // Call the callback when countdown is complete
        if (this.sessionId && this.onSessionReadyCallback) {
          console.log('[SessionManagerSingleton] Countdown complete, calling onSessionReady with sessionId:', this.sessionId);
          this.onSessionReadyCallback(this.sessionId);
        } else {
          console.error('[SessionManagerSingleton] No session ID available for callback');
        }
      }
    }, 1000);
  }

  cleanup() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.isInitializing = false;
    this.currentRequest = null;
    this.onSessionReadyCallback = null;
    this.onErrorCallback = null;
    this.sessionId = null;
  }

  getIsInitializing(): boolean {
    return this.isInitializing;
  }
}

const SessionManager: React.FC<SessionManagerProps> = ({
  enableRecording,
  onSessionReady,
  onError,
}) => {
  const { sessionState, startSession } = useSession();
  const [loadingTime, setLoadingTime] = useState(0);
  const [alertMessage, setAlertMessage] = useState<{ text: string; severity: AlertColor } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const singleton = useRef(SessionManagerSingleton.getInstance());

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('[SessionManager] Already initialized, skipping');
      return;
    }

    const initializeSession = async () => {
      console.log('[SessionManager] Starting session initialization');
      setIsInitialized(true);

      const result = await singleton.current.startSession(
        enableRecording,
        startSession,
        onSessionReady,
        onError
      );

      if (result.success) {
        setAlertMessage({ text: result.message, severity: 'success' });
        
        // Start local countdown for UI
        let timeLeft = 10;
        countdownRef.current = setInterval(() => {
          timeLeft--;
          setLoadingTime(10 - timeLeft);
          
          if (timeLeft <= 0) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            // The singleton will handle calling onSessionReady with the correct session ID
            console.log('[SessionManager] Local countdown complete');
          }
        }, 1000);
      } else {
        setAlertMessage({ text: result.message, severity: 'error' });
        onError(result.message);
      }
    };

    initializeSession();

    // Cleanup function
    return () => {
      console.log('[SessionManager] Component unmounting, cleaning up');
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [enableRecording, startSession, onSessionReady, onError, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  if (sessionState.isLoading || loadingTime < 10) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <LoadingSpinner />
          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            Starting Session...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please wait while we initialize your browser environment
          </p>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(loadingTime / 10) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {loadingTime}/10 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {alertMessage && (
        <Snackbar
          open={Boolean(alertMessage)}
          autoHideDuration={5000}
          onClose={() => setAlertMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setAlertMessage(null)} severity={alertMessage.severity} sx={{ width: '100%' }}>
            {alertMessage.text}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default SessionManager; 