import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Send, Mic, Loader, AlertTriangle, Sparkles } from 'lucide-react';
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

  const [micError, setMicError] = useState<string | null>(null);
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
    setMicError(null);
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
    } else {
      setInputText('');
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    if (prevListening.current && !listening && transcript) {
      setInputText(transcript);
      resetTranscript();
    }
    prevListening.current = listening;
  }, [listening, transcript, resetTranscript]);

  const filteredLogs = isHackingMode
    ? activityLog
    : activityLog.filter(log => log.source === 'user' || log.source === 'ai');

  const containerClass = isHackingMode
    ? "bg-gray-900 text-green-400 border-gray-800"
    : "bg-white dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-white/10";







  if (!browserSupportsSpeechRecognition && micError === null) {
    setMicError("Speech recognition is not supported by your browser.");
  }

  return (
    <div className={`flex flex-col h-full border-l ${containerClass} relative`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${isHackingMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#050505]/50 backdrop-blur-sm"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${isHackingMode ? "bg-green-900/30" : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/20"}`}>
            <Sparkles className={`w-4 h-4 ${isHackingMode ? "text-green-400" : "text-white"}`} />
          </div>
          <div>
            <h2 className={`font-semibold text-sm ${isHackingMode ? "text-green-300" : "text-gray-900 dark:text-white"}`}>
              AI Assistant
            </h2>
            <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isHackingMode ? "text-green-500/70" : "text-gray-500"}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>

      </div>

      {/* Messages Area */}
      <div
        ref={logDisplayRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <div className={`p-4 rounded-2xl mb-4 ${isHackingMode ? "bg-green-900/20" : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5"}`}>
              <Sparkles className={`w-8 h-8 ${isHackingMode ? "text-green-500" : "text-blue-600 dark:text-blue-400"}`} />
            </div>
            <p className={`text-sm font-medium ${isHackingMode ? "text-green-400" : "text-gray-500"}`}>
              How can I help you?
            </p>
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

      {/* Input Area - Floating/Compact */}
      <div className="p-4 shrink-0 z-10">
        {micError && (
          <div className={`mb-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${isHackingMode ? 'bg-red-900/30 text-red-300 border border-red-900/50' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        <div className="relative group">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur ${isHackingMode ? 'hidden' : 'block'}`}></div>
          <div className={`relative flex items-end gap-2 p-1.5 rounded-2xl border shadow-sm transition-all focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:border-blue-500/30 ${isHackingMode ? "bg-gray-900 border-green-900/50 focus-within:ring-green-500/30 focus-within:border-green-500/30" : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/10"}`}>
            <textarea
              value={listening ? transcript : inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={listening ? "Listening..." : "Type a message..."}
              rows={1}
              className={`w-full resize-none bg-transparent border-0 p-3 max-h-32 focus:ring-0 focus:outline-none text-sm ${isHackingMode ? "text-green-300 placeholder-green-700" : "text-gray-900 dark:text-white placeholder-gray-400"}`}
              style={{ minHeight: '44px' }}
              disabled={listening}
            />

            <div className="flex items-center gap-1 pb-1.5 pr-1.5">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${listening
                  ? "bg-red-500 text-white shadow-lg animate-pulse"
                  : (isHackingMode ? "text-green-500 hover:bg-green-900/30" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-blue-400")}`}
                title={listening ? "Stop Recording" : "Start Voice Input"}
                disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
              >
                {listening ? <Loader className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={handleSendText}
                disabled={!inputText.trim() || listening}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${isHackingMode
                  ? "bg-green-600 text-black hover:bg-green-500"
                  : "bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {listening && (
          <div className="mt-2 text-center text-[10px] font-medium text-gray-400 animate-pulse">
            Listening...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
