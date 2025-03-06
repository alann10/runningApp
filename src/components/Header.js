import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/AuthService';
import '../styles/Header.css';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        Venture Miles
      </Link>
      
      {user && (
        <div className="user-section">
          <Link to="/profile" className="user-info">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="user-avatar"
              />
            )}
            <span className="user-name">{user.displayName}</span>
          </Link>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header; 