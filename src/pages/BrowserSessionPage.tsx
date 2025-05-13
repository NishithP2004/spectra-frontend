import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VncDisplay from '../components/session/VncDisplay';
import ChatInterface from '../components/chat/ChatInterface';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Session } from '../components/session/SessionCard';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [chatOpen, setChatOpen] = useState(true); // For mobile view
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null); // For general page alerts
  
  const isHackingMode = session?.mode === "Hacking Mode";

  // Ref to track initialization state to prevent double calls in StrictMode
  const initializationStateRef = useRef<{ status: 'idle' | 'pending' | 'done'; key: string | null }>({ status: 'idle', key: null });

  useEffect(() => {
    // Check for messages passed via route state (e.g., session creation success)
    if (location.state?.message && location.state?.severity) {
      setPageAlert({ text: location.state.message, severity: location.state.severity as AlertColor });
      navigate(location.pathname, { replace: true, state: {} });
      // Snackbar's autoHideDuration will handle hiding.
    }
  }, [location, navigate]);

  // Fetch session details and initialize agent session
  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is missing or invalid.");
      setSession(null);
      setLoading(false);
      initializationStateRef.current = { status: 'idle', key: null };
      return;
    }
    if (!currentUser) {
      setError("User not authenticated. Cannot initialize session.");
      setSession(null);
      setLoading(false);
      initializationStateRef.current = { status: 'idle', key: null };
      return;
    }

    const currentKey = `${sessionId}-${currentUser.uid}`;

    // Prevent re-initialization if already done or pending for the same key
    if (
      initializationStateRef.current.key === currentKey &&
      (initializationStateRef.current.status === 'done' || initializationStateRef.current.status === 'pending')
    ) {
      // console.log(`Skipping initialization for key ${currentKey}, status: ${initializationStateRef.current.status}`);
      // If it was 'done' and loading is true, it might mean deps changed then changed back.
      // Ensure loading is false if we skip and status is 'done'.
      if (initializationStateRef.current.status === 'done' && loading) {
        setLoading(false);
      }
      return;
    }
    
    initializationStateRef.current = { status: 'pending', key: currentKey };
    setLoading(true);
    setError(null);
    setSession(null); // Clear previous session data

    const initializeFullSession = async () => {
      try {
        // Step 1: Create or confirm agent session
        const agentSessionUrl = `http://localhost:8000/apps/spectra-agent/users/${currentUser.uid}/sessions/${sessionId}`;
        const response = await fetch(agentSessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state: {} }), // Optional state
        });

        if (!response.ok) {
          let errorDetail = `Failed to create agent session: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
            // Check for "Session already exists" as per documentation
            if (response.status === 400 && errorDetail.includes("Session already exists")) {
              console.log("Agent session already exists (confirmed by server):", sessionId);
              // This is not a fatal error; proceed.
            } else {
              throw new Error(errorDetail); // Throw detailed error from server
            }
          } catch (parseError) {
            // If response.json() fails or it's not the specific "already exists" case
            console.error("Error parsing agent session error response or unexpected error:", parseError);
            throw new Error(errorDetail); // Throw the status-based error detail
          }
        } else {
          console.log("Agent session successfully created/confirmed for:", sessionId);
          // const agentData = await response.json(); // Process if needed
        }

        // Step 2: Determine intended mode and set (Spectra) session details
        const intendedModeFromState = location.state?.modePreference === "Hacking Mode" ? "Hacking Mode" : "Normal Mode";
        const isActuallyHackingMode = intendedModeFromState === "Hacking Mode";

        const mockSessionData: Session = {
          id: sessionId,
          title: isActuallyHackingMode ? 'Hacking Environment' : 'Secure Browsing Session',
          mode: intendedModeFromState, // Use the determined mode
          ownerId: currentUser.uid,
          ownerName: currentUser.displayName || 'User',
          ownerPhotoURL: currentUser.photoURL || undefined,
          isPublic: true,
          duration: '00:00',
          thumbnailUrl: `https://picsum.photos/seed/${sessionId}/320/180`,
          createdAt: new Date(),
          vncUrl: 'ws://localhost:7900',
        };
        setSession(mockSessionData);
        setActivityLog([{ 
          source: 'system', 
          message: `Session "${mockSessionData.title}" started in ${mockSessionData.mode}. Agent ready.`,
          timestamp: new Date() 
        }]);

        // Display an alert for the session start mode
        setPageAlert({ text: `Starting session in ${mockSessionData.mode}`, severity: 'info' });
        
        initializationStateRef.current = { status: 'done', key: currentKey };
        setLoading(false);

      } catch (initError) {
        const errorMessage = initError instanceof Error ? initError.message : String(initError);
        console.error("Error during full session initialization:", errorMessage);
        setError(`Failed to initialize session: ${errorMessage}`);
        initializationStateRef.current = { status: 'idle', key: currentKey }; // Reset to idle for this key on error
        setLoading(false);
        setSession(null);
      }
    };

    initializeFullSession();

  }, [sessionId, currentUser, location.state]); // Dependencies

  // Apply hack mode theme to body
  useEffect(() => {
    if (isHackingMode) {
      document.body.classList.add('hacker-theme');
    } else {
      document.body.classList.remove('hacker-theme');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hacker-theme');
    };
  }, [isHackingMode]);

  // Handle user messages from chat
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
      const response = await fetch('http://localhost:8000/run_sse', { // Changed to /run_sse
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_name: 'spectra-agent', // Consistent with previous agent name
          user_id: currentUser.uid,
          session_id: sessionId,
          new_message: {
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

  // Handle ending session
  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      navigate('/');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  
  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-slate-900">
        <Alert severity="error" className="w-full max-w-lg mb-4">
          {error}
        </Alert>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-slate-900">
        <Alert severity="warning" className="w-full max-w-lg mb-4">
          Session data could not be loaded. Please try again later.
        </Alert>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-[calc(100vh-64px)] ${isHackingMode ? 'hacker-theme-bg text-green-400' : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100'}`}>
      {/* Page-level Alert Snackbar Display Area */}
      {pageAlert && (
        <Snackbar
          open={Boolean(pageAlert)}
          autoHideDuration={5000}
          onClose={() => setPageAlert(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Or other preferred position
          // Adding a key ensures the Snackbar remounts and shows animation if message changes rapidly
          key={pageAlert.text} 
        >
          <Alert onClose={() => setPageAlert(null)} severity={pageAlert.severity} sx={{ width: '100%' }}>
            {pageAlert.text}
          </Alert>
        </Snackbar>
      )}

      {/* Top bar for session title and End Session button (replaces the old inline header) */}
      <div className={`p-3 flex items-center justify-between border-b ${isHackingMode ? 'border-green-700 bg-gray-900' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'} shadow-sm`}>
        <h1 className={`text-lg font-semibold ${isHackingMode ? 'text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
          {session.title}
        </h1>
        <button
          onClick={handleEndSession}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isHackingMode 
              ? 'bg-red-900/80 text-red-300 hover:bg-red-800/80' 
              : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
          }`}
        >
          End Session
        </button>
      </div>
      
      {/* Main content area with VNC display and chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* VNC Panel */}
        <div className={`flex-1 p-1 ${chatOpen && !isHackingMode ? 'hidden lg:block' : 'block'} ${isHackingMode ? 'border-r border-green-700' : 'border-r dark:border-slate-700'}`}>
          <VncDisplay 
            url={session.vncUrl || 'ws://localhost:7900'} 
            isHackingMode={isHackingMode} 
            vncPassword="secret"
          />
        </div>
        
        {/* Chat Panel - Conditional rendering for mobile */}
        <div className={`lg:w-1/3 xl:w-1/4 h-full ${chatOpen ? 'block' : 'hidden lg:block'} ${isHackingMode ? 'bg-gray-900 border-l border-green-700' : 'bg-gray-100 dark:bg-slate-800 border-l dark:border-slate-700'}`}>
          <ChatInterface 
            onSendMessage={handleUserMessage} 
            activityLog={activityLog}
            isHackingMode={isHackingMode}
            currentUser={currentUser}
            sessionId={sessionId!}
          />
        </div>
      </div>
        
      {/* Mobile toggle button for chat - Stays at bottom right */}
      {!isHackingMode && (
         <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`fixed bottom-4 right-4 lg:hidden z-20 p-3 rounded-full shadow-lg transition-colors ${
                isHackingMode 
                ? 'bg-green-700/80 text-green-300 hover:bg-green-600/80' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400'
            }`}
        >
            {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" /> }
        </button>
      )}
    </div>
  );
};

export default BrowserSessionPage;