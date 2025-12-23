import React from 'react';
import { Bot, User, Info, Network, AlertTriangle, Terminal, MessageSquare, Sparkles } from 'lucide-react';
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
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'network':
        return <Network className="w-5 h-5 text-red-500" />;
      case 'tool':
        return <Bot className="w-5 h-5 text-orange-500" />;
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
      return typeof timestamp === 'string' ? timestamp : 'Invalid time';
    }
  };



  const getDisplayName = () => {
    return log.source.charAt(0).toUpperCase() + log.source.slice(1);
  };

  const textColor = isHackingMode ? "text-green-300" : "text-gray-700 dark:text-gray-200";
  const headerTextColor = isHackingMode ? "text-green-400" : "text-gray-900 dark:text-gray-100";
  const timestampTextColor = isHackingMode ? "text-green-500/70" : "text-gray-400 dark:text-gray-500";
  const reasoningTextColor = isHackingMode ? "text-green-400/80" : "text-gray-500 dark:text-gray-400";
  const reasoningBgColor = isHackingMode ? "bg-black/30" : "bg-gray-100/50 dark:bg-slate-700/50";

  const isUser = log.source === 'user';


  // Chat Bubble Layout
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        relative max-w-[85%] rounded-2xl p-4 shadow-sm
        ${isUser
          ? (isHackingMode ? "bg-green-900/40 border border-green-500/30 rounded-tr-sm" : "bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-tr-sm shadow-blue-500/10")
          : (isHackingMode ? "bg-gray-900 border border-gray-800 rounded-tl-sm" : "bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-tl-sm")
        }
      `}>
        {/* Header - Only show for non-user messages or if specifically needed */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100/10 dark:border-white/5">
            <div className={`p-1 rounded-lg ${isHackingMode ? "bg-green-900/20" : "bg-gray-100 dark:bg-white/10"}`}>
              {getIcon()}
            </div>
            <span className={`text-xs font-semibold ${headerTextColor}`}>{getDisplayName()}</span>
            <span className={`text-[10px] ml-auto ${timestampTextColor}`}>{formatTimestamp(log.timestamp)}</span>
          </div>
        )}

        {/* Content */}
        <div>
          {log.isCode ? (
            <pre className={`p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono my-1 ${isHackingMode
              ? "bg-black/50 text-green-300 border border-green-900/30"
              : "bg-gray-800 text-gray-200 dark:bg-black/50"
              }`}>
              <code>
                <ReactMarkdown>{log.message}</ReactMarkdown>
              </code>
            </pre>
          ) : (
            <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${isUser
              ? "text-white prose-headings:text-white prose-strong:text-white prose-p:text-white"
              : `${textColor} dark:prose-invert`
              }`}>
              <ReactMarkdown>{log.message}</ReactMarkdown>
            </div>
          )}

          {/* Timestamp for user messages (bottom right) */}
          {isUser && (
            <div className={`text-[10px] mt-1 text-right opacity-70 ${isHackingMode ? "text-green-400" : "text-white"}`}>
              {formatTimestamp(log.timestamp)}
            </div>
          )}

          {log.reasoning && (
            <details className="mt-2 group">
              <summary className={`text-xs font-medium cursor-pointer flex items-center gap-1 select-none opacity-80 hover:opacity-100 ${isUser ? "text-white" : reasoningTextColor}`}>
                <Info className="w-3 h-3" />
                <span>One moment while I think...</span>
              </summary>
              <div className={`mt-2 p-2 rounded text-xs ${reasoningBgColor} ${reasoningTextColor} border border-transparent`}>
                {log.reasoning}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;
