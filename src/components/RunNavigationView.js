import React, { useState, useCallback, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import { FaArrowRight, FaArrowLeft, FaMapSigns } from 'react-icons/fa';
import { CONFIG } from '../config';
import '../styles/RunNavigationView.css';

const RunNavigationView = ({ 
  route, 
  location, 
  instructions, 
  stats, 
  onStop 
}) => {
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: location?.longitude || 0,
    latitude: location?.latitude || 0,
    zoom: 18,
    pitch: 75,
    bearing: 0,
    padding: { top: 100, bottom: 20 }
  });

  const getDirectionIcon = (instruction) => {
    if (instruction.toLowerCase().includes('left')) return <FaArrowLeft />;
    if (instruction.toLowerCase().includes('right')) return <FaArrowRight />;
    return <FaMapSigns />;
  };

  // Calculate bearing based on user movement
  const calculateBearing = useCallback((prevLocation, currentLocation) => {
    if (!prevLocation || !currentLocation) return 0;
    
    const dx = currentLocation.longitude - prevLocation.longitude;
    const dy = currentLocation.latitude - prevLocation.latitude;
    const bearing = (Math.atan2(dx, dy) * 180) / Math.PI;
    
    return bearing;
  }, []);

  // Update view state when location changes
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setViewState(prev => {
        const newBearing = calculateBearing(
          { latitude: prev.latitude, longitude: prev.longitude },
          location
        );
        
        return {
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
          bearing: newBearing,
          transitionDuration: 1000,
        };
      });
    }
  }, [location, calculateBearing]);

  const onMove = useCallback(({ viewState }) => {
    // Only update zoom and pitch from user interaction
    setViewState(prev => ({
      ...prev,
      zoom: viewState.zoom,
      pitch: viewState.pitch
    }));
  }, []);

  return (
    <div className="run-navigation-view">
      {/* Top Navigation Instructions */}
      <div className="navigation-header">
        <div className="instruction-card">
          {instructions[currentInstructionIndex] && (
            <>
              <div className="instruction-icon">
                {getDirectionIcon(instructions[currentInstructionIndex])}
              </div>
              <div className="instruction-text">
                {instructions[currentInstructionIndex]}
              </div>
            </>
          )}
        </div>
      </div>

      {/* First Person Map View */}
      <div className="navigation-map">
        <Map
          {...viewState}
          mapboxAccessToken={CONFIG.MAPBOX_ACCESS_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onMove={onMove}
          reuseMaps
          attributionControl={false}
          maxPitch={85}
          minPitch={60}
          minZoom={16}
          maxZoom={20}
          renderWorldCopies={false}
          antialias={true}
        >
          {location && (
            <>
              {/* User position marker */}
              <Marker 
                longitude={location.longitude} 
                latitude={location.latitude} 
                color="#FF0000" 
              />
              {/* Direction indicator */}
              <Source 
                id="direction-indicator" 
                type="geojson" 
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [location.longitude, location.latitude],
                      [
                        location.longitude + Math.sin(viewState.bearing * Math.PI / 180) * 0.0003,
                        location.latitude + Math.cos(viewState.bearing * Math.PI / 180) * 0.0003
                      ]
                    ]
                  }
                }}
              >
                <Layer
                  id="direction-arrow"
                  type="line"
                  paint={{
                    'line-color': '#FF0000',
                    'line-width': 3
                  }}
                />
              </Source>
            </>
          )}
          {route && (
            <Source 
              id="route" 
              type="geojson" 
              data={route}
            >
              <Layer
                id="route"
                type="line"
                source="route"
                layout={{
                  "line-join": "round",
                  "line-cap": "round"
                }}
                paint={{
                  "line-color": "#3887be",
                  "line-width": 5,
                  "line-opacity": 0.75
                }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Bottom Stats Panel */}
      <div className="navigation-stats">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-label">Distance</div>
            <div className="stat-value">
              {stats.distance?.toFixed(2)} <span className="stat-unit">mi</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Time</div>
            <div className="stat-value">
              {Math.floor(stats.time / 60)}:{(stats.time % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Pace</div>
            <div className="stat-value">
              {stats.pace ? `${Math.floor(stats.pace)}:${((stats.pace % 1) * 60).toFixed(0).padStart(2, '0')}` : '--:--'}
              <span className="stat-unit">min/mi</span>
            </div>
          </div>
        </div>
        <button className="stop-button" onClick={onStop}>
          Stop Run
        </button>
      </div>
    </div>
  );
};

export default RunNavigationView; 