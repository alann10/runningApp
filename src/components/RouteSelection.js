import React from 'react';
import MapComponent from './MapComponent';

function RouteSelection({ routes, onSelectRoute }) {
  return (
    <div className="route-selection">
      <h2>Select a Route</h2>
      <div className="route-grid">
        {routes.map((route, index) => (
          <div key={index} className="route-option" onClick={() => onSelectRoute(route)}>
            <h3>Route {index + 1}</h3>
            <MapComponent 
              latitude={route.start.latitude}
              longitude={route.start.longitude}
              route={route}
              style={{width: '100%', height: 200}}
            />
            <p>Distance: {route.desiredDistance} miles</p> {/* Show only the desired distance */}
            {/* Actual distance is hidden for the user */}
           {/* <p style={{ display: 'none' }}>Actual Distance: {route.distance} miles</p> {/* For debugging purposes */}
            {/*<p className="debug-info">Debug: Actual Distance: {route.distance} miles</p> {/* For debugging purposes */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteSelection;
