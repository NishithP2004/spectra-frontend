import React from 'react';
import { Bot, User, Info, Network, AlertTriangle, Terminal, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

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
    if (isHackingMode) {
      return <Terminal className="w-5 h-5 text-green-400" />;
    }
    switch (log.source) {
      case 'user':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'ai':
        return <Bot className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'network':
        return <Network className="w-5 h-5 text-red-500" />;
      case 'tool':
        return <Bot className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'HH:mm:ss');
    } catch (error) {
      // console.error("Error formatting timestamp:", error);
      // Fallback for invalid date/timestamp values
      return typeof timestamp === 'string' ? timestamp : 'Invalid time';
    }
  };

  const getSourceClass = () => {
    const baseClasses = "rounded-lg p-3 mb-3";
    
    if (isHackingMode) {
      switch (log.source) {
        case 'user': return `${baseClasses} bg-gray-900 border-l-4 border-blue-500 text-blue-400`;
        case 'ai': return `${baseClasses} bg-gray-900 border-l-4 border-green-500 text-green-400`;
        case 'system': return `${baseClasses} bg-gray-900 border-l-4 border-purple-500 text-purple-400`;
        case 'tool': return `${baseClasses} bg-gray-900 border-l-4 border-yellow-500 text-yellow-400`;
        case 'network': return `${baseClasses} bg-gray-900 border-l-4 border-red-500 text-red-400`;
        default: return `${baseClasses} bg-gray-900 border-l-4 border-gray-500 text-gray-400`;
      }
    } else {
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

  const textColor = isHackingMode ? "text-green-300" : "text-gray-700 dark:text-gray-200";
  const headerTextColor = isHackingMode ? "text-green-400" : "text-gray-800 dark:text-gray-100";
  const timestampTextColor = isHackingMode ? "text-green-500" : "text-gray-500 dark:text-gray-400";
  const reasoningTextColor = isHackingMode ? "text-green-400" : "text-gray-400 dark:text-gray-500";
  const reasoningBgColor = isHackingMode ? "bg-black/50" : "bg-gray-100 dark:bg-slate-600";

  return (
    <div className={getSourceClass()}>
      <div className="flex items-center mb-1">
        <div className={`flex-shrink-0 mr-2 ${isHackingMode ? "text-green-400" : ""}`}>
          {getIcon()}
        </div>
        <div className={`font-medium ${headerTextColor}`}>
          {log.source.charAt(0).toUpperCase() + log.source.slice(1)}
          {log.type === 'error' && (
            <AlertTriangle className="h-4 w-4 inline ml-1 text-red-500 dark:text-red-400" />
          )}
        </div>
        <div className={`ml-auto text-xs ${timestampTextColor}`}>
          {formatTimestamp(log.timestamp)}
        </div>
      </div>
      
      <div className="mt-1 pl-7">
        {log.isCode ? (
          <pre className={`p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap break-all ${isHackingMode ? "bg-gray-800 text-green-300" : "bg-gray-800 text-gray-200 dark:bg-slate-900 dark:text-slate-200"}`}>
            <code>
              <ReactMarkdown>{log.message}</ReactMarkdown>
            </code>
          </pre>
        ) : (
          <div className={`text-sm ${textColor} prose dark:prose-invert max-w-none overflow-x-auto`}>
            <ReactMarkdown>{log.message}</ReactMarkdown>
          </div>
        )}
        
        {log.reasoning && (
          <details className="mt-2 text-xs">
            <summary className={`${reasoningTextColor} cursor-pointer hover:underline`}>Show reasoning</summary>
            <p className={`mt-1 p-2 rounded ${reasoningBgColor} ${reasoningTextColor}`}>
              {log.reasoning}
            </p>
          </details>
        )}
      </div>
    </div>
  );
};

export default ActivityLogItem;