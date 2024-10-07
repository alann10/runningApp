import React, { useState } from 'react'; // Removed useRef
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import Controls from '../components/Controls';
import RunStats from '../components/RunStats';
import RouteSelection from '../components/RouteSelection';
import CompletionScreen from '../components/CompletionScreen'; // New import
import { useLocation } from '../hooks/useLocation';
import { useRunStats } from '../hooks/useRunStats';
import { generateRoutes } from '../services/RouteService';
import { saveRun } from '../services/RunService';
import { getDirections } from '../services/NavigationService'; // Import your service to fetch directions
import '../styles/RunPage.css';

const RunPage = () => {
  const location = useLocation();
  const [desiredDistance, setDesiredDistance] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [isCompleted, setIsCompleted] = useState(false); // New state for completion screen
  const [instructions, setInstructions] = useState([]); // State for instructions
  const stats = useRunStats(isRunning, location);
  // const [stats, setStats] = useRunStats(isRunning, location);

  
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
    console.log('Selected Route:', route); // Log the selected route
    setSelectedRoute(route);
    setInstructions(route.properties.instructions || []); // Ensure instructions are set correctly
  };

  const handleStartRun = async () => {
    if (selectedRoute) {
      setIsRunning(true);
      try {
        const directions = await getDirections(selectedRoute); // Fetch directions
        setInstructions(directions.routes[0].legs[0].steps.map(step => step.maneuver.instruction)); // Store instructions
      } catch (error) {
        console.error('Error fetching directions:', error);
        setError('Failed to fetch directions.');
      }
    } else {
      setError('Please select a route before starting the run.');
    }
  };

  const handleStopRun = async () => {
    setIsRunning(false);
    if (stats.distance >= selectedRoute.distance) { // Check for completion
      setIsCompleted(true);
    } else {
      try {
        await saveRun({ ...stats, route: selectedRoute });
        setError(null);
      } catch (err) {
        setError('Failed to save run data. Please try again.');
      }
    }
  };

  const handleBackToSelection = () => {
    setSelectedRoute(null); // Reset selected route
    setInstructions([]); // Clear instructions
  };

  if (isCompleted) {
    return <CompletionScreen distance={selectedRoute.distance} />; // Show completion screen
  }

  return (
    <div className="run-page">
      <h1>Run Page</h1>
      <Link to="/">Back to Home</Link>
      {!isRunning && !selectedRoute && (
        <div>
          <input 
            type="number" 
            value={desiredDistance} 
            onChange={(e) => setDesiredDistance(e.target.value)}
            placeholder="Enter desired distance in miles"
          />
          <button onClick={handleGenerateRoutes}>Generate Routes</button>
        </div>
      )}
      {routes.length > 0 && !selectedRoute && (
        <RouteSelection routes={routes} onSelectRoute={handleSelectRoute} />
      )}
      {selectedRoute && (
        <>
          <button onClick={handleBackToSelection}>Back to Route Selection</button> {/* Back button */}
          <div className='instructions'>
            <h3>Instructions</h3>
            <ul>
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
          <MapComponent 
            latitude={location?.latitude} 
            longitude={location?.longitude}
            route={selectedRoute}
          />
          <Controls 
            isRunning={isRunning}
            onStart={handleStartRun}
            onStop={handleStopRun}
          />
          <RunStats stats={stats} />
          {isRunning && instructions.length >= 0 && ( // Display instructions if running
            <div className="instructions">
              <h3>Instructions:</h3>
              <ul>
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
      {debugInfo && <p className="debug-info">{debugInfo}</p>}
    </div>
  );
}

export default RunPage;