import React, { useState } from 'react';
import { changePassword } from '../utils/auth';

const MIN_LENGTH = 6;

function ChangePasswordModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (password.length < MIN_LENGTH) {
      return `Password must be at least ${MIN_LENGTH} characters`;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Use upper, lower, and a number';
    }
    if (password !== confirm) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(password);
      setIsSubmitting(false);
      setPassword('');
      setConfirm('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsSubmitting(false);
      setError(err?.message || 'Could not update password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="glass text-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative border-primary-400/20 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white/100 transition-colors text-2xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">Change Password</h2>
        <p className="text-sm text-white/60 mb-6 text-center">
          Create a strong password you can remember.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
              placeholder="At least 6 characters"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
              placeholder="Repeat password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg text-white font-semibold rounded-xl disabled:opacity-60 transition-all duration-200 hover:scale-105 active:scale-95 mt-2"
          >
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
