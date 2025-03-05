// import { CONFIG } from '../config'; // Import the CONFIG object

export const getDirections = async (route) => {
  try {
    console.log('Route received in getDirections:', route);

    // If route already has non-empty instructions, use them
    if (route.properties?.instructions?.length > 0) {
      console.log('Using existing route instructions:', route.properties.instructions);
      return {
        routes: [{
          legs: [{
            steps: route.properties.instructions.map(instruction => ({
              maneuver: { instruction }
            }))
          }]
        }]
      };
    }

    // If no instructions or empty, generate them from coordinates
    const coordinates = route.geometry.type === 'MultiLineString' 
      ? route.geometry.coordinates[0]  // Get the first line string from MultiLineString
      : route.geometry.coordinates;

    if (!coordinates || coordinates.length < 2) {
      throw new Error('Invalid route coordinates');
    }

    // Generate basic instructions from coordinates
    const instructions = generateBasicInstructions(coordinates);
    
    return {
      routes: [{
        legs: [{
          steps: instructions.map(instruction => ({
            maneuver: { instruction }
          }))
        }]
      }]
    };

  } catch (error) {
    console.error('Detailed error in getDirections:', error);
    throw error;
  }
};

const generateBasicInstructions = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return [];

  const instructions = [];
  
  // Add starting instruction
  instructions.push("Start your run");

  // Generate turn instructions based on coordinate changes
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const next = coordinates[i + 1];

    const angle = calculateTurnAngle(prev, curr, next);
    if (Math.abs(angle) > 30) {
      const direction = angle > 0 ? "right" : "left";
      instructions.push(`Turn ${direction} at the next intersection`);
    }
  }

  // Add final instruction
  instructions.push("You have reached your destination");

  return instructions;
};

const calculateTurnAngle = (point1, point2, point3) => {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  const [x3, y3] = point3;

  // Calculate vectors
  const vector1 = [x2 - x1, y2 - y1];
  const vector2 = [x3 - x2, y3 - y2];

  // Calculate angle between vectors
  const angle = Math.atan2(
    vector1[0] * vector2[1] - vector1[1] * vector2[0],
    vector1[0] * vector2[0] + vector1[1] * vector2[1]
  );

  return angle * (180 / Math.PI);
};
