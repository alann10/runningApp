import React from 'react';
import MapComponent from './MapComponent';
import RunStats from './RunStats';
import '../styles/NavigationView.css';

const NavigationView = ({ 
  route, 
  location, 
  instructions, 
  currentInstruction, 
  stats, 
  onStop 
}) => {
  return (
    <div className="navigation-view">
      {/* Top Navigation Bar */}
      <div className="nav-header">
        <div className="current-instruction">
          {instructions[currentInstruction] || "Follow the route"}
        </div>
      </div>

      {/* Main Map View */}
      <div className="map-view">
        <MapComponent 
          latitude={location?.latitude}
          longitude={location?.longitude}
          route={route}
          is3D={true} // Enable 3D view
        />
      </div>

      {/* Bottom Stats Panel */}
      <div className="bottom-panel">
        <RunStats stats={stats} />
        <button className="stop-button" onClick={onStop}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default NavigationView; 