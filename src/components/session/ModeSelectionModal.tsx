import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, mode: string, enableRecording: boolean) => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [mode, setMode] = useState('Normal Mode');
  const [sessionTitle, setSessionTitle] = useState('');
  const [enableRecording, setEnableRecording] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) {
      alert("Please enter a session title.");
      return;
    }
    onSubmit(sessionTitle, mode, enableRecording);
  };

  // Glassmorphic modal background
  const modalStyleClasses = "bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl border border-gray-200 dark:border-slate-700/80";

  // Define base classes and dark mode overrides for inner elements
  const textColor = "text-gray-800 dark:text-gray-100";
  const headingColor = "text-gray-900 dark:text-white";
  const labelColor = "text-gray-600 dark:text-gray-300";
  const inputBgColor = "bg-gray-50/80 dark:bg-slate-700/80";
  const inputBorderColor = "border-gray-300 dark:border-slate-600";
  const inputFocusRingColor = "focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600";
  const placeholderColor = "placeholder-gray-400 dark:placeholder-gray-500";

  const selectedModeBaseClasses = "border-indigo-500 ring-2 ring-indigo-500";
  const selectedModeLightClasses = "bg-indigo-50";
  const selectedModeDarkClasses = "dark:bg-slate-700";

  const unselectedModeBaseClasses = "hover:border-indigo-500";
  const unselectedModeLightClasses = "bg-white hover:bg-indigo-50";
  const unselectedModeDarkClasses = "dark:bg-slate-800 dark:hover:bg-slate-700/60";
  
  const radioDotSelectedLight = "bg-indigo-500 border-indigo-500";
  const radioDotSelectedDark = "dark:bg-indigo-500 dark:border-indigo-500";
  const radioDotUnselectedLight = "border-gray-400";
  const radioDotUnselectedDark = "dark:border-gray-500";

  const checkboxSelectedLight = "bg-indigo-500 border-indigo-500";
  const checkboxSelectedDark = "dark:bg-indigo-500 dark:border-indigo-500";
  const checkboxUnselectedLightBg = "bg-gray-50";
  const checkboxUnselectedDarkBg = "dark:bg-slate-700/80";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 dark:bg-slate-900/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`relative ${modalStyleClasses} rounded-lg max-w-md w-full mx-auto`}>
        <div className={`flex items-center justify-between p-5 border-b ${inputBorderColor} rounded-t`}>
          <h3 className={`text-xl font-semibold ${headingColor}`}>
            Create New Browser Session
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`bg-transparent hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center ${labelColor} hover:${textColor}`}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div>
            <label htmlFor="sessionTitle" className={`block mb-1.5 text-sm font-medium ${labelColor}`}>
              Session Title
            </label>
            <input
              type="text"
              id="sessionTitle"
              className={`${inputBgColor} ${inputBorderColor} ${textColor} ${placeholderColor} text-sm rounded-lg ${inputFocusRingColor} block w-full p-3`}
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          <div>
            <p className={`block mb-2 text-sm font-medium ${labelColor}`}>Select Mode</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Normal Mode */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${inputBorderColor} ${
                  mode === 'Normal Mode'
                    ? `${selectedModeBaseClasses} bg-indigo-100/80 dark:bg-slate-700/90`
                    : `${unselectedModeBaseClasses} bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80`
                }`}
                onClick={() => setMode('Normal Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 flex-shrink-0 ${
                    mode === 'Normal Mode' ? `${radioDotSelectedLight} ${radioDotSelectedDark}` : `${radioDotUnselectedLight} ${radioDotUnselectedDark}`
                  }`}>
                    {mode === 'Normal Mode' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <h4 className={`font-semibold ${textColor}`}>Normal Mode</h4>
                </div>
                <p className={`text-xs ${labelColor} pl-[26px]`}>Enhanced secure browsing with AI assistance</p>
              </div>
              
              {/* Hacking Mode */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${inputBorderColor} ${
                  mode === 'Hacking Mode'
                    ? `${selectedModeBaseClasses} bg-indigo-100/80 dark:bg-slate-700/90`
                    : `${unselectedModeBaseClasses} bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80`
                }`}
                onClick={() => setMode('Hacking Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 flex-shrink-0 ${
                    mode === 'Hacking Mode' ? `${radioDotSelectedLight} ${radioDotSelectedDark}` : `${radioDotUnselectedLight} ${radioDotUnselectedDark}`
                  }`}>
                    {mode === 'Hacking Mode' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <h4 className={`font-semibold ${textColor}`}>Hacking Mode</h4>
                </div>
                <p className={`text-xs ${labelColor} pl-[26px]`}>Security testing tools and specialized environment</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="enableRecording" className="flex items-center cursor-pointer">
              <div className={`w-5 h-5 mr-2.5 rounded border-2 ${inputBorderColor} flex items-center justify-center transition-all ${
                enableRecording ? `${checkboxSelectedLight} ${checkboxSelectedDark}` : `${inputBgColor}`
              }`}>
                {enableRecording && <Check className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                id="enableRecording"
                className="sr-only"
                checked={enableRecording}
                onChange={(e) => setEnableRecording(e.target.checked)}
              />
              <span className={`text-sm font-medium ${labelColor}`}>Enable Recording?</span>
            </label>
          </div>
          
          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${inputBorderColor} mt-4`}>
            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-5 text-sm font-medium ${textColor} focus:outline-none bg-gray-200/70 hover:bg-gray-300/70 dark:bg-slate-600/70 dark:hover:bg-slate-500/70 rounded-lg border ${inputBorderColor} focus:ring-4 focus:ring-gray-300 dark:focus:ring-slate-600 transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-colors"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModeSelectionModal;