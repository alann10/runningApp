import { CONFIG } from '../config';

//const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const getCurvedWaypoints = (start, midpoint, numWaypoints = 5) => {
  const waypoints = [];
  const radius = 0.5; // Radius in miles for the arc
  const angleIncrement = 180 / (numWaypoints - 1); // Angle increment for waypoints

  for (let i = 0; i < numWaypoints; i++) {
    const angle = angleIncrement * i; // Calculate angle for each waypoint
    const waypoint = getPointAtDistance(midpoint, radius * 1.60934, angle); // Convert miles to km
    waypoints.push(waypoint);
  }

  return waypoints;
};

const generateExactRoute = async (start, desiredDistance, variation = 0) => {
  const halfDistance = desiredDistance / 2; // Half of the desired distance

  const attempts = 10; // Number of attempts to generate a route
  for (let i = 0; i < attempts; i++) {
    const bearing = Math.random() * 360 + variation; // Introduce variation in bearing
    const midpointDistance = halfDistance + (Math.random() * 0.5 - 0.25); // Random variation
    const midpoint = getPointAtDistance(start, midpointDistance * 1.60934, bearing); // Convert miles to km

    // Generate curved waypoints
    const waypoints = getCurvedWaypoints(start, midpoint);

    try {
      let combinedCoordinates = []; // Initialize an array to hold all coordinates

      // Fetch the route to the first waypoint
      const routeToWaypoint1 = await fetchRoute(start, waypoints[0]);
      combinedCoordinates.push(...routeToWaypoint1.geometry.coordinates); // Add coordinates from the first route

      let previousWaypoint = waypoints[0];
      for (let j = 1; j < waypoints.length; j++) {
        const routeSegment = await fetchRoute(previousWaypoint, waypoints[j]);
        combinedCoordinates.push(...routeSegment.geometry.coordinates); // Use the coordinates from the route segment
        previousWaypoint = waypoints[j];
      }

      // Fetch the route back to the starting point
      const routeBack = await fetchRoute(previousWaypoint, start);
      combinedCoordinates.push(...routeBack.geometry.coordinates); // Add the return route coordinates

      // Create the final route object
      const totalDistance = (routeToWaypoint1.distance + routeBack.distance) * 0.000621371; // Convert to miles

      if (totalDistance >= desiredDistance && totalDistance <= desiredDistance + 0.5) {
        return {
          type: 'Feature',
          properties: {
            instructions: [
              ...routeToWaypoint1.legs[0].steps.map(step => step.maneuver.instruction),
              // Add instructions from each segment
            ]
          },
          geometry: {
            type: 'MultiLineString',
            coordinates: [combinedCoordinates] // Ensure this is in the correct format
          },
          distance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal place
          desiredDistance: desiredDistance,
          start: start,
          end: midpoint
        };
      }
    } catch (error) {
      console.error('Error generating route:', error);
    }
  }

  throw new Error('Unable to generate a valid route.'); // Throw an error if no valid route is found
};

// const getNearbyLandmarks = async (location) => {
//   const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/landmark.json?proximity=${location.longitude},${location.latitude}&access_token=${CONFIG.MAPBOX_ACCESS_TOKEN}`);
//   const data = await response.json();
//   return data.features.map(feature => ({
//     latitude: feature.geometry.coordinates[1],
//     longitude: feature.geometry.coordinates[0]
//   }));
// };

export const generateRoutes = async (start, desiredDistance) => {
  const routes = [];
  
  // Generate two distinct routes
  for (let i = 0; i < 2; i++) {
    const route = await generateExactRoute(start, desiredDistance);
    if (!route) {
      throw new Error(`Unable to generate a route matching ${desiredDistance} miles. Please try a different distance or location.`);
    }
    routes.push(route);
  }

  // Ensure routes are distinct (you can implement more sophisticated logic here)
  if (routes[0].geometry.coordinates.toString() === routes[1].geometry.coordinates.toString()) {
    throw new Error('Generated routes are not distinct. Please try again.');
  }

  return routes; // Return the valid routes in an array
};