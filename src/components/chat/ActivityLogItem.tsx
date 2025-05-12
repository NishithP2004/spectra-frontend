import React from 'react';
import { Bot, User, Info, Network, AlertTriangle } from 'lucide-react';

export interface LogEntry {
  id?: string;
  source: 'user' | 'ai' | 'system' | 'tool' | 'network';
  type?: 'info' | 'error' | 'warning';
  message: string;
  timestamp: Date | any; // Date or Timestamp
  userName?: string;
  userId?: string;
  isCode?: boolean;
  reasoning?: string;
}

interface ActivityLogItemProps {
  log: LogEntry;
  isHackingMode?: boolean;
}

const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ log, isHackingMode = false }) => {
  const getIcon = () => {
    switch (log.source) {
      case 'user': return <User className="h-5 w-5" />;
      case 'ai': return <Bot className="h-5 w-5" />;
      case 'system': return <Info className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      case 'tool': return <Bot className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    // Check if it's a timestamp object with toDate method (Firebase style)
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString();
    }
    // For Date objects or ISO strings
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSourceClass = () => {
    const baseClasses = "rounded-lg p-3 mb-3";
    
    if (isHackingMode) {
      // Hacking mode styling (dark with neon colors)
      switch (log.source) {
        case 'user': return `${baseClasses} bg-gray-900 border-l-4 border-blue-500 text-blue-400`;
        case 'ai': return `${baseClasses} bg-gray-900 border-l-4 border-green-500 text-green-400`;
        case 'system': return `${baseClasses} bg-gray-900 border-l-4 border-purple-500 text-purple-400`;
        case 'tool': return `${baseClasses} bg-gray-900 border-l-4 border-yellow-500 text-yellow-400`;
        case 'network': return `${baseClasses} bg-gray-900 border-l-4 border-red-500 text-red-400`;
        default: return `${baseClasses} bg-gray-900 border-l-4 border-gray-500 text-gray-400`;
      }
    } else {
      // Normal mode styling (light with subtle colors)
      switch (log.source) {
        case 'user': return `${baseClasses} bg-blue-50 dark:bg-blue-900/60 border-l-4 border-blue-300 dark:border-blue-600 text-gray-800 dark:text-blue-100`;
        case 'ai': return `${baseClasses} bg-green-50 dark:bg-green-900/60 border-l-4 border-green-300 dark:border-green-600 text-gray-800 dark:text-green-100`;
        case 'system': return `${baseClasses} bg-gray-100 dark:bg-slate-700/80 border-l-4 border-gray-300 dark:border-slate-500 text-gray-800 dark:text-slate-100`;
        case 'tool': return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-300 dark:border-yellow-600 text-gray-800 dark:text-yellow-100`;
        case 'network': return `${baseClasses} bg-orange-50 dark:bg-orange-900/50 border-l-4 border-orange-300 dark:border-orange-600 text-gray-800 dark:text-orange-100`;
        default: return `${baseClasses} bg-gray-100 dark:bg-slate-700/80 border-l-4 border-gray-300 dark:border-slate-500 text-gray-800 dark:text-slate-100`;
      }
    }
  };

  return (
    <div className={getSourceClass()}>
      <div className="flex items-center mb-1">
        <div className={`flex-shrink-0 mr-2 ${isHackingMode ? "text-green-400" : "dark:text-gray-300"}`}>
          {getIcon()}
        </div>
        <div className={`font-medium ${isHackingMode ? "" : "text-gray-800 dark:text-gray-100"}`}>
          {log.source.charAt(0).toUpperCase() + log.source.slice(1)}
          {log.type === 'error' && (
            <AlertTriangle className="h-4 w-4 inline ml-1 text-red-500 dark:text-red-400" />
          )}
        </div>
        <div className={`ml-auto text-xs ${isHackingMode ? "text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>
          {formatTimestamp(log.timestamp)}
        </div>
      </div>
      
      <div className="mt-1">
        {log.isCode ? (
          <pre className={`p-2 rounded text-sm overflow-x-auto ${
            isHackingMode ? "bg-gray-800 text-green-400" : "bg-gray-800 text-gray-200 dark:bg-slate-900 dark:text-slate-200"
          }`}>
            <code>{log.message}</code>
          </pre>
        ) : (
          <p className={isHackingMode ? "text-gray-300" : "text-gray-700 dark:text-gray-200"}>
            {log.message}
          </p>
        )}
        
        {log.reasoning && (
          <div className={`mt-1 text-xs italic ${
            isHackingMode ? "text-gray-500" : "text-gray-500 dark:text-gray-400"
          }`}>
            Reasoning: {log.reasoning}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogItem;