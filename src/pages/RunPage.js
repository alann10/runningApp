import React, { useState } from 'react'; // Removed useRef
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import Controls from '../components/Controls';
import RunStats from '../components/RunStats';
import RouteSelection from '../components/RouteSelection';
import { useLocation } from '../hooks/useLocation';
import { useRunStats } from '../hooks/useRunStats';
import { generateRoutes } from '../services/RouteService';
import { saveRun } from '../services/RunService';
import '../styles/RunPage.css';

function RunPage() {
  const location = useLocation();
  const [desiredDistance, setDesiredDistance] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const stats = useRunStats(isRunning, location);

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
    setSelectedRoute(route);
  };

  const handleStartRun = () => {
    if (selectedRoute) {
      setIsRunning(true);
    } else {
      setError('Please select a route before starting the run.');
    }
  };

  const handleStopRun = async () => {
    setIsRunning(false);
    try {
      await saveRun({ ...stats, route: selectedRoute });
      setError(null);
    } catch (err) {
      setError('Failed to save run data. Please try again.');
    }
  };

  return (
    <div className="run-page">
      <h1>Run Page</h1>
      <Link to="/">Back to Home</Link>
      {!isRunning && (
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
        </>
      )}
      {error && <p className="error">{error}</p>}
      {debugInfo && <p className="debug-info">{debugInfo}</p>}
    </div>
  );
}

export default RunPage;
