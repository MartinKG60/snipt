import { useState, useEffect } from 'react';
import { getUserScreenshots, deleteScreenshot } from '../utils/gallery';
import { getCurrentUser } from '../utils/auth';

export default function Gallery({ onClose }) {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadScreenshots();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const loadScreenshots = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserScreenshots();
      // Show only the latest 20 screenshots
      setScreenshots(data.slice(0, 20));
    } catch (err) {
      setError(err.message || 'Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId, path) => {
    if (!confirm('Delete this screenshot?')) return;

    try {
      await deleteScreenshot(imageId, path);
      setScreenshots(screenshots.filter(img => img.id !== imageId));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      if (window.electronAPI && window.electronAPI.copyTextToClipboard) {
        await window.electronAPI.copyTextToClipboard(url);
      } else {
        await navigator.clipboard.writeText(url);
      }
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border-primary-400/20 animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">My Uploads</h2>
            {user && <p className="text-sm text-white/60 mt-1">{user.email}</p>}
            <p className="text-xs text-white/50 mt-2">Showing latest 20 • View all on dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 font-semibold"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500/30 border-t-primary-500 mx-auto mb-4"></div>
              <p className="text-white/70">Loading screenshots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 inline-block">{error}</p>
              <button
                onClick={loadScreenshots}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : screenshots.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/70 font-medium">No screenshots yet</p>
              <p className="text-sm text-white/50 mt-2">Upload your first screenshot to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((screenshot) => (
                <div key={screenshot.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary-400/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="aspect-video bg-white/5 relative overflow-hidden">
                    <img
                      src={screenshot.url}
                      alt={screenshot.filename}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end gap-2 p-3">
                      <button
                        onClick={() => handleCopyUrl(screenshot.url)}
                        className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleDelete(screenshot.id, screenshot.path)}
                        className="w-full px-3 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <p className="text-xs text-white/70 truncate" title={screenshot.filename}>{screenshot.filename}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(screenshot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
