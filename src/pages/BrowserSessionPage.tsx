import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import VncDisplay from '../components/session/VncDisplay';
import ChatInterface from '../components/chat/ChatInterface';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Session } from '../types/session';
import { LogEntry } from '../components/chat/ActivityLogItem';
import { ArrowLeft, MessageSquare, Monitor, Copy, Check, RefreshCw, Shield, MoreVertical, Clock, Hash } from 'lucide-react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Interface for page-level alerts
interface PageAlert {
  text: string;
  severity: AlertColor;
}

const BrowserSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser, refreshToken } = useAuth();
  const { sessionState, endSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'vnc' | 'chat'>('vnc'); // Mobile view state
  const [showVncDetails, setShowVncDetails] = useState(false);
  const [tokenRefreshStatus, setTokenRefreshStatus] = useState<'idle' | 'refreshing' | 'success' | 'error'>('idle');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [showIdTooltip, setShowIdTooltip] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const idTooltipRef = useRef<HTMLDivElement | null>(null);
  const statusTooltipRef = useRef<HTMLDivElement | null>(null);
  
  const isHackingMode = session?.options.mode === "Hacking";

  useEffect(() => {
    if (location.state?.message && location.state?.severity) {
      setPageAlert({ text: location.state.message, severity: location.state.severity as AlertColor });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (sessionState.isActive && sessionState.session_id === sessionId) {
      const mode = location.state?.modePreference === "Hacking Mode" ? "Hacking" : "Normal";
      const newSession: Session = {
        id: sessionState.session_id,
        title: location.state?.title || (mode === 'Hacking' ? 'Hacking Environment' : 'Secure Browsing Session'),
        createdAt: new Date(),
        owner: {
          uid: currentUser!.uid,
          name: currentUser!.displayName || 'User',
          photo: currentUser!.photoURL || '',
        },
        options: {
          enableRecording: location.state?.enableRecording || false,
          mode: mode,
          privacy: 'public',
        },
      };
      setSession(newSession);
      setSessionStartTime(new Date());
      setActivityLog([{ 
        source: 'system', 
        message: `Session "${newSession.title}" is active. Agent ready.`,
        timestamp: new Date() 
      }]);
      setLoading(false);
      setError(null);
    } else if (sessionState.isLoading) {
      setLoading(true);
      setError(null);
    } else if (!sessionState.isActive && !sessionState.isLoading) {
      setError("Session is not active or could not be found.");
      setLoading(false);
    }
  }, [sessionState, sessionId, currentUser, location.state]);

  // Session duration tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStartTime) {
      interval = setInterval(() => {
        setCurrentDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStartTime]);

  useEffect(() => {
    if (isHackingMode) {
      document.body.classList.add('hacker-theme');
    } else {
      document.body.classList.remove('hacker-theme');
    }
    
    return () => {
      document.body.classList.remove('hacker-theme');
    };
  }, [isHackingMode]);
  
  const handleUserMessage = useCallback(async (message: { type: string, content: string }) => {
    if (!currentUser || !sessionId) return;

    // Add user message to log
    const userLog: LogEntry = {
      source: 'user',
      message: message.content,
      timestamp: new Date(),
    };
    setActivityLog(prev => [...prev, userLog]);

    // API call to the AI agent using /run_sse
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:80';
      const response = await fetch(`${BACKEND_URL}/agent/run_sse`, { // Changed to /run_sse
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        },
        body: JSON.stringify({
          appName: 'spectra-agent', // Consistent with previous agent name
          userId: currentUser.uid,
          sessionId: sessionId,
          newMessage: {
            role: 'user',
            parts: [{ text: message.content }],
          },
          streaming: false, // As per user example for /run_sse
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null, cannot process SSE stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        let eolIndex;
        // SSE messages are separated by double newlines.
        while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
          const lineBlock = buffer.substring(0, eolIndex);
          buffer = buffer.substring(eolIndex + 2); // Consume the message and the two newlines

          // Process multi-line data blocks if necessary, focusing on lines starting with "data:"
          const lines = lineBlock.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.substring('data: '.length);
              try {
                const eventData = JSON.parse(jsonString);
                // console.log('SSE Event Parsed:', eventData); // For debugging

                let messageContent = "Received an unhandled event type.";
                let eventSource: LogEntry['source'] = 'system'; // Default source
                let eventTimestamp = eventData.timestamp ? new Date(eventData.timestamp * 1000) : new Date();

                if (eventData.content && eventData.content.parts && eventData.content.parts.length > 0) {
                  const part = eventData.content.parts[0];
                  const role = eventData.content.role;

                  if (role === 'model') {
                    eventSource = 'ai';
                    if (part.text) {
                      messageContent = part.text;
                    } else if (part.functionCall) {
                      messageContent = `Function Call: ${part.functionCall.name}(${JSON.stringify(part.functionCall.args)})`;
                    } else {
                      messageContent = "AI model event with unrecognized content part.";
                    }
                  } else if (role === 'user') { // In SSE example, tool response has role: 'user'
                    eventSource = 'system'; // Mapping tool/function responses to 'system' source
                    if (part.functionResponse) {
                      messageContent = `Tool Response [${part.functionResponse.name}]: ${JSON.stringify(part.functionResponse.response)}`;
                    } else if (part.text) {
                       // This case is less common for role: 'user' in SSE from agent after initial message
                      eventSource = 'user'; // If it's truly a user message echoed or relayed
                      messageContent = part.text;
                    } else {
                      messageContent = "User/Tool event with unrecognized content part.";
                    }
                  } else if (role) {
                     eventSource = 'system';
                     messageContent = `Event from '${role}': ${JSON.stringify(part)}`;
                  } else {
                    messageContent = `Event with no role: ${JSON.stringify(eventData.content)}`;
                  }
                } else {
                  messageContent = `Received event with no/empty content parts: ${JSON.stringify(eventData)}`;
                }
                
                const newLogEntry: LogEntry = {
                  source: eventSource,
                  message: messageContent,
                  timestamp: eventTimestamp,
                };
                setActivityLog(prev => [...prev, newLogEntry]);

              } catch (e) {
                console.error("Error parsing SSE JSON data:", e, "Raw data string:", jsonString);
                const errorLogEntry: LogEntry = {
                  source: 'system',
                  message: `Error processing AI event JSON: ${e instanceof Error ? e.message : 'Unknown parse error'}`,
                  timestamp: new Date(),
                };
                setActivityLog(prev => [...prev, errorLogEntry]);
              }
            } // End if (line.startsWith('data: '))
          } // End for (const line of lines)
        } // End while ((eolIndex = buffer.indexOf('\n\n')) >= 0)
      } // End while (true) read stream

      // Handle any remaining part of the buffer if stream ends abruptly (less common with \n\n delimiter)
      if (buffer.trim().startsWith('data: ')) {
        const jsonString = buffer.trim().substring('data: '.length);
        if (jsonString) {
            console.warn("Processing trailing SSE data:", jsonString);
            // Simplified: Attempt to parse and log, similar to above. 
            // A full implementation might require more robust partial message handling here.
            try {
                const eventData = JSON.parse(jsonString);
                const newLogEntry: LogEntry = {
                    source: 'system',
                    message: `Trailing event data: ${JSON.stringify(eventData.content || eventData)}`,
                    timestamp: new Date(eventData.timestamp ? eventData.timestamp * 1000 : Date.now()),
                };
                setActivityLog(prev => [...prev, newLogEntry]);
            } catch (e) {
                console.error("Error parsing trailing SSE JSON data:", e, "Raw data string:", jsonString);
                const errorLogEntry: LogEntry = {
                  source: 'system',
                  message: `Error processing trailing AI event: ${e instanceof Error ? e.message : 'Unknown error'}`,
                  timestamp: new Date(),
                };
                setActivityLog(prev => [...prev, errorLogEntry]);
            }
        }
      }

    } catch (error) {
      console.error("Error calling AI agent via /run_sse:", error);
      const errorLogEntry: LogEntry = {
        source: 'system',
        message: `Error communicating with AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setActivityLog(prev => [...prev, errorLogEntry]);
    }
  }, [currentUser, sessionId]);
  
  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      try {
        const result = await endSession();
        if (result.success) {
          setPageAlert({ text: result.message, severity: 'success' });
          // Navigate back to home after a short delay
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: 'Session ended successfully', 
                severity: 'success' 
              } 
            });
          }, 2000);
        } else {
          setPageAlert({ text: result.message, severity: 'error' });
        }
      } catch (error) {
        console.error('Error ending session:', error);
        setPageAlert({ 
          text: error instanceof Error ? error.message : 'Failed to end session', 
          severity: 'error' 
        });
      }
    }
  };

  const vncUrl = useMemo(() => {
    if (sessionState.isActive && currentUser) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:80';
      // Replace http/https with ws for the websocket connection
      const wsUrl = backendUrl.replace(/https?/, 'ws');
      return `${wsUrl}/vnc?uid=${currentUser.uid}`;
    }
    return '';
  }, [sessionState.isActive, currentUser]);

  // Format duration helper
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Manual token refresh function
  const handleTokenRefresh = async () => {
    setTokenRefreshStatus('refreshing');
    try {
      const newToken = await refreshToken();
      if (newToken) {
        setTokenRefreshStatus('success');
        setTimeout(() => setTokenRefreshStatus('idle'), 2000);
      } else {
        setTokenRefreshStatus('error');
        setTimeout(() => setTokenRefreshStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setTokenRefreshStatus('error');
      setTimeout(() => setTokenRefreshStatus('idle'), 3000);
    }
  };

  // Close VNC details dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVncDetails) {
        const target = event.target as Element;
        if (!target.closest('[data-vnc-details]')) {
          setShowVncDetails(false);
        }
      }
      // Close mobile menu if click outside
      if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
      if (showIdTooltip && idTooltipRef.current && !idTooltipRef.current.contains(event.target as Node)) {
        setShowIdTooltip(false);
      }
      if (showStatusTooltip && statusTooltipRef.current && !statusTooltipRef.current.contains(event.target as Node)) {
        setShowStatusTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVncDetails, showMobileMenu, showIdTooltip, showStatusTooltip]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-slate-900 text-red-500">
        <h2 className="text-2xl font-semibold mb-4">{error}</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden ${isHackingMode ? 'hacker-theme' : ''} bg-slate-50 dark:bg-slate-900`}>
      <main className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between p-3 gap-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
          <button onClick={() => navigate('/')} aria-label="Back to Sessions" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline ml-1">Back to Sessions</span>
          </button>
          <div className="text-center flex-1 min-w-0 mx-2 md:mx-4">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{session?.title}</h1>
            {/* Desktop: full text details */}
            <div className="hidden md:flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <span>ID: {sessionId}</span>
              <span>•</span>
              <span>Duration: {formatDuration(currentDuration)}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Session Active</span>
              </div>
            </div>
            {/* Mobile: compact icons with tooltips */}
            <div className="flex md:hidden items-center justify-center space-x-4 text-slate-500 dark:text-slate-400">
              {/* ID icon with click tooltip */}
              <div className="relative" ref={idTooltipRef}>
                <button
                  onClick={() => setShowIdTooltip((v) => !v)}
                  className="flex items-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-haspopup="dialog"
                  aria-expanded={showIdTooltip}
                  aria-label={`Session ID: ${sessionId}`}
                >
                  <Hash className="w-4 h-4" />
                </button>
                {showIdTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 px-2 py-1 rounded shadow z-50">
                    Session ID: {sessionId}
                  </div>
                )}
              </div>

              {/* Duration always visible */}
              <div className="flex items-center" aria-label={`Duration: ${formatDuration(currentDuration)}`}>
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-xs text-slate-600 dark:text-slate-300">{formatDuration(currentDuration)}</span>
              </div>
              
              {/* Status icon with click tooltip */}
              <div className="relative" ref={statusTooltipRef}>
                <button
                  onClick={() => setShowStatusTooltip((v) => !v)}
                  className="flex items-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-haspopup="dialog"
                  aria-expanded={showStatusTooltip}
                  aria-label="Session Active"
                >
                  <Shield className="w-4 h-4" />
                </button>
                {showStatusTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 px-2 py-1 rounded shadow z-50">
                    Session Active
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {/* VNC Info Copy Button - Desktop only */}
            <div className="hidden md:block relative" data-vnc-details>
              <button
                onClick={() => setShowVncDetails(!showVncDetails)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                title="VNC Connection Details"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">VNC Details</span>
              </button>
              
              {/* VNC Details Dropdown */}
              {showVncDetails && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">VNC Connection Details</h4>
                    
                    {/* VNC URL */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">VNC URL</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={vncUrl}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(vncUrl, 'url')}
                          className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Copy VNC URL"
                        >
                          {copiedItem === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* VNC Password */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">VNC Password</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={sessionState.vnc_passwd || ''}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(sessionState.vnc_passwd || '', 'password')}
                          className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Copy VNC Password"
                        >
                          {copiedItem === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Instructions */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                      <p className="font-medium mb-1">How to connect:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Use any VNC client (VNC Viewer, RealVNC, etc.)</li>
                        <li>Enter the VNC URL above</li>
                        <li>Use the password when prompted</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop action buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Token Refresh Button */}
              <button
                onClick={handleTokenRefresh}
                disabled={tokenRefreshStatus === 'refreshing'}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  tokenRefreshStatus === 'refreshing'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 cursor-not-allowed'
                    : tokenRefreshStatus === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : tokenRefreshStatus === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="Refresh authentication token"
              >
                <RefreshCw className={`w-4 h-4 ${tokenRefreshStatus === 'refreshing' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {tokenRefreshStatus === 'refreshing' ? 'Refreshing...' : 
                   tokenRefreshStatus === 'success' ? 'Refreshed!' :
                   tokenRefreshStatus === 'error' ? 'Failed' : 'Refresh Token'}
                </span>
              </button>
              
              <button 
                onClick={handleEndSession} 
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                End Session
              </button>
            </div>

            {/* Mobile kebab menu */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setShowMobileMenu((v) => !v)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                aria-haspopup="menu"
                aria-expanded={showMobileMenu}
                title="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMobileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => { setShowMobileMenu(false); handleTokenRefresh(); }}
                    className="w-full flex items-center justify-start px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${tokenRefreshStatus === 'refreshing' ? 'animate-spin' : ''}`} />
                    {tokenRefreshStatus === 'refreshing' ? 'Refreshing…' : 'Refresh Token'}
                  </button>
                  <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => { setShowMobileMenu(false); handleEndSession(); }}
                    className="w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* VNC Display - Desktop always visible, mobile conditional */}
          <div className={`flex-1 flex flex-col bg-black ${mobileView === 'vnc' ? 'block' : 'hidden'} md:block`}>
            {sessionState.isActive && sessionState.vnc_passwd && (
              <VncDisplay
                url={vncUrl}
                vncPassword={sessionState.vnc_passwd}
                isHackingMode={isHackingMode}
              />
            )}
          </div>

          {/* Chat Interface - Desktop always visible, mobile conditional */}
          <div className={`
            w-full md:w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 
            transition-transform duration-300 ease-in-out 
            ${mobileView === 'chat' ? 'block' : 'hidden'} 
            md:block
          `}>
            <ChatInterface
              activityLog={activityLog}
              onSendMessage={handleUserMessage}
              sessionId={sessionId!}
              isHackingMode={isHackingMode}
              currentUser={currentUser}
            />
          </div>
        </div>
      </main>

      {/* Mobile Toggle Button - Bottom Right */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileView(mobileView === 'vnc' ? 'chat' : 'vnc')}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title={mobileView === 'vnc' ? 'Switch to Activity Log' : 'Switch to VNC Session'}
        >
          {mobileView === 'vnc' ? (
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          ) : (
            <Monitor className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
      
      <Snackbar
        open={Boolean(pageAlert)}
        autoHideDuration={6000}
        onClose={() => setPageAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setPageAlert(null)} severity={pageAlert?.severity} sx={{ width: '100%' }}>
          {pageAlert?.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BrowserSessionPage;