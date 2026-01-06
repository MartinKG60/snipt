import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark-surface border-b border-primary-400/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary-400">
          Snipt Dashboard
        </Link>
        
        <div className="flex gap-4">
          <Link to="/gallery" className="hover:text-primary-400 transition">
            Gallery
          </Link>
          <Link to="/settings" className="hover:text-primary-400 transition">
            Settings
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
