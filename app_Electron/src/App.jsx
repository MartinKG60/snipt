import React, { useState, useEffect } from 'react';
import EmailPrompt from './components/EmailPrompt';
import LoginPrompt from './components/LoginPrompt';
import Gallery from './components/Gallery';
import ChangePasswordModal from './components/ChangePasswordModal';
import BrandingHeader from './components/BrandingHeader';
import { uploadScreenshotToCloud } from './utils/upload';
import { getCurrentUser, logout } from './utils/auth';

function App() {
  const [notification, setNotification] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingBlob, setPendingBlob] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNotification((data) => {
        setNotification(data);
        setTimeout(() => setNotification(null), 3000);
      });

      window.electronAPI.onScreenshotCaptured((dataUrl) => {
        setCapturedImage(dataUrl);
        setShowActions(true);
      });
    }

    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      setCurrentUser(user);
    } catch (err) {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  const handleAreaCapture = () => {
    if (window.electronAPI) {
      // Minimize main window
      window.electronAPI.hideMainWindow();
      window.electronAPI.startAreaSelect();
    }
  };

  const handleFullScreenshot = () => {
    if (window.electronAPI) {
      // Minimize main window
      window.electronAPI.hideMainWindow();
      window.electronAPI.quickFullScreenshot();
    }
  };

  const handleSaveLocally = async () => {
    if (capturedImage && window.electronAPI) {
      await window.electronAPI.saveScreenshot(capturedImage, `screenshot-${Date.now()}.png`);
      setShowActions(false);
      setCapturedImage(null);
    }
  };

  const handleCopyToClipboard = async () => {
    if (capturedImage && window.electronAPI) {
      await window.electronAPI.copyToClipboard(capturedImage);
      setShowActions(false);
      setCapturedImage(null);
    }
  };

  const handleUploadToCloud = async () => {
    if (capturedImage) {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      setPendingBlob(blob);

      // If user is already logged in, upload directly
      if (isLoggedIn) {
        await handleDirectUpload(blob);
      } else {
        // Show email prompt for new users
        setShowEmailPrompt(true);
      }
    }
  };

  const handleDirectUpload = async (blob) => {
    try {
      setShowActions(false);
      setCapturedImage(null);

      const result = await uploadScreenshotToCloud(blob);
      await window.electronAPI.copyTextToClipboard(result.shareableLink);
      setNotification({ message: '✓ Uploaded! Link copied to clipboard', type: 'success' });

      // Auto-dismiss notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);

      setPendingBlob(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setNotification({ message: error.message || 'Upload failed', type: 'error' });

      // Auto-dismiss error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);

      setPendingBlob(null);
    }
  };

  const handleUploadSuccess = async () => {
    try {
      if (pendingBlob) {
        const result = await uploadScreenshotToCloud(pendingBlob);
        await window.electronAPI.copyTextToClipboard(result.shareableLink);
        setNotification({ message: '✓ Uploaded! Link copied to clipboard', type: 'success' });

        // Auto-dismiss notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }

      setShowEmailPrompt(false);
      setPendingBlob(null);
      setShowActions(false);
      setCapturedImage(null);
      checkLoginStatus();
    } catch (error) {
      console.error('Upload failed:', error);
      setNotification({ message: error.message || 'Upload failed', type: 'error' });

      // Auto-dismiss error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUploadCancel = () => {
    setShowEmailPrompt(false);
    setPendingBlob(null);
  };

  const handleCancel = () => {
    setShowActions(false);
    setCapturedImage(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setNotification({ message: 'Logged out successfully', type: 'success' });

      // Auto-dismiss notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ message: 'Failed to logout', type: 'error' });

      // Auto-dismiss error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    setNotification({ message: 'Password updated', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Modern gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 z-0" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-10 flex flex-col h-full">
          {/* Header with Logo and Auth */}
          <div className="flex justify-between items-start gap-4 flex-wrap mb-12 animate-fade-in">
            <BrandingHeader compact={true} />

            {/* Login/Logout Status Bar */}
            {isLoggedIn && currentUser ? (
              <div className="glass rounded-2xl px-4 sm:px-6 py-4 flex flex-col items-start gap-3 shadow-xl text-white animate-slide-up">
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wide">Logged in as</p>
                  <p className="text-xs sm:text-sm font-semibold">{currentUser.email}</p>
                </div>
                <div className="flex gap-2 min-w-max self-start">
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all duration-200 backdrop-blur border border-white/20"
                  >
                    Change password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-4 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg text-white border border-primary-400/50 backdrop-blur-md rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 animate-slide-up"
              >
                Login
              </button>
            )}
          </div>

          {/* Main Content - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="card p-8 sm:p-12 flex flex-col items-center gap-8 sm:gap-10 w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {/* My Uploads Button */}
              {isLoggedIn && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-2xl transition-all duration-300 font-semibold flex items-center gap-3 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl border border-primary-400/50 hover:border-primary-300"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg">My Uploads</span>
                </button>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full">
                <button
                  onClick={handleFullScreenshot}
                  className="group px-8 py-8 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 hover:from-primary-500/40 hover:to-primary-600/40 border border-primary-400/30 hover:border-primary-400/60 transition-all duration-300 flex flex-col items-center gap-4 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-white block">Full Screenshot</span>
                    <span className="text-xs text-white/70 mt-1">Entire screen</span>
                  </div>
                </button>
                <button
                  onClick={handleAreaCapture}
                  className="group px-8 py-8 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 hover:from-primary-500/40 hover:to-primary-600/40 border border-primary-400/30 hover:border-primary-400/60 transition-all duration-300 flex flex-col items-center gap-4 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-white block">Select Area</span>
                    <span className="text-xs text-white/70 mt-1">Draw & annotate</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 font-semibold flex items-center gap-3 animate-slide-up backdrop-blur-md border ${notification.type === 'success' 
          ? 'bg-green-500/90 text-white border-green-400/50' 
          : 'bg-red-500/90 text-white border-red-400/50'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Screenshot Action Modal */}
      {showActions && capturedImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold mb-2 text-white">Screenshot Captured!</h3>
            <p className="text-white/80 mb-8">What would you like to do?</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleSaveLocally}
                className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center gap-2 text-white border border-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="font-semibold text-xs">Save</span>
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center gap-2 text-white border border-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-xs">Copy</span>
              </button>
            </div>
            <button
              onClick={handleUploadToCloud}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg rounded-xl transition-all duration-200 text-white font-semibold flex items-center justify-center gap-2 mb-3 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload & Share
            </button>
            <button
              onClick={handleCancel}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white border border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showEmailPrompt && (
        <EmailPrompt
          onSuccess={handleUploadSuccess}
          onCancel={handleUploadCancel}
          onSwitchToLogin={() => {
            setShowEmailPrompt(false);
            setShowLoginPrompt(true);
          }}
        />
      )}

      {showLoginPrompt && (
        <LoginPrompt
          onSuccess={() => {
            setShowLoginPrompt(false);
            checkLoginStatus();
            setNotification({ message: '✓ Logged in successfully!', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
          }}
          onCancel={() => setShowLoginPrompt(false)}
          onSwitchToSignup={() => {
            setShowLoginPrompt(false);
            setShowEmailPrompt(true);
          }}
        />
      )}

      {showGallery && (
        <Gallery onClose={() => setShowGallery(false)} />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChanged}
        />
      )}
    </div>
  );
}

export default App;
