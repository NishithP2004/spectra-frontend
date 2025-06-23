# Spectra Frontend

A React-based frontend application for managing browser sessions with AI agent integration.

## Features

- **Session Management**: Start and end browser sessions with Kubernetes backend
- **AI Agent Integration**: Chat with AI agents during browser sessions
- **VNC Display**: Real-time browser session viewing
- **Recording Support**: Optional session recording functionality
- **Authentication**: Firebase-based user authentication
- **Dark/Light Theme**: Theme switching support

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Backend API URL for session management
VITE_BACKEND_URL=http://localhost:80
```

## Session Management

The application integrates with a Kubernetes-based backend that provides:

- **Session Creation**: Creates isolated browser environments
- **Session Termination**: Properly cleans up resources
- **Agent Integration**: AI agent communication via `/agent` endpoints
- **VNC Access**: Real-time browser session viewing

### Session Flow

1. **Start Session**: User creates a new session with recording preferences
2. **Loading**: 10-second initialization period with progress indicator
3. **Active Session**: Browser environment ready with AI agent available
4. **Chat Integration**: Messages sent to `BACKEND_URL/agent` endpoints
5. **End Session**: Proper cleanup and resource termination

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Backend Requirements

The frontend expects a backend server running on the configured `VITE_BACKEND_URL` with the following endpoints:

- `POST /start-session` - Start a new browser session
- `POST /end-session` - End the current session
- `GET /vnc` - VNC proxy for browser session viewing
- `POST /agent/*` - AI agent communication endpoints

## Authentication

The application uses Firebase Authentication with Google Sign-In. Users must be authenticated to create and manage sessions.
