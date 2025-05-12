import React from 'react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullPage = false }) => {
  const spinnerClasses = fullPage
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-50"
    : "flex items-center justify-center py-8";

  return (
    <div className={spinnerClasses}>
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;