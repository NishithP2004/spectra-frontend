import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Mail, Copy, Check } from 'lucide-react';

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

  const [copied, setCopied] = useState<null | 'id' | 'email'>(null);

  const handleCopy = async (text: string, type: 'id' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 1800);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-sm mx-auto relative z-40 max-h-[80vh] overflow-y-auto">
      {/* Decorative header */}
      <div className="h-20 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

      {/* Profile Header */}
      <div className="px-6 -mt-12 flex flex-col items-center">
        <img
          src={photoURL}
          alt={displayName}
          className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-xl object-cover"
        />
        <h2 className="mt-3 text-xl font-semibold text-slate-800 dark:text-white text-center">
          {displayName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {email}
        </p>
      </div>

      {/* Profile Details */}
      <div className="px-6 pt-5 pb-4 space-y-3">
        <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <div className="flex items-start space-x-3 min-w-0">
            <UserIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-300 break-all">
              <div className="uppercase tracking-wide text-[10px] text-slate-400 dark:text-slate-500">User ID</div>
              <div className="font-mono text-[12px] leading-5">{currentUser.uid}</div>
            </div>
          </div>
          <button
            onClick={() => handleCopy(currentUser.uid, 'id')}
            className="p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shrink-0"
            title="Copy User ID"
          >
            {copied === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <div className="flex items-start space-x-3 min-w-0">
            <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-300 break-all">
              <div className="uppercase tracking-wide text-[10px] text-slate-400 dark:text-slate-500">Email</div>
              <div className="text-[12px] leading-5">{email}</div>
            </div>
          </div>
          <button
            onClick={() => handleCopy(email, 'email')}
            className="p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shrink-0"
            title="Copy Email"
          >
            {copied === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 shadow hover:shadow-md"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard; 