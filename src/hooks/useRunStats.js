import { useState, useEffect } from 'react';

export const useRunStats = (isRunning, location) => {
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0); // Track accumulated time
  const [pauseTime, setPauseTime] = useState(null); // Track when we pause
  const [stats, setStats] = useState({
    distance: 0,
    time: 0,
    pace: 0,
    lastLocation: null,
  });

  // Handle run start/stop
  useEffect(() => {
    if (isRunning) {
      // If we're resuming from a pause
      if (pauseTime) {
        // Adjust start time to account for the pause duration
        const pauseDuration = Date.now() - pauseTime;
        setStartTime(prev => prev + pauseDuration);
        setPauseTime(null);
      } else if (!startTime) {
        // Initial start
        setStartTime(Date.now() - (totalTime * 1000)); // Account for previous accumulated time
      }
    } else if (startTime) {
      // Stopping - store the pause time
      setPauseTime(Date.now());
      setTotalTime(stats.time); // Store the current total time
    }
  }, [isRunning]);

  // Update time and stats while running
  useEffect(() => {
    let intervalId;

    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        
        setStats(prevStats => {
          const newStats = {
            ...prevStats,
            time: elapsedSeconds
          };
          
          // Only calculate pace if we have a non-zero distance
          if (newStats.distance > 0.001) { // Using small threshold
            newStats.pace = newStats.time / 60 / newStats.distance;
          } else {
            newStats.pace = 0; // Set to 0 when no distance
          }
          
          return newStats;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  // Update distance when location changes
  useEffect(() => {
    if (isRunning && location && stats.lastLocation) {
      const newDistance = stats.distance + calculateDistance(stats.lastLocation, location);
      
      setStats(prevStats => ({
        ...prevStats,
        distance: newDistance,
        lastLocation: location,
        pace: newDistance > 0.001 ? (prevStats.time / 60) / newDistance : 0
      }));
    } else if (isRunning && location) {
      setStats(prevStats => ({
        ...prevStats,
        lastLocation: location
      }));
    }
  }, [location, isRunning]);

  return stats;
};

// Helper function to calculate distance between two points
function calculateDistance(loc1, loc2) {
  if (!loc1 || !loc2) return 0;
  
  const R = 3959; // Earth's radius in miles
  const lat1 = loc1.latitude * Math.PI / 180;
  const lat2 = loc2.latitude * Math.PI / 180;
  const deltaLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const deltaLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}
