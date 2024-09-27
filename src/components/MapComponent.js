import React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CONFIG } from '../config';

function MapComponent({ latitude, longitude, route, style = {width: '100%', height: 400} }) {
  return (
    <Map
      mapboxAccessToken={CONFIG.MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: 12
      }}
      style={style}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      <Marker longitude={longitude} latitude={latitude} color="red" />
      {route && (
        <Source id="route" type="geojson" data={route}>
          <Layer
            id="route"
            type="line"
            source="route"
            layout={{
              "line-join": "round",
              "line-cap": "round"
            }}
            paint={{
              "line-color": "#888",
              "line-width": 4
            }}
          />
        </Source>
      )}
    </Map>
  );
}

export default MapComponent;
