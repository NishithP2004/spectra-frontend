import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import SessionCard, { Session } from '../components/session/SessionCard';
import { CreateSessionData } from '../types/session';
import ModeSelectionModal from '../components/session/ModeSelectionModal';
import SessionManager from '../components/session/SessionManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Search, Trash2 } from 'lucide-react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface AlertMessage {
  text: string;
  severity: AlertColor;
}

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { sessionState } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<{ title: string; mode: string; enableRecording: boolean } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isClearingNamespace, setIsClearingNamespace] = useState(false);

  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  useEffect(() => {
    if (location.state?.message && location.state?.severity) {
      setAlertMessage({ text: location.state.message, severity: location.state.severity as AlertColor });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('options.privacy', '==', 'public'),
      where('options.enableRecording', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData: Session[] = [];
      snapshot.forEach((doc) => {
        sessionData.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(sessionData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateSession = useCallback(async (title: string, mode: string, enableRecording: boolean) => {
    if (!currentUser) {
      alert("Please log in to create a session.");
      return;
    }
    
    setIsModalOpen(false);
    setSessionConfig({ title, mode, enableRecording });
    setIsStartingSession(true);
  }, [currentUser]);

  const handleSessionReady = useCallback(async (sessionId: string) => {
    console.log('[HomePage] handleSessionReady called with sessionId:', sessionId);
    if (!currentUser || !sessionConfig) {
      console.log('[HomePage] Missing currentUser or sessionConfig, returning');
      return;
    }

    try {
      console.log('[HomePage] Creating Firestore session record...');
      // Create Firestore session record
      const newSessionData: CreateSessionData = {
        id: sessionId,
        title: sessionConfig.title,
        createdAt: serverTimestamp(),
        owner: {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email || 'Unknown User',
          photo: currentUser.photoURL || '',
        },
        options: {
          enableRecording: sessionConfig.enableRecording,
          mode: sessionConfig.mode === 'Hacking Mode' ? 'Hacking' : 'Normal',
          privacy: 'public',
        },
      };

      await setDoc(doc(db, 'sessions', sessionId), newSessionData);
      console.log('[HomePage] Firestore session record created successfully');
      
      // Redirect to the session page with success message
      console.log('[HomePage] Navigating to session page...');
      navigate(`/session/${sessionId}`, { 
        state: { 
          message: `Session "${sessionConfig.title}" started successfully!`, 
          severity: 'success',
          modePreference: sessionConfig.mode,
          enableRecording: sessionConfig.enableRecording
        } 
      });
      console.log('[HomePage] Navigation completed');
    } catch (error) {
      console.error("[HomePage] Error creating session record:", error);
      setAlertMessage({ text: "Failed to create session record. Please try again.", severity: 'error' });
    } finally {
      setIsStartingSession(false);
      setSessionConfig(null);
    }
  }, [currentUser, sessionConfig, navigate]);

  const handleSessionError = useCallback((error: string) => {
    setAlertMessage({ text: error, severity: 'error' });
    setIsStartingSession(false);
    setSessionConfig(null);
  }, []);

  const handleUpdatePrivacy = useCallback(async (sessionId: string, isPublic: boolean) => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), { 
        'options.privacy': isPublic ? 'public' : 'private' 
      });
    } catch (error) {
      console.error("Error updating session privacy:", error);
      alert("Failed to update privacy settings.");
    }
  }, []);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteDoc(doc(db, 'sessions', sessionId));
      } catch (error) {
        console.error("Error deleting session:", error);
        alert("Failed to delete session.");
      }
    }
  }, []);

  const handleClearNamespace = useCallback(async () => {
    if (!currentUser) {
      setAlertMessage({ text: 'You must be logged in to perform this action.', severity: 'warning' });
      return;
    }

    if (window.confirm("Are you sure you want to delete your namespace? This action is irreversible and will delete all your running sessions and associated data.")) {
      setIsClearingNamespace(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:80';
        const response = await fetch(`${BACKEND_URL}/namespace`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setAlertMessage({ text: data.message || 'Namespace cleared successfully.', severity: 'success' });
        } else {
          throw new Error(data.error || 'Failed to clear namespace.');
        }
      } catch (error) {
        console.error("Error clearing namespace:", error);
        setAlertMessage({ text: error instanceof Error ? error.message : 'An unknown error occurred.', severity: 'error' });
      } finally {
        setIsClearingNamespace(false);
      }
    }
  }, [currentUser]);

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publicSessions = filteredSessions.filter(session => session.options.privacy === 'public');
  const privateSessions = filteredSessions.filter(session => session.options.privacy === 'private' && session.owner.uid === currentUser?.uid);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {isStartingSession && sessionConfig && (
        <SessionManager
          enableRecording={sessionConfig.enableRecording}
          onSessionReady={handleSessionReady}
          onError={handleSessionError}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Browser Sessions</h1>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-opacity-50"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isStartingSession}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Session
          </button>

          <button
            onClick={handleClearNamespace}
            disabled={isClearingNamespace || isStartingSession}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5 mr-1" />
            {isClearingNamespace ? 'Clearing...' : 'Clear Namespace'}
          </button>
        </div>
      </div>
      
      {loading && sessions.length === 0 && <LoadingSpinner fullPage />}
      
      {!loading && filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sessions found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Create your first browser session to get started!'}
          </p>
        </div>
      )}
      
      {privateSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b dark:border-slate-700 pb-2 text-gray-900 dark:text-gray-100">My Private Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {privateSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onUpdatePrivacy={handleUpdatePrivacy}
                onDelete={handleDeleteSession}
                isOwner={session.owner.uid === currentUser?.uid}
              />
            ))}
          </div>
        </div>
      )}
      
      {publicSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b dark:border-slate-700 pb-2 text-gray-900 dark:text-gray-100">Public Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onUpdatePrivacy={handleUpdatePrivacy}
                onDelete={handleDeleteSession}
                isOwner={session.owner.uid === currentUser?.uid}
              />
            ))}
          </div>
        </div>
      )}
      
      <ModeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </div>
  );
};

export default HomePage;