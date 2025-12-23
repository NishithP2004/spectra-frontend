import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import ProfileCard from '../common/ProfileCard';

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  let timeoutId: NodeJS.Timeout;
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay before closing
  };

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2.5 text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FontAwesomeIcon icon={faDesktop} className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                Spectra <span className="text-2xl">✨</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0">
              {theme === 'light' ? <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
            </button>
            {currentUser ? (
              <div ref={dropdownRef} className="relative shrink-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ zIndex: 1000 }}>
                <button
                  onClick={handleDropdownClick}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-white/5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-200 dark:border-white/10"
                >
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-slate-600"
                    />
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{currentUser.displayName || currentUser.email}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-2 z-40 min-w-[320px] max-h-[85vh] overflow-y-auto transform -translate-y-0" style={{ top: '100%', right: '0', maxHeight: 'calc(100vh - 120px)' }}>
                    <div className="px-4 py-2">
                      <ProfileCard />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;