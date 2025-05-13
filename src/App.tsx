import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WatchSessionPage from './pages/WatchSessionPage';
import BrowserSessionPage from './pages/BrowserSessionPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

function AppRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100">
      {!isLoginPage && <Navbar />}
      <main className={`flex-grow ${!isLoginPage ? 'mt-16' : ''}`}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              
              <Route path="/watch/:sessionId" element={
                <ProtectedRoute>
                  <WatchSessionPage />
                </ProtectedRoute>
              } />
              
              <Route path="/session/:sessionId" element={
                <ProtectedRoute>
                  <BrowserSessionPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;