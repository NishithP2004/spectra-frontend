import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Session } from '../components/session/SessionCard';
import { ThumbsUp, MessageSquare, Share2, ChevronLeft } from 'lucide-react';
import { DiscussionEmbed } from 'disqus-react';

interface Comment {
  id: string;
  userName: string;
  userPhotoUrl: string;
  text: string;
  timestamp: Date;
}

const WatchSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

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
        title: 'Web Application Security Testing',
        createdAt: new Date('2023-06-15T10:30:00'),
        owner: {
          uid: '123456',
          name: 'Demo User',
          photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
        options: {
          enableRecording: true,
          mode: 'Hacking',
          privacy: 'public',
        },
        recording: {
          duration: 2722, // 45:22 in seconds
          url: 'https://storage.googleapis.com/spectra-bucket/recordings/example.mp4',
          thumbnail: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
          summary: 'In this session, the user performed security testing on a web application. They began by scanning for open ports and discovered several potential vulnerabilities. The key findings included an unsecured admin interface, outdated plugins with known CVEs, and weak password policies. The session demonstrates standard penetration testing methodologies and responsible disclosure practices.',
        },
      };
      
      setSession(mockSession);
      
      // Set AI Summary from recording
      if (mockSession.recording) {
        setAiSummary(mockSession.recording.summary);
      }
      
      setLoading(false);
    }, 1000);
  }, [sessionId]);

  if (loading) return <LoadingSpinner fullPage />;
  
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error || "Session not found"}</p>
          <Link
            to="/"
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const disqusConfig = {
    url: window.location.href,
    identifier: sessionId,
    title: session?.title || 'Session',
    language: 'en_US',
  };

  const duration = session.recording ? formatDuration(session.recording.duration) : 'N/A';
  const thumbnailUrl = session.recording?.thumbnail || `https://picsum.photos/seed/${session.id}/320/180`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 dark:text-gray-100">
      <Link
        to="/"
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Session List
      </Link>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {/* Video player area */}
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          {/* This would be a real video player in production */}
          <div className="text-center p-8 max-w-xl">
            <img 
              src={thumbnailUrl} 
              alt={session.title}
              className="max-h-80 mx-auto rounded-md shadow-lg"
            />
            <p className="text-white mt-4">
              Session recording playback would appear here. Duration: {duration}
            </p>
          </div>
        </div>
        
        {/* Session information */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{session.title}</h1>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
            <span>{formatDate(session.createdAt)}</span>
            <span className="mx-2">•</span>
            <span>Duration: {duration}</span>
            <span className="mx-2">•</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.options.mode === 'Hacking' 
                ? 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300'
            }`}>
              {session.options.mode} Mode
            </span>
          </div>
          
          <div className="flex items-center mb-6">
            <img 
              src={session.owner.photo} 
              alt={session.owner.name} 
              className="w-10 h-10 rounded-full mr-3" 
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{session.owner.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Session Creator</p>
            </div>
          </div>
          
          {/* AI-generated summary */}
          {aiSummary && (
            <div className="mb-8 bg-indigo-50 dark:bg-slate-700/50 rounded-lg p-4 border border-indigo-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <Robot className="h-5 w-5 mr-1 text-indigo-600 dark:text-indigo-400" />
                AI-Generated Summary
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{aiSummary}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <DiscussionEmbed shortname='spectra-ai' config={disqusConfig} />
      </div>
    </div>
  );
};

// Mock component for the Robot icon used in AI summary
const Robot = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export default WatchSessionPage;