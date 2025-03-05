import React from 'react';
import '../styles/RunStats.css';

const RunStats = ({ stats }) => {
  const formatPace = (pace) => {
    if (!pace || pace === 0 || !isFinite(pace)) return '--:--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return '--';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="run-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Distance</div>
          <div className="stat-value">
            {stats.distance ? stats.distance.toFixed(2) : '--'}
            <span className="stat-unit">mi</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Time</div>
          <div className="stat-value">
            {formatTime(stats.time)}
            <span className="stat-unit">min</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Pace</div>
          <div className="stat-value">
            {formatPace(stats.pace)}
            <span className="stat-unit">min/mi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunStats;
