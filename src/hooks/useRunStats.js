import { useState, useEffect } from 'react';

export const useRunStats = (isRunning, currentLocation) => {
  const [stats, setStats] = useState({
    distance: 0,
    duration: 0,
    pace: 0,
    previousLocation: null,
  });

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setStats(prevStats => {
          const newDuration = prevStats.duration + 1;
          let newDistance = prevStats.distance;
          
          if (prevStats.previousLocation && currentLocation) {
            newDistance += calculateDistance(prevStats.previousLocation, currentLocation);
          }

          const newPace = newDistance > 0 ? (newDuration / 60) / (newDistance / 1000) : 0;

          return {
            distance: newDistance,
            duration: newDuration,
            pace: newPace,
            previousLocation: currentLocation,
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, currentLocation]);

  return stats;
};

const calculateDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI/180;
  const φ2 = coord2.latitude * Math.PI/180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI/180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};
