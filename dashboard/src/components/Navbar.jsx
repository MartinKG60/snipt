import React from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar() {
  const handleLogout = async () => {
    await logout();
    window.location.href = 'https://martinkG60.github.io/snipt/';
  };

  return (
    <nav className="bg-dark-surface border-b border-primary-400/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary-400">
          Snipt Dashboard
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:text-primary-400 transition">
            Gallery
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
