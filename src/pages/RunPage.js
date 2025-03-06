import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import Controls from '../components/Controls';
import RunStats from '../components/RunStats';
import RouteSelection from '../components/RouteSelection';
import CompletionScreen from '../components/CompletionScreen';
import { useLocation } from '../hooks/useLocation';
import { useRunStats } from '../hooks/useRunStats';
import { generateRoutes } from '../services/RouteService';
import { saveRun } from '../services/RunService';
import { getDirections } from '../services/NavigationService';
import RunNavigationView from '../components/RunNavigationView';
import '../styles/RunPage.css';
import { useFirebase } from '../contexts/FirebaseContext';
import { saveRunToFirebase } from '../services/FirebaseService';

const RunPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [desiredDistance, setDesiredDistance] = useState(searchParams.get('distance') || '');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const stats = useRunStats(isRunning, location);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const { auth } = useFirebase();

  useEffect(() => {
    const generateInitialRoutes = async () => {
      if (location && desiredDistance && routes.length === 0) {
        await handleGenerateRoutes();
      }
    };
    
    generateInitialRoutes();
  }, [location, desiredDistance]);

  const handleGenerateRoutes = async () => {
    if (location && desiredDistance) {
      try {
        setError(null);
        setDebugInfo('Generating routes... This may take a few minutes.');
        setRoutes([]);
        const generatedRoutes = await generateRoutes(location, parseFloat(desiredDistance));
        setRoutes(generatedRoutes);
        setDebugInfo(`Generated ${generatedRoutes.length} route(s) matching the desired distance.`);
      } catch (err) {
        setError(err.message || 'Failed to generate routes. Please try again.');
        console.error('Route generation error:', err);
      }
    }
  };

  const handleSelectRoute = (route) => {
    console.log('Selected Route:', route);
    setSelectedRoute(route);
    setInstructions(route.properties.instructions || []);
  };

  const handleStartRun = async () => {
    if (selectedRoute) {
      setIsLoadingDirections(true);
      try {
        console.log('Starting run with route:', selectedRoute);

        const directions = await getDirections(selectedRoute);
        console.log('Received directions:', directions);

        if (directions && directions.routes && directions.routes[0] && directions.routes[0].legs) {
          const steps = directions.routes[0].legs[0].steps;
          console.log('Route steps:', steps);

          const formattedInstructions = steps.map(step => {
            const instruction = step.maneuver.instruction
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ');
            return instruction;
          });
          
          console.log('Formatted instructions:', formattedInstructions);
          setInstructions(formattedInstructions);
        } else {
          console.error('Invalid directions format:', directions);
          setError('No route directions available. Invalid response format.');
        }
        
        setIsRunning(true);
        setIsLoadingDirections(false);
      } catch (error) {
        console.error('Detailed error in handleStartRun:', error);
        setError(`Failed to fetch directions: ${error.message}`);
        setIsLoadingDirections(false);
      }
    } else {
      setError('Please select a route before starting the run.');
    }
  };

  const handleStopRun = async () => {
    setIsRunning(false);
    if (stats.distance >= selectedRoute.distance) {
      setIsCompleted(true);
    }
    
    try {
      await saveRunToFirebase({
        userId: auth.currentUser?.uid,
        route: selectedRoute,
        stats: stats,
        completedAt: new Date().toISOString()
      });
      setError(null);
    } catch (err) {
      setError('Failed to save run data. Please try again.');
    }
  };

  const handleBackToSelection = () => {
    setSelectedRoute(null);
    setInstructions([]);
  };

  if (isCompleted) {
    return <CompletionScreen distance={selectedRoute.distance} />;
  }

  if (isRunning && selectedRoute) {
    return (
      <RunNavigationView
        route={selectedRoute}
        location={location}
        instructions={instructions}
        stats={stats}
        onStop={handleStopRun}
      />
    );
  }

  return (
    <div className="run-page">
      <header className="header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Your Run</h1>
        <div style={{ width: '50px' }}></div>
      </header>

      {debugInfo && (
        <div className="debug-message">
          {debugInfo}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {routes.length > 0 && !selectedRoute && (
        <div className="route-selection-container">
          <RouteSelection routes={routes} onSelectRoute={handleSelectRoute} />
        </div>
      )}

      {selectedRoute && (
        <>
          <button className="back-to-selection" onClick={handleBackToSelection}>
            Back to Route Selection
          </button>

          <div className="map-container">
            <MapComponent 
              latitude={location?.latitude} 
              longitude={location?.longitude}
              route={selectedRoute}
            />
          </div>

          <Controls 
            isRunning={isRunning}
            onStart={handleStartRun}
            onStop={handleStopRun}
          />

          <RunStats stats={stats} />

          {instructions.length > 0 && (
            <div className="instructions-panel">
              <h3>Route Instructions</h3>
              <ul className="instructions-list">
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RunPage;