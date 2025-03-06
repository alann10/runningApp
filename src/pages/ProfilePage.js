import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats, getUserRoutes } from '../services/FirebaseService';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load data in parallel
        const [userStats, userRoutes] = await Promise.all([
          getUserStats(user.uid),
          getUserRoutes(user.uid)
        ]);

        if (isMounted) {
          setStats(userStats);
          setSavedRoutes(userRoutes);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (isMounted) {
          setError(
            error.code === 'failed-precondition' || error.message.includes('offline')
              ? 'Unable to load data. Please check your internet connection.'
              : 'Error loading profile data. Please try again later.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleBioSave = async () => {
    try {
      setIsLoading(true);
      // Save bio to Firebase
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error saving bio:', error);
      setError('Failed to save bio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-info">
          <img 
            src={user?.photoURL} 
            alt={user?.displayName} 
            className="profile-avatar"
          />
          <h1 className="profile-name">{user?.displayName}</h1>
        </div>
        
        <div className="bio-section">
          {isEditingBio ? (
            <div className="bio-edit">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                maxLength={200}
                disabled={isLoading}
              />
              <div className="bio-actions">
                <button 
                  onClick={() => setIsEditingBio(false)} 
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBioSave}
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-display" onClick={() => setIsEditingBio(true)}>
              <p>{bio || 'Click to add bio'}</p>
              <small>Click to edit</small>
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Weekly Runs</h3>
          <div className="stat-value">{stats?.runsThisWeek || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Miles</h3>
          <div className="stat-value">{stats?.totalMiles?.toFixed(1) || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Favorite Routes</h3>
          <div className="stat-value">{stats?.favoriteRoutes || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Pace</h3>
          <div className="stat-value">
            {stats?.averagePace ? `${Math.floor(stats.averagePace)}:${((stats.averagePace % 1) * 60).toFixed(0).padStart(2, '0')}` : '--:--'}
          </div>
        </div>
      </div>

      <div className="routes-section">
        <h2>Saved Routes</h2>
        <div className="routes-grid">
          {savedRoutes.map(route => (
            <div key={route.id} className="route-card">
              <div className="route-preview">
                {/* Add route preview map here */}
              </div>
              <div className="route-info">
                <h3>{route.name}</h3>
                <p>{route.distance.toFixed(1)} miles</p>
                <div className="route-stats">
                  <span>Best Time: {route.bestTime}</span>
                  <span>Last Run: {new Date(route.lastRun).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 