import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-800/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Monitor className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for. The session may have been deleted or moved.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;