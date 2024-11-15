import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import Map from 'react-map-gl';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';

// Note: Replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW5mb3VuaXR5cmVzcG9uc2UiLCJhIjoiY20zZzgwNml1MDFrMDJycTI4OGMzajR4eCJ9.C93aGIc5IHdwuu1lElzfwQ';

const sriLankaGeoJson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Sri Lanka"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[79.6951,5.9683],[79.8568,6.2634],[79.9987,6.5629],[80.1404,6.8624],[80.4483,7.4172],[80.7562,7.972],[81.0641,8.5269],[81.372,9.0817],[81.7953,9.3371],[81.7879,9.0534],[81.7806,8.7697],[81.7732,8.486],[81.7659,8.2023],[81.7585,7.9186],[81.7512,7.6349],[81.7438,7.3512],[81.7365,7.0675],[81.7291,6.7838],[81.7218,6.5001],[81.7144,6.2164],[81.7071,5.9327],[81.6997,5.649],[81.0778,5.9539],[80.4559,6.2588],[79.834,6.5637],[79.6951,5.9683]]]]
      }
    }
  ]
};

const disasterData = [
  {
    id: 1,
    datetime: '2023-04-15T12:00:00Z',
    province: 'Western',
    district: 'Colombo',
    dsDivision: 'Colombo',
    disasterType: 'Flood',
    dateCommenced: '2023-04-14',
    deaths: 12,
    volunteerRequired: 50,
    resourcesRequired: ['Food', 'Shelter', 'Clothing'],
    longitude: 79.8612,
    latitude: 6.9271
  },
  {
    id: 2,
    datetime: '2023-05-01T08:30:00Z',
    province: 'Southern',
    district: 'Matara',
    dsDivision: 'Dickwella',
    disasterType: 'Landslide',
    dateCommenced: '2023-04-30',
    deaths: 6,
    volunteerRequired: 30,
    resourcesRequired: ['Food', 'Medical Supplies'],
    longitude: 80.9785,
    latitude: 5.9485
  }
];

const SriLankaMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 80.7718,
    latitude: 7.8731,
    zoom: 7.5,
    bearing: 0,
    pitch: 0
  });

  const [hoveredDisaster, setHoveredDisaster] = useState(null);

  const layers = [
    new GeoJsonLayer({
      id: 'sri-lanka-layer',
      data: sriLankaGeoJson,
      getFillColor: [200, 200, 200, 40],
      getLineColor: [0, 0, 0],
      lineWidthMinPixels: 1,
      pickable: false
    }),

    new ScatterplotLayer({
      id: 'disaster-markers',
      data: disasterData,
      getPosition: d => [d.longitude, d.latitude],
      getRadius: 5000,
      getFillColor: [255, 0, 0, 180],
      radiusMinPixels: 5,
      radiusMaxPixels: 50,
      pickable: true,
      onHover: info => {
        setHoveredDisaster(info.object);
      }
    })
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      position: 'relative', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <DeckGL
        layers={layers}
        initialViewState={viewState}
        controller={true}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
        />
      </DeckGL>
      {hoveredDisaster && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          zIndex: 1
        }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '0.5rem', 
            fontSize: '1.1rem' 
          }}>
            {hoveredDisaster.disasterType}
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Location: {hoveredDisaster.district}, {hoveredDisaster.province}
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Date: {new Date(hoveredDisaster.datetime).toLocaleDateString()}
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Deaths: {hoveredDisaster.deaths}
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Volunteers needed: {hoveredDisaster.volunteerRequired}
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Resources needed:
          </p>
          <ul style={{ 
            fontSize: '0.9rem', 
            listStyle: 'disc', 
            paddingLeft: '1.5rem' 
          }}>
            {hoveredDisaster.resourcesRequired.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SriLankaMap;