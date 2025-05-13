import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Monitor } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/', { state: { message: 'Successfully logged in!', severity: 'success' } });
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-blue-200 dark:from-indigo-800 dark:via-purple-900 dark:to-blue-800 px-2 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">Spectra</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Secure Browsing & Hacking Environment
          </p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;