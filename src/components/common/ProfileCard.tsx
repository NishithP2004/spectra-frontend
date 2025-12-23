import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Mail, Copy, Check } from 'lucide-react';

const ProfileCard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
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
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl max-w-sm mx-auto relative z-40 max-h-[80vh] overflow-y-auto">
      {/* Decorative header */}
      <div className="h-24 w-full rounded-t-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600" />

      {/* Profile Header */}
      <div className="px-6 -mt-14 flex flex-col items-center">
        <div className="relative">
          <img
            src={photoURL}
            alt={displayName}
            className="w-28 h-28 rounded-2xl ring-4 ring-white dark:ring-[#0a0a0a] shadow-xl object-cover bg-gray-50 dark:bg-white/5"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></div>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white text-center">
          {displayName}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
          {email}
        </p>
      </div>

      {/* Profile Details */}
      <div className="px-6 pt-6 pb-5 space-y-3">
        <div className="flex items-start justify-between bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 break-all flex-1 min-w-0">
              <div className="uppercase tracking-wide text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">User ID</div>
              <div className="font-mono text-xs leading-5 text-gray-900 dark:text-white/90">{currentUser.uid}</div>
            </div>
          </div>
          <button
            onClick={() => handleCopy(currentUser.uid, 'id')}
            className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 shrink-0 transition-all"
            title="Copy User ID"
          >
            {copied === 'id' ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-start justify-between bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 shrink-0">
              <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 break-all flex-1 min-w-0">
              <div className="uppercase tracking-wide text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</div>
              <div className="text-xs leading-5 text-gray-900 dark:text-white/90">{email}</div>
            </div>
          </div>
          <button
            onClick={() => handleCopy(email, 'email')}
            className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 shrink-0 transition-all"
            title="Copy Email"
          >
            {copied === 'email' ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-all duration-200 border border-red-100 dark:border-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-black"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard; 