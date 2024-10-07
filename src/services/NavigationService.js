// import { CONFIG } from '../config'; // Import the CONFIG object

// export const getDirections = async (route) => {
//   const start = [route.start.longitude, route.start.latitude]; // Ensure start is in the correct format
//   const end = [route.end.longitude, route.end.latitude]; // Ensure end is in the correct format
//   const profile = 'mapbox/walking'; // Change to your desired profile
//   const accessToken = CONFIG.MAPBOX_ACCESS_TOKEN; // Use the access token from config

//   const response = await fetch(`https://api.mapbox.com/directions/v5/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${accessToken}`);
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch directions');
//   }
  
//   return response.json();
// };
