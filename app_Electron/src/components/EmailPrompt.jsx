import { useState } from 'react';
import { signupAutoWithEmail, autoLoginAfterSignup } from '../utils/auth';

export default function EmailPrompt({ onSuccess, onCancel, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Auto-create user via Supabase Edge Function
      const signupResult = await signupAutoWithEmail(email);
      setPassword(signupResult.password);

      // Step 2: Auto-login with returned credentials
      await autoLoginAfterSignup(email, signupResult.password);

      // Show password to user first
      setShowPassword(true);
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Email already exists. Please use another email or login with your password.');
      } else {
        setError(err.message || 'Failed to create account');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-3xl p-8 w-96 max-w-full shadow-2xl animate-slide-up border-primary-400/20">
        <h2 className="text-2xl font-bold mb-2 text-white">Create Account</h2>
        <p className="text-white/60 text-sm mb-6">Upload & share your screenshots</p>

        {!showPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 disabled:opacity-50 border border-white/20 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={loading}
              className="w-full text-sm text-primary-300 hover:text-primary-200 underline transition-colors mt-3"
            >
              Already have an account? Login
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-gradient-to-br from-green-500/20 to-primary-500/20 border-2 border-green-400/50 rounded-2xl p-6">
              <p className="text-lg font-bold mb-4 text-green-300 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Account Created!
              </p>
              <p className="text-sm text-white/80 mb-4">
                Email: <span className="font-semibold text-white">{email}</span>
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-white/90 mb-2">Your password:</p>
                <div className="bg-black/30 border border-white/20 rounded-lg p-3 mb-3 backdrop-blur-sm">
                  <p className="text-sm font-mono font-bold break-all select-all text-primary-300">{password}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      if (window.electronAPI && window.electronAPI.copyTextToClipboard) {
                        await window.electronAPI.copyTextToClipboard(password);
                      } else {
                        await navigator.clipboard.writeText(password);
                      }
                      alert('Password copied to clipboard!');
                    } catch (err) {
                      console.error('Failed to copy:', err);
                    }
                  }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Password
                </button>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-400/50 rounded-lg p-3">
                <p className="text-xs text-yellow-200 font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  Save this password! You'll need it to login.
                </p>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Continue to Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
