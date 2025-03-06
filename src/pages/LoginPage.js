import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/AuthService';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting Google sign in...');
      await signInWithGoogle();
      console.log('Sign in successful');
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to Venture Miles</h1>
        <p>Sign in to start tracking your runs</p>
        
        {error && (
          <div className="error-message">
            {error}
            {process.env.NODE_ENV === 'development' && (
              <div className="error-details">
                Please make sure Firebase Authentication is properly configured
              </div>
            )}
          </div>
        )}
        
        <button 
          className={`google-sign-in ${isLoading ? 'loading' : ''}`} 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {!isLoading && (
            <img 
              src="/google-icon.png" 
              alt="Google" 
              className="google-icon"
            />
          )}
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 