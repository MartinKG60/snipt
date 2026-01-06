import { useState } from 'react';
import { loginWithPassword } from '../utils/auth';

export default function LoginPrompt({ onSuccess, onCancel, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithPassword(email, password);
      onSuccess();
    } catch (err) {
      if (err.message.includes('Invalid login credentials') || err.message.includes('not found')) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Failed to login');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-3xl p-8 w-96 max-w-full shadow-2xl animate-slide-up border-primary-400/20">
        <h2 className="text-2xl font-bold mb-2 text-white">Login to Snipt</h2>
        <p className="text-white/60 text-sm mb-6">Access your screenshot uploads</p>

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

          <div>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {loading ? 'Logging in...' : 'Login'}
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
            onClick={onSwitchToSignup}
            disabled={loading}
            className="w-full text-sm text-primary-300 hover:text-primary-200 underline transition-colors"
          >
            Don't have an account? Create one
          </button>
        </form>
      </div>
    </div>
  );
}
