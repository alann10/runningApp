import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../services/LocationService';

export const useLocation = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const trackLocation = async () => {
      try {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    trackLocation();
    const intervalId = setInterval(trackLocation, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return location;
};
