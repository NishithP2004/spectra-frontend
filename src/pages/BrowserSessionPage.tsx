import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import VncDisplay from '../components/session/VncDisplay';
import ChatInterface from '../components/chat/ChatInterface';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Session } from '../types/session';
import { LogEntry } from '../components/chat/ActivityLogItem';
import { ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Interface for page-level alerts
interface PageAlert {
  text: string;
  severity: AlertColor;
}

const BrowserSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuth();
  const { sessionState, endSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [chatOpen, setChatOpen] = useState(true); // For mobile view
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null);
  
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
      const wsUrl = backendUrl.replace(/^http|https/, 'ws');
      return `${wsUrl}/vnc?uid=${currentUser.uid}`;
    }
    return '';
  }, [sessionState.isActive, currentUser]);

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
        <header className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
          <button onClick={() => navigate('/')} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Sessions
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{session?.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {sessionId}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={handleEndSession} 
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              End Session
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col bg-black">
            {sessionState.isActive && sessionState.vnc_passwd && (
              <VncDisplay
                url={vncUrl}
                vncPassword={sessionState.vnc_passwd}
              />
            )}
          </div>

          <div className={`
            w-full md:w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 
            transition-transform duration-300 ease-in-out 
            ${chatOpen ? 'translate-x-0' : 'translate-x-full'} 
            md:translate-x-0 md:relative absolute top-0 right-0 h-full z-20 md:z-auto
          `}>
            <ChatInterface
              activityLog={activityLog}
              onSendMessage={handleUserMessage}
              sessionId={sessionId!}
            />
          </div>
        </div>
      </main>
      
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