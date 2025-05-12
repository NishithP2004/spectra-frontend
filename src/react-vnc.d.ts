declare module 'react-vnc' {
  import * as React from 'react';

  interface VncCredentials {
    username?: string;
    password?: string;
    target?: string;
  }

  interface RFBOptions {
    shared?: boolean;
    credentials?: VncCredentials;
    repeaterID?: string;
    wsProtocols?: string | string[];
  }

  interface VncScreenProps {
    url: string;
    scaleViewport?: boolean;
    background?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<any>; // Or a more specific type if known
    debug?: boolean;
    loadingUI?: React.ReactNode;
    onConnect?: (rfb?: any) => void; // Consider using a more specific RFB type if available
    onDisconnect?: (rfb?: any) => void; // Consider using a more specific RFB type if available
    onCredentialsRequired?: (rfb?: any) => void; // Consider using a more specific RFB type if available
    onDesktopName?: (name: string) => void;
    onBell?: () => void;
    onSecurityFailure?: (details: any) => void;
    onClipboard?: (text: string) => void;
    onCapabilities?: (capabilities: any) => void;
    rfbOptions?: RFBOptions; // Added rfbOptions
    // Props from maintainer's comment (ensure they are covered or add them)
    viewOnly?: boolean;
    focusOnClick?: boolean;
    clipViewport?: boolean;
    dragViewport?: boolean;
    resizeSession?: boolean;
    showDotCursor?: boolean;
    qualityLevel?: number;
    compressionLevel?: number;
    autoConnect?: boolean; // Changed from number in comment to boolean for typical usage
    retryDuration?: number;
  }

  export const VncScreen: React.FC<VncScreenProps>;
} 