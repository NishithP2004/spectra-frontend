import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Mail } from 'lucide-react';

const ProfileCard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = currentUser.displayName || 'Unknown User';
  const email = currentUser.email || 'No email';
  const photoURL = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=ffffff`;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-6 max-w-sm mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={photoURL}
          alt={displayName}
          className="w-24 h-24 rounded-full mb-4 border-4 border-indigo-300 dark:border-indigo-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
          {displayName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {email}
        </p>
      </div>

      {/* Profile Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-4 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
          <UserIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            ID: {currentUser.uid.slice(0, 12)}...
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
          <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {email}
          </span>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <LogOut className="h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default ProfileCard; 