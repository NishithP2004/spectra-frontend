import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../contexts/SessionContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

interface SessionManagerProps {
  enableRecording: boolean;
  onSessionReady: (sessionId: string) => void;
  onError: (error: string) => void;
}

// Global singleton to prevent duplicate requests across React StrictMode
class SessionManagerSingleton {
  private static instance: SessionManagerSingleton;
  private isInitializing = false;
  private currentRequest: Promise<{ success: boolean; message: string; sessionId?: string; isExistingSession?: boolean }> | null = null;
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
    startSessionFn: (enableRecording: boolean) => Promise<{ success: boolean; message: string; sessionId?: string; isExistingSession?: boolean }>,
    onSessionReady: (sessionId: string) => void,
    onError: (error: string) => void
  ): Promise<{ success: boolean; message: string; sessionId?: string; isExistingSession?: boolean }> {
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
          this.startCountdown(result.isExistingSession);
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

  private startCountdown(isExistingSession = false) {
    let timeLeft = isExistingSession ? 3 : 10; // Faster countdown for existing sessions

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Starting Session...");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const singleton = useRef(SessionManagerSingleton.getInstance());
  const { addToast } = useToast();

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
        if (result.isExistingSession) {
          addToast(result.message, 'info');
          setStatusMessage("Resuming Session...");
        } else {
          addToast(result.message, 'success');
        }

        // Start local countdown for UI
        const maxTime = result.isExistingSession ? 3 : 10;
        let timeLeft = maxTime;

        countdownRef.current = setInterval(() => {
          timeLeft--;
          setLoadingTime(maxTime - timeLeft);

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
        addToast(result.message, 'error');
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
  }, [enableRecording, startSession, onSessionReady, onError, isInitialized, addToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  if (sessionState.isLoading || isInitialized) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors duration-300">
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transition-all duration-300">
          <LoadingSpinner />
          <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white transition-colors">
            {statusMessage}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors">
            Please wait while we initialize your browser environment
          </p>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden transition-colors">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: '100%' }} // Indeterminate or just full width usually looks better for short loads, but let's animate if we can match time
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionManager;