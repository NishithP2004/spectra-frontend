import React from 'react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullPage = false }) => {
  const containerClasses = fullPage
    ? "fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 transition-all duration-500"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className={`relative flex items-center justify-center ${fullPage ? "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-12 rounded-2xl shadow-2xl transition-colors duration-300" : "w-64 h-64"}`}>
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Core: Orchestrator */}
          <div className="absolute w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-md animate-pulse z-10"></div>
          <div className="absolute w-12 h-12 bg-white dark:bg-black rounded-full z-20 flex items-center justify-center shadow-sm dark:shadow-none">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full opacity-80 animate-pulse-glow"></div>
          </div>

          {/* Orbit 1: Browser Agent (Cyan) */}
          <div className="absolute w-32 h-32 border border-blue-500/10 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }}>
            <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          </div>

          {/* Orbit 2: Tool Agent (Green) */}
          <div className="absolute w-44 h-44 border border-green-500/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }}>
            <div className="absolute top-1/2 -right-1.5 -mt-1.5 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
          </div>

          {/* Orbit 3: System Agent (Pink) */}
          <div className="absolute w-56 h-56 border border-purple-500/10 rounded-full animate-spin-slow" style={{ animationDuration: '7s' }}>
            <div className="absolute -bottom-1.5 left-1/2 -ml-1.5 w-3 h-3 bg-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(232,121,249,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;