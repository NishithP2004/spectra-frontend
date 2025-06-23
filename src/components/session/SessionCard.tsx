import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash, Lock, Unlock } from 'lucide-react';
import { Session } from '../../types/session';

export type { Session } from '../../types/session';

interface SessionCardProps {
  session: Session;
  onUpdatePrivacy: (id: string, isPublic: boolean) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onUpdatePrivacy, 
  onDelete, 
  isOwner 
}) => {
  const ownerName = session.owner.name || 'Unknown User';
  const ownerPhotoURL = session.owner.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(ownerName);
  const thumbnailUrl = session.recording?.thumbnail || `https://picsum.photos/seed/${session.id}/320/180`;
  const duration = session.recording?.duration ? formatDuration(session.recording.duration) : '00:00';
  const isPublic = session.options.privacy === 'public';
  const isRecordingEnabled = session.options.enableRecording;

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const thumbnailContent = (
    <>
      <img 
        src={thumbnailUrl} 
        alt={session.title} 
        className="w-full h-44 object-cover"
      />
      <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
        {duration}
      </span>
      {session.options.mode === "Hacking" && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-red-600/90 text-white text-xs rounded">
          Hacking Mode
        </span>
      )}
    </>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      {isRecordingEnabled ? (
        <Link to={`/watch/${session.id}`} className="block relative">
          {thumbnailContent}
        </Link>
      ) : (
        <div className="block relative">{thumbnailContent}</div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {isRecordingEnabled ? (
            <Link to={`/watch/${session.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-gray-900 dark:text-gray-100">
              {session.title}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100">{session.title}</span>
          )}
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <img src={ownerPhotoURL} alt={ownerName} className="h-6 w-6 rounded-full" />
          <span>{ownerName}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          {isOwner ? (
            <div className="flex space-x-2">
              <button 
                onClick={() => onUpdatePrivacy(session.id, !isPublic)}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
                title={isPublic ? "Make Private" : "Make Public"}
              >
                {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => window.alert('Edit not implemented')}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
                title="Edit Session"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onDelete(session.id)}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-700/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete Session"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-8"></div>
          )}
          
          {isRecordingEnabled && (
            <Link 
              to={`/watch/${session.id}`}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-700/30 text-emerald-700 dark:text-emerald-300 rounded-md text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-700/50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Watch</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;