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

  const modalBgColor = "bg-slate-800";
  const textColor = "text-gray-200";
  const labelColor = "text-gray-400";
  const inputBgColor = "bg-slate-700";
  const inputBorderColor = "border-slate-600";
  const inputFocusRingColor = "focus:ring-indigo-500 focus:border-indigo-500";

  const selectedModeClasses = "border-indigo-500 bg-slate-700 ring-2 ring-indigo-500";
  const unselectedModeClasses = `${inputBorderColor} hover:border-indigo-600 hover:bg-slate-700/60`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`relative ${modalBgColor} rounded-lg shadow-xl max-w-md w-full mx-auto`}>
        <div className={`flex items-center justify-between p-5 border-b ${inputBorderColor} rounded-t`}>
          <h3 className={`text-xl font-semibold ${textColor}`}>
            Create New Browser Session
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`${textColor} bg-transparent hover:bg-slate-700 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center`}
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
              className={`${inputBgColor} ${inputBorderColor} ${textColor} text-sm rounded-lg ${inputFocusRingColor} block w-full p-3 placeholder-gray-500`}
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          <div>
            <p className={`block mb-2 text-sm font-medium ${labelColor}`}>Select Mode</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${
                  mode === 'Normal Mode' ? selectedModeClasses : unselectedModeClasses
                }`}
                onClick={() => setMode('Normal Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 ${mode === 'Normal Mode' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-500'} flex items-center justify-center mr-2.5 flex-shrink-0`}>
                    {mode === 'Normal Mode' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <h4 className={`font-semibold ${textColor}`}>Normal Mode</h4>
                </div>
                <p className={`text-xs ${labelColor} pl-[26px]`}>Enhanced secure browsing with AI assistance</p>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${
                  mode === 'Hacking Mode' ? selectedModeClasses : unselectedModeClasses
                }`}
                onClick={() => setMode('Hacking Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 ${mode === 'Hacking Mode' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-500'} flex items-center justify-center mr-2.5 flex-shrink-0`}>
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
              <div className={`w-5 h-5 mr-2.5 rounded border-2 ${inputBorderColor} ${enableRecording ? 'bg-indigo-500 border-indigo-500' : inputBgColor} flex items-center justify-center transition-all`}>
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
          
          <div className={`flex items-center justify-end space-x-3 pt-2 border-t ${inputBorderColor} mt-2`}>
            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-5 text-sm font-medium ${textColor} focus:outline-none bg-slate-600 hover:bg-slate-500 rounded-lg border ${inputBorderColor} focus:ring-4 focus:ring-slate-700 transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:ring-4 focus:ring-indigo-500/50 transition-colors"
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