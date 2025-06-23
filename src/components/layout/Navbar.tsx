import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Monitor, LogOut } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import ProfileCard from '../common/ProfileCard';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  let timeoutId: NodeJS.Timeout;
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

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

  return (
    <nav className="bg-white/30 backdrop-blur-md text-black shadow-md fixed top-0 left-0 right-0 z-10 dark:bg-slate-800/30 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <FontAwesomeIcon icon={faDesktop} className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span>Spectra</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </button>
            {currentUser ? (
              <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button 
                  onClick={handleDropdownClick}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.displayName || currentUser.email}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-2 z-20 min-w-[320px]">
                    <div className="px-4 py-2">
                      <ProfileCard />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
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