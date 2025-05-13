import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Send, Mic, Loader, AlertTriangle } from 'lucide-react';
import ActivityLogItem, { LogEntry } from './ActivityLogItem';
import { User } from 'firebase/auth';

interface ChatInterfaceProps {
  onSendMessage: (message: { type: string, content: string }) => void;
  activityLog: LogEntry[];
  isHackingMode?: boolean;
  currentUser?: User | null;
  sessionId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  activityLog = [], 
  isHackingMode = false,
  currentUser,
  sessionId
}) => {
  const [inputText, setInputText] = useState('');
  const logDisplayRef = useRef<HTMLDivElement>(null);

  const { 
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable 
  } = useSpeechRecognition();

  // State to manage microphone errors
  const [micError, setMicError] = useState<string | null>(null);

  // Previous listening state to detect when listening stops
  const prevListening = useRef(listening);

  useEffect(() => {
    if (logDisplayRef.current) {
      logDisplayRef.current.scrollTop = logDisplayRef.current.scrollHeight;
    }
  }, [activityLog]);

  const handleSendText = () => {
    if (inputText.trim()) {
      onSendMessage({ type: 'text', content: inputText.trim() });
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const toggleListening = () => {
    setMicError(null); // Clear previous errors
    if (!browserSupportsSpeechRecognition) {
      setMicError("Speech recognition is not supported by your browser.");
      return;
    }
    if (!isMicrophoneAvailable) {
      setMicError("Microphone is not available. Please check permissions.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      // The useEffect below will handle populating inputText with the transcript
    } else {
      setInputText(''); // Clear input text before starting new dictation
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // Effect to update inputText when listening stops and transcript is available
  useEffect(() => {
    if (prevListening.current && !listening && transcript) {
      // Listening has just stopped
      setInputText(transcript); // Populate input text with the final transcript
      resetTranscript(); // Clear transcript so it doesn't interfere with next dictation
    }
    // Update previous listening state for the next render
    prevListening.current = listening;
  }, [listening, transcript, resetTranscript]);

  // Filter activity log based on isHackingMode
  const filteredLogs = isHackingMode
    ? activityLog // Show all logs in hacking mode
    : activityLog.filter(log => log.source === 'user' || log.source === 'ai'); // Show only user and AI messages in normal mode

  const chatClass = isHackingMode 
    ? "bg-gray-900 text-green-400 border-gray-800" 
    : "bg-white text-gray-900 border-gray-200";
  
  const inputClass = isHackingMode
    ? "bg-gray-800 text-green-400 border-gray-700 placeholder-green-700"
    : "bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500";
  
  const buttonClass = isHackingMode
    ? "bg-green-800 hover:bg-green-700 text-green-400" 
    : "bg-indigo-600 hover:bg-indigo-700 text-white";
  
  const micButtonClass = listening
    ? (isHackingMode ? "bg-red-900 text-red-400" : "bg-red-600 text-white")
    : (isHackingMode ? "bg-green-800 text-green-400" : "bg-gray-600 hover:bg-gray-700 text-white dark:bg-slate-600 dark:hover:bg-slate-500");

  if (!browserSupportsSpeechRecognition && micError === null) {
    // Set error if not already set by toggleListening (e.g. on initial render)
    setMicError("Speech recognition is not supported by your browser.");
  }

  return (
    <div className={`flex flex-col h-full border-l ${isHackingMode ? "bg-gray-900 text-green-400 border-gray-800" : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-700"}`}>
      <div className={`p-3 border-b ${isHackingMode ? "border-gray-700" : "border-gray-200 dark:border-slate-700"}`}>
        <h2 className={`text-lg font-semibold ${isHackingMode ? "text-green-300" : "text-gray-900 dark:text-gray-100"}`}>Activity Log</h2>
      </div>
      
      <div 
        ref={logDisplayRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredLogs.length === 0 ? (
          <div className={`text-center py-8 ${isHackingMode ? "text-green-800" : "text-gray-500 dark:text-gray-400"}`}>
            No activity yet. Start interacting to see the log.
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <ActivityLogItem 
              key={log.id || index} 
              log={log}
              isHackingMode={isHackingMode}
            />
          ))
        )}
      </div>
      
      {micError && (
        <div className={`p-2 text-center text-sm text-white ${isHackingMode ? 'bg-red-800/70' : 'bg-red-500/90'}`}>
          <AlertTriangle className="inline h-4 w-4 mr-1" /> {micError}
        </div>
      )}

      <div className={`p-3 border-t ${isHackingMode ? "border-gray-700" : "border-gray-200 dark:border-slate-700"}`}>
        <div className="flex items-end gap-2">
          <textarea
            value={listening ? transcript : inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={listening ? "Listening..." : "Type your message..."}
            rows={1}
            className={`flex-grow resize-none rounded-md border p-2 shadow-sm focus:outline-none focus:ring-1 ${isHackingMode ? "bg-gray-800 text-green-300 border-gray-700 placeholder-green-600 focus:border-green-500 focus:ring-green-500" : "bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"}`}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={listening}
          />
          
          <button
            onClick={handleSendText}
            disabled={!inputText.trim() || listening}
            className={`p-2.5 rounded-md ${isHackingMode ? "bg-green-700 hover:bg-green-600 text-green-300" : "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400"} disabled:opacity-60 transition-colors`}
          >
            <Send className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-md ${micButtonClass} disabled:opacity-60 transition-colors`}
            title={listening ? "Stop Recording" : "Start Voice Input"}
            disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
          >
            {listening ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {listening && (
          <div className={`mt-2 text-center py-1.5 text-xs font-medium rounded-md ${isHackingMode ? "bg-red-900/50 text-red-300" : "bg-red-100 dark:bg-red-700/30 text-red-600 dark:text-red-300"}`}>
            Listening... Click mic again to stop
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;