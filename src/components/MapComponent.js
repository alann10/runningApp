import React, { useCallback, useEffect, useRef } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CONFIG } from '../config';

function MapComponent({ latitude, longitude, route, style = {width: '100%', height: 400} }) {
  const mapRef = useRef(null);

  // Handle WebGL context creation and setup
  const onLoad = useCallback(({ target }) => {
    const map = target;
    mapRef.current = map;

    const canvas = map.getCanvas();
    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: false, // Disable alpha to prevent blending issues
      stencil: false, // Disable stencil buffer if not needed
      depth: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: true
    });

    if (gl) {
      // Optimize WebGL settings
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      
      // Enable extensions that might help with performance
      gl.getExtension('OES_element_index_uint');
      gl.getExtension('OES_standard_derivatives');
    }
  }, []);

  // Handle WebGL context loss and restoration
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (!canvas) return;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.log('WebGL context lost. Attempting to restore...');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      if (mapRef.current) {
        mapRef.current.triggerRepaint();
      }
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  // Configure Mapbox GL JS for better performance
  useEffect(() => {
    // Disable image flipping which can cause warnings
    mapboxgl.prewarm();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={CONFIG.MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: 12
      }}
      style={style}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onLoad={onLoad}
      preserveDrawingBuffer={true}
      antialias={true}
      renderWorldCopies={false}
      maxZoom={20}
      minZoom={2}
      optimizeForTerrain={true}
      cooperativeGestures={true}
    >
      <Marker longitude={longitude} latitude={latitude} color="red" />
      {route && (
        <Source 
          id="route" 
          type="geojson" 
          data={route}
          generateId={true}
          maxzoom={22}
          tolerance={0.375}
        >
          <Layer
            id="route"
            type="line"
            source="route"
            layout={{
              "line-join": "round",
              "line-cap": "round",
              "visibility": "visible"
            }}
            paint={{
              "line-color": "#888",
              "line-width": 4,
              "line-opacity": 0.8
            }}
            beforeId="waterway-label"
            minzoom={2}
            maxzoom={22}
          />
        </Source>
      )}
    </Map>
  );
}

export default MapComponent;
