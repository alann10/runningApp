import React from 'react';

function RunStats({ stats }) {
  return (
    <div className="run-stats">
      <p>Distance: {(stats.distance / 1000).toFixed(2)} km</p>
      <p>Duration: {Math.floor(stats.duration / 60)}:{(stats.duration % 60).toString().padStart(2, '0')}</p>
      <p>Pace: {stats.pace.toFixed(2)} min/km</p>
    </div>
  );
}

export default RunStats;
