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
    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-purple-500/10 backdrop-blur-md">
      {isRecordingEnabled ? (
        <Link to={`/watch/${session.id}`} className="block relative group">
          {thumbnailContent}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </Link>
      ) : (
        <div className="block relative">{thumbnailContent}</div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {isRecordingEnabled ? (
            <Link to={`/watch/${session.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
              {session.title}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white">{session.title}</span>
          )}
        </h3>

        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <img src={ownerPhotoURL} alt={ownerName} className="h-6 w-6 rounded-full border border-gray-200 dark:border-white/10" />
          <span>{ownerName}</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/5">
          {isOwner ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onUpdatePrivacy(session.id, !isPublic)}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title={isPublic ? "Make Private" : "Make Public"}
              >
                {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
              <button
                onClick={() => window.alert('Edit not implemented')}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Edit Session"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(session.id)}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
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