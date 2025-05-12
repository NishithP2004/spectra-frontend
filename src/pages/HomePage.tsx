import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import SessionCard, { Session } from '../components/session/SessionCard';
import ModeSelectionModal from '../components/session/ModeSelectionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('isPublic', '==', true),
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

  const handleCreateSession = async (title: string, mode: string, enableRecording: boolean) => {
    if (!currentUser) {
      alert("Please log in to create a session.");
      return;
    }
    
    setIsModalOpen(false);
    setLoading(true);

    try {
      const newSession = {
        title,
        mode,
        enableRecording,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        ownerPhotoURL: currentUser.photoURL,
        isPublic: true,
        createdAt: serverTimestamp(),
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/320/180`
      };

      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      navigate(`/session/${docRef.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivacy = async (sessionId: string, isPublic: boolean) => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), { isPublic });
    } catch (error) {
      console.error("Error updating session privacy:", error);
      alert("Failed to update privacy settings.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteDoc(doc(db, 'sessions', sessionId));
      } catch (error) {
        console.error("Error deleting session:", error);
        alert("Failed to delete session.");
      }
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publicSessions = filteredSessions.filter(session => session.isPublic);
  const privateSessions = filteredSessions.filter(session => !session.isPublic && session.ownerId === currentUser?.uid);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Session
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
                isOwner={session.ownerId === currentUser?.uid}
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
                isOwner={session.ownerId === currentUser?.uid}
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