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
import { useToast } from '../contexts/ToastContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<{ title: string; mode: string; enableRecording: boolean; isPublic: boolean } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isClearingNamespace, setIsClearingNamespace] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (location.state?.message && location.state?.severity) {
      addToast(location.state.message, location.state.severity === 'success' ? 'success' : 'error');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, addToast]);

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

  const handleCreateSession = useCallback(async (title: string, mode: string, enableRecording: boolean, isPublic: boolean) => {
    if (!currentUser) {
      alert("Please log in to create a session.");
      return;
    }

    setIsModalOpen(false);
    setSessionConfig({ title, mode, enableRecording, isPublic });
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
          privacy: sessionConfig.isPublic ? 'public' : 'private',
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
      addToast("Failed to create session record. Please try again.", 'error');
    } finally {
      setIsStartingSession(false);
      setSessionConfig(null);
    }
  }, [currentUser, sessionConfig, navigate]);

  const handleSessionError = useCallback((error: string) => {
    addToast(error, 'error');
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
      addToast('You must be logged in to perform this action.', 'warning');
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
          addToast(data.message || 'Namespace cleared successfully.', 'success');
        } else {
          throw new Error(data.error || 'Failed to clear namespace.');
        }
      } catch (error) {
        console.error("Error clearing namespace:", error);
        addToast(error instanceof Error ? error.message : 'An unknown error occurred.', 'error');
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
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isStartingSession && sessionConfig && (
          <SessionManager
            enableRecording={sessionConfig.enableRecording}
            onSessionReady={handleSessionReady}
            onError={handleSessionError}
          />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600">Browser Sessions</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and launch your isolated environments</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 block w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isStartingSession}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-purple-900/20 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-500 dark:hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-1.5" />
              Create Session
            </button>

            <button
              onClick={handleClearNamespace}
              disabled={isClearingNamespace || isStartingSession}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-200 dark:border-white/10 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="h-5 w-5 mr-1.5" />
              {isClearingNamespace ? 'Clearing...' : 'Clear Namespace'}
            </button>
          </div>
        </div>

        {loading && sessions.length === 0 && <LoadingSpinner fullPage />}

        {!loading && filteredSessions.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term.' : 'Get started by creating your first secure browser session.'}
            </p>
          </div>
        )}

        {privateSessions.length > 0 && (
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6 pb-2 text-gray-900 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              My Private Sessions
            </h2>
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
          <div className="animate-fadeIn animation-delay-200">
            <h2 className="text-xl font-semibold mb-6 pb-2 text-gray-900 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span>
              Public Sessions
            </h2>
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
    </div>
  );
};

export default HomePage;