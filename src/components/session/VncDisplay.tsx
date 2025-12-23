import React, { useRef } from 'react';
import { VncScreen } from 'react-vnc';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();

  const rfbOptions = vncPassword ? {
    credentials: {
      password: vncPassword,
    },
  } : {};

  const outerContainerClasses = `w-full h-full flex items-center justify-center p-8 relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900`;

  // MacOS Window Style
  const windowFrameClasses = ` \
    relative z-10 w-full h-full max-w-[1400px] flex flex-col \
    rounded-2xl shadow-2xl overflow-hidden \
    transition-all duration-300 \
    ${isHackingMode
      ? 'bg-black border border-green-900/50 box-shadow-[0_0_50px_rgba(0,255,0,0.1)]'
      : 'bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#000000] border border-gray-200 dark:border-white/10 animate-halo transition-shadow'}
  `;

  const titleBarClasses = ` \
    h-10 flex items-center justify-between px-4 shrink-0 \
    ${isHackingMode
      ? 'bg-gray-900 border-b border-green-900/30'
      : 'bg-gray-100 dark:bg-[#121212] border-b border-gray-200 dark:border-white/5'}
  `;

  const titleTextClasses = ` \
    text-xs font-medium tracking-wide \
    ${isHackingMode
      ? 'text-green-500 font-mono'
      : 'text-gray-500 dark:text-gray-400'}
  `;

  const contentAreaClasses = `flex-grow relative flex items-center justify-center overflow-hidden ${isHackingMode ? 'bg-black' : 'bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black'}`;

  const loadingUiContainerClasses = `text-center ${isHackingMode ? 'text-green-400' : 'text-gray-700 dark:text-gray-300'}`;

  const noUrlDivClasses = `text-center p-6 rounded-lg max-w-md mx-auto ${isHackingMode
    ? 'text-green-300'
    : 'text-gray-700 dark:text-gray-300'
    }`;

  const noUrlTextClasses = `text-sm ${isHackingMode ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`;

  // Determine VNC canvas background based on theme and mode
  const vncBackground = "rgba(255, 255, 255, 255)";

  return (
    <div className={outerContainerClasses}>
      {/* Wavy Animation Overlay Background */}
      {!isHackingMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
      )}

      <div className={windowFrameClasses}>
        <div className={titleBarClasses}>
          {/* Traffic Lights */}
          <div className="flex space-x-2 w-20">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 hover:brightness-90 transition-all"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 hover:brightness-90 transition-all"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 hover:brightness-90 transition-all"></div>
          </div>

          {/* Title */}
          <div className={titleTextClasses}>
            {isHackingMode ? '>_ SECURE_SHELL_VNC' : windowTitle}
          </div>

          {/* Spacer for centering */}
          <div className="w-20"></div>
        </div>

        <div className={contentAreaClasses}>
          {url ? (
            <VncScreen
              url={url}
              scaleViewport
              background={vncBackground}
              style={{
                width: '100%',
                height: '100%',
              }}
              ref={screenRef}
              debug={false}
              rfbOptions={rfbOptions}
              loadingUI={(
                <div className={loadingUiContainerClasses}>
                  <div className="relative mb-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  </div>
                  <p className="text-sm font-medium opacity-80">Establishing Secure Connection...</p>
                </div>
              )}
            />
          ) : (
            <div className={noUrlDivClasses}>
              <p className="text-lg font-semibold mb-2">Signal Lost</p>
              <p className={noUrlTextClasses}>Use the dashboard to restart the session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VncDisplay;