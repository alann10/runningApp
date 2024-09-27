import { CONFIG } from '../config';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchRoute = async (start, end) => {
  const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${CONFIG.MAPBOX_ACCESS_TOKEN}`);
  if (response.status === 429) {
    throw new Error('Rate limit exceeded');
  }
  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }
  return data.routes[0];
};

const getPointAtDistance = (start, distanceKm, bearing) => {
  const R = 6371; // Earth's radius in km
  const d = distanceKm / R;
  const lat1 = start.latitude * Math.PI / 180;
  const lon1 = start.longitude * Math.PI / 180;
  const bearingRad = bearing * Math.PI / 180;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearingRad));
  const lon2 = lon1 + Math.atan2(Math.sin(bearingRad) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));

  return {
    latitude: lat2 * 180 / Math.PI,
    longitude: lon2 * 180 / Math.PI
  };
};

const generateExactRoute = async (start, desiredDistance) => {
  const halfDistance = desiredDistance / 2; // Half of the desired distance
  const validRoute = null;

  // Randomize the number of attempts to generate different routes
  const attempts = 5; // Number of attempts to generate a route
  for (let i = 0; i < attempts; i++) {
    // Randomize the bearing
    const bearing = Math.random() * 360; // Random bearing between 0 and 360 degrees

    try {
      // Calculate the midpoint with a slight random variation
      const midpointDistance = halfDistance + (Math.random() * 0.5 - 0.25); // Random variation of +/- 0.25 miles
      const midpoint = getPointAtDistance(start, midpointDistance * 1.60934, bearing); // Convert miles to km

      // Fetch the route to the midpoint
      const routeToMidpoint = await fetchRoute(start, midpoint);
      await delay(1000); // Wait 1 second between API calls

      // Fetch the route back to the starting point
      const routeBack = await fetchRoute(midpoint, start);

      const totalDistance = (routeToMidpoint.distance + routeBack.distance) * 0.000621371; // Convert to miles

      // Check if the total distance is greater than or equal to the desired distance and within the tolerance of 0.5 miles
      if (totalDistance >= desiredDistance && totalDistance <= desiredDistance + 0.5) { // Allowing a tolerance of 0.5 miles
        return {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiLineString',
            coordinates: [
              routeToMidpoint.geometry.coordinates,
              routeBack.geometry.coordinates.reverse()
            ]
          },
          distance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal place
          desiredDistance: desiredDistance, // Store the desired distance
          start: start
        };
      }
    } catch (error) {
      console.error('Error generating route:', error);
    }
  }

  return validRoute;
};

export const generateRoutes = async (start, desiredDistance) => {
  const route = await generateExactRoute(start, desiredDistance);
  if (!route) {
    throw new Error(`Unable to generate a route matching ${desiredDistance} miles. Please try a different distance or location.`);
  }
  return [route]; // Return the valid route in an array
};
