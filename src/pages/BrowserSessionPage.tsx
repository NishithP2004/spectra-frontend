import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VncDisplay from '../components/session/VncDisplay';
import ChatInterface from '../components/chat/ChatInterface';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Session } from '../components/session/SessionCard';
import { LogEntry } from '../components/chat/ActivityLogItem';
import { ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const BrowserSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [chatOpen, setChatOpen] = useState(true); // For mobile view
  
  const isHackingMode = session?.mode === "Hacking Mode";

  // Fetch session details
  useEffect(() => {
    if (!sessionId) return;
    
    setLoading(true);
    
    // Mock API call to get session details
    setTimeout(() => {
      // Find session in mock data
      // In a real app, this would be a database query
      const mockSession: Session = {
        id: sessionId,
        title: isHackingMode ? 'Hacking Environment' : 'Secure Browsing Session',
        mode: isHackingMode ? 'Hacking Mode' : 'Normal Mode',
        ownerId: '123456',
        ownerName: 'Demo User',
        ownerPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
        isPublic: true,
        duration: '00:00',
        thumbnailUrl: `https://picsum.photos/seed/${sessionId}/320/180`,
        createdAt: new Date(),
        vncUrl: 'ws://localhost:7900'
      };
      
      setSession(mockSession);
      
      // Add initial system message
      setActivityLog([{ 
        source: 'system', 
        message: `Session "${mockSession.title}" started in ${mockSession.mode}.`,
        timestamp: new Date() 
      }]);
      
      setLoading(false);
    }, 1000);
  }, [sessionId, isHackingMode]);

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
  const handleUserMessage = useCallback((message: { type: string, content: string }) => {
    if (!currentUser) return;

    // Add user message to log
    const userLog: LogEntry = {
      source: 'user',
      message: message.content,
      timestamp: new Date(),
    };
    setActivityLog(prev => [...prev, userLog]);

    // Mock AI response with delay
    setTimeout(() => {
      let aiResponse = "I've received your message: " + message.content;
      let aiReasoning: string | undefined = undefined;
      let isCode = false;

      // Simulate different responses based on input
      if (message.content.toLowerCase().includes("scan")) {
        aiResponse = "I'll run a scan for you...";
        aiReasoning = "Initiating port scan.";
        
        // Add a delayed tool response for the scan
        setTimeout(() => {
          setActivityLog(prev => [...prev, {
            source: 'tool',
            message: `Scan results for target:\nHost: 192.168.1.101\nStatus: Up\nPorts: 80 (open), 443 (open), 22 (filtered)`,
            isCode: true,
            timestamp: new Date()
          }]);
        }, 2000);
      } 
      else if (message.content.toLowerCase().includes("hello")) {
        aiResponse = "Hello! How can I assist you today?";
      }
      else if (message.content.toLowerCase().includes("help")) {
        aiResponse = "I can help you with browsing tasks, running security scans, and providing information. What would you like to do?";
      }
      
      const logEntry: LogEntry = {
        source: 'ai',
        message: aiResponse,
        isCode: isCode,
        timestamp: new Date(),
      };

      if (aiReasoning !== undefined) {
        logEntry.reasoning = aiReasoning;
      }

      setActivityLog(prev => [...prev, logEntry]);
    }, 1000);
  }, [currentUser]);

  // Handle ending session
  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      navigate('/');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  
  if (error || !session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 dark:bg-slate-900">
        <div className="text-center p-8 max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error || "Session not found"}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] ${isHackingMode ? 'hacker-theme-bg text-green-400' : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100'}`}>
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