import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RefreshCw, Sparkles } from 'lucide-react';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, mode: string, enableRecording: boolean, isPublic: boolean) => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [mode, setMode] = useState('Normal Mode');
  const [sessionTitle, setSessionTitle] = useState('');
  const [enableRecording, setEnableRecording] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  if (!isOpen) return null;

  // Random session name generation
  const generateRandomNames = () => {
    const prefixes = [
      'Secure', 'Advanced', 'Professional', 'Elite', 'Premium', 'Ultra', 'Pro', 'Master', 'Expert', 'Dynamic',
      'Quantum', 'Cyber', 'Digital', 'Virtual', 'Cloud', 'Smart', 'Intelligent', 'Automated', 'Optimized', 'Enhanced'
    ];

    const activities = [
      'Browsing', 'Research', 'Analysis', 'Testing', 'Development', 'Exploration', 'Investigation', 'Audit', 'Review', 'Assessment',
      'Penetration', 'Security', 'Vulnerability', 'Compliance', 'Forensics', 'Incident Response', 'Threat Hunting', 'Red Team', 'Blue Team', 'Purple Team'
    ];

    const contexts = [
      'Session', 'Environment', 'Workspace', 'Lab', 'Sandbox', 'Playground', 'Zone', 'Space', 'Hub', 'Center',
      'Mission', 'Operation', 'Project', 'Campaign', 'Initiative', 'Exercise', 'Simulation', 'Demo', 'Pilot', 'Trial'
    ];

    const adjectives = [
      'Stealth', 'Rapid', 'Precise', 'Comprehensive', 'Thorough', 'Systematic', 'Methodical', 'Strategic', 'Tactical', 'Advanced',
      'Cutting-edge', 'Next-gen', 'Revolutionary', 'Innovative', 'Breakthrough', 'Game-changing', 'Disruptive', 'Transformative', 'Pioneering', 'Groundbreaking'
    ];

    const names: string[] = [];
    for (let i = 0; i < 6; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      const adjective = Math.random() > 0.5 ? adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' : '';

      const name = `${prefix} ${adjective}${activity} ${context}`;
      if (!names.includes(name)) {
        names.push(name);
      }
    }

    return names;
  };

  const handleGenerateSuggestions = () => {
    const names = generateRandomNames();
    setSuggestedNames(names);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (name: string) => {
    setSessionTitle(name);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) {
      alert("Please enter a session title.");
      return;
    }
    onSubmit(sessionTitle, mode, enableRecording, isPublic);
  };

  // Glassmorphic modal background
  const modalStyleClasses = "bg-white dark:bg-[#1a1a1a] backdrop-blur-lg shadow-2xl border border-gray-200 dark:border-white/10";

  // Define base classes and dark mode overrides for inner elements
  const textColor = "text-gray-800 dark:text-gray-100";
  const headingColor = "text-gray-900 dark:text-white";
  const labelColor = "text-gray-600 dark:text-gray-300";
  const inputBgColor = "bg-gray-50 dark:bg-black";
  const inputBorderColor = "border-gray-300 dark:border-gray-700";
  const inputFocusRingColor = "focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600";
  const placeholderColor = "placeholder-gray-400 dark:placeholder-gray-500";

  const selectedModeBaseClasses = "border-indigo-500 ring-2 ring-indigo-500";
  const selectedModeLightClasses = "bg-indigo-50";
  const selectedModeDarkClasses = "dark:bg-indigo-900/20";

  const unselectedModeBaseClasses = "hover:border-indigo-500";
  const unselectedModeLightClasses = "bg-white hover:bg-indigo-50";
  const unselectedModeDarkClasses = "dark:bg-[#1a1a1a] dark:hover:bg-[#252525]";

  const radioDotSelectedLight = "bg-indigo-500 border-indigo-500";
  const radioDotSelectedDark = "dark:bg-indigo-500 dark:border-indigo-500";
  const radioDotUnselectedLight = "border-gray-400";
  const radioDotUnselectedDark = "dark:border-gray-500";

  const checkboxSelectedLight = "bg-indigo-500 border-indigo-500";
  const checkboxSelectedDark = "dark:bg-indigo-500 dark:border-indigo-500";
  const checkboxUnselectedLightBg = "bg-gray-50";
  const checkboxUnselectedDarkBg = "dark:bg-slate-700";

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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="sessionTitle" className={`block text-sm font-medium ${labelColor}`}>
                Session Title
              </label>
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                title="Generate random session names"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest Names</span>
              </button>
            </div>

            <div className="relative" ref={suggestionsRef}>
              <input
                type="text"
                id="sessionTitle"
                className={`${inputBgColor} ${inputBorderColor} ${textColor} ${placeholderColor} text-sm rounded-lg ${inputFocusRingColor} block w-full p-3 pr-10`}
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                onFocus={() => setShowSuggestions(suggestedNames.length > 0)}
                placeholder="Enter a descriptive title or click 'Suggest Names'"
                required
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestedNames.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Suggested Names</span>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {suggestedNames.map((name, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(name)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleGenerateSuggestions}
                        className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate More</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className={`block mb-2 text-sm font-medium ${labelColor}`}>Select Mode</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Normal Mode */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${inputBorderColor} ${mode === 'Normal Mode'
                  ? `${selectedModeBaseClasses} ${selectedModeLightClasses} ${selectedModeDarkClasses}`
                  : `${unselectedModeBaseClasses} ${unselectedModeLightClasses} ${unselectedModeDarkClasses}`
                  }`}
                onClick={() => setMode('Normal Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 flex-shrink-0 ${mode === 'Normal Mode' ? `${radioDotSelectedLight} ${radioDotSelectedDark}` : `${radioDotUnselectedLight} ${radioDotUnselectedDark}`
                    }`}>
                    {mode === 'Normal Mode' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <h4 className={`font-semibold ${textColor}`}>Normal Mode</h4>
                </div>
                <p className={`text-xs ${labelColor} pl-[26px]`}>Enhanced secure browsing with AI assistance</p>
              </div>

              {/* Hacking Mode */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${inputBorderColor} ${mode === 'Hacking Mode'
                  ? `${selectedModeBaseClasses} ${selectedModeLightClasses} ${selectedModeDarkClasses}`
                  : `${unselectedModeBaseClasses} ${unselectedModeLightClasses} ${unselectedModeDarkClasses}`
                  }`}
                onClick={() => setMode('Hacking Mode')}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 flex-shrink-0 ${mode === 'Hacking Mode' ? `${radioDotSelectedLight} ${radioDotSelectedDark}` : `${radioDotUnselectedLight} ${radioDotUnselectedDark}`
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
              <div className={`w-5 h-5 mr-2.5 rounded border-2 ${inputBorderColor} flex items-center justify-center transition-all ${enableRecording ? `${checkboxSelectedLight} ${checkboxSelectedDark}` : `${checkboxUnselectedLightBg} ${checkboxUnselectedDarkBg}`
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
              <span className={`text-sm font-medium ${labelColor}`}>Enable Recording? (experimental)</span>
            </label>
          </div>

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${inputBorderColor} mt-4`}>
            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-5 text-sm font-medium ${textColor} focus:outline-none bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-lg border ${inputBorderColor} focus:ring-4 focus:ring-gray-300 dark:focus:ring-slate-600 transition-colors`}
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