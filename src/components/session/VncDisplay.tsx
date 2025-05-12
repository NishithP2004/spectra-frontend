import React, { useRef } from 'react';
import { VncScreen } from 'react-vnc';

interface VncDisplayProps {
  url: string;
  vncPassword?: string;
  isHackingMode?: boolean;
  windowTitle?: string;
}

const VncDisplay: React.FC<VncDisplayProps> = ({
  url,
  vncPassword,
  isHackingMode = false,
  windowTitle = "Spectra VNC Session",
}) => {
  const screenRef = useRef<any>(null);

  const rfbOptions = vncPassword ? {
    credentials: {
      password: vncPassword,
    },
  } : {};

  const outerContainerClasses = "w-full h-full flex items-center justify-center p-2 bg-gradient-to-br from-indigo-200 via-purple-100 to-blue-200 dark:from-indigo-800 dark:via-purple-900 dark:to-blue-800";

  const windowFrameClasses = ` \
    rounded-lg shadow-xl overflow-hidden flex flex-col \
    ${isHackingMode
      ? 'bg-gray-900 border border-green-700' 
      : 'bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700'}
  `;

  const titleBarClasses = ` \
    h-7 flex items-center justify-between px-3 flex-shrink-0 \
    ${isHackingMode 
      ? 'bg-gray-800 border-b border-green-700' 
      : 'bg-gray-200 dark:bg-slate-700 border-b border-gray-300 dark:border-slate-600'}
  `;
  
  const titleTextClasses = ` \
    text-xs font-medium truncate \
    ${isHackingMode 
      ? 'text-green-300' 
      : 'text-gray-700 dark:text-gray-200'}
  `;

  const buttonBaseClasses = "w-3 h-3 rounded-full";
  const buttons = [
    { color: isHackingMode ? 'bg-red-700' : 'bg-red-500' },
    { color: isHackingMode ? 'bg-yellow-700' : 'bg-yellow-400' },
    { color: isHackingMode ? 'bg-green-700' : 'bg-green-500' },
  ];

  const contentAreaClasses = `flex-grow flex items-center justify-center relative ${isHackingMode ? 'bg-black' : 'bg-black' }`;

  const loadingUiContainerClasses = `text-center ${isHackingMode ? 'text-green-400' : 'text-gray-700 dark:text-gray-300'}`;

  const noUrlDivClasses = `text-center p-6 rounded-lg max-w-md mx-auto ${isHackingMode
      ? 'text-green-300'
      : 'text-gray-700 dark:text-gray-300'
    }`;

  const noUrlTextClasses = `text-sm ${isHackingMode ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`;

  return (
    <div className={outerContainerClasses}>
      <div className={windowFrameClasses} style={{ width: '90%', height: '90%', maxWidth: '1200px'}}>
        <div className={titleBarClasses}>
          <div className="flex space-x-1.5">
            {buttons.map((btn, i) => (
              <div key={i} className={`${buttonBaseClasses} ${btn.color}`}></div>
            ))}
          </div>
          <div className={titleTextClasses}>{windowTitle}</div>
          <div className="w-12"></div>
        </div>

        <div className={contentAreaClasses}>
          {url ? (
            <VncScreen
              url={url}
              scaleViewport
              background="rgba(255, 255, 255, 255)"
              style={{
                width: '100%',
                height: '100%',
              }}
              ref={screenRef}
              debug={false}
              rfbOptions={rfbOptions}
              loadingUI={(
                <div className={loadingUiContainerClasses}>
                  <p className="text-lg font-semibold mb-2">
                    Connecting to VNC Session...
                  </p>
                  <p>URL: {url}</p>
                </div>
              )}
            />
          ) : (
            <div className={noUrlDivClasses}>
              <p className="text-lg font-semibold mb-2">
                VNC Session URL Not Provided
              </p>
              <p className={noUrlTextClasses}>
                Cannot connect to the VNC session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VncDisplay;