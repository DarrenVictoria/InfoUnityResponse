import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Water as FloodIcon,
  Terrain as LandslideIcon,
  Bolt as LightningIcon,
  Fireplace as ForestFireIcon,
  Waves as TsunamiIcon,
  Tornado as TornadoIcon,
  Public as EarthquakeIcon,
  LocalFireDepartment as VolcanoIcon,
  FilterDrama as DroughtIcon,
  Forest as TreeFallenIcon
} from '@mui/icons-material';
// import './pulsingMarker.css';

// Disaster data
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
    latitude: 6.9271,
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
    longitude: 79.8518,
    latitude: 7.2063,
  },
];

// Map disaster types to icons
const disasterIcons = {
  Flood: <FloodIcon />,
  Landslide: <LandslideIcon />,
  Lightning: <LightningIcon />,
  'Forest Fire': <ForestFireIcon />,
  Tsunami: <TsunamiIcon />,
  Tornado: <TornadoIcon />,
  Earthquake: <EarthquakeIcon />,
  Volcano: <VolcanoIcon />,
  Drought: <DroughtIcon />,
  'Tree Fallen': <TreeFallenIcon />,
};

const SriLankaMap = () => {
  const [hoveredDisaster, setHoveredDisaster] = useState(null);

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <MapContainer center={[7.8731, 80.7718]} zoom={7.5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {disasterData.map((disaster) => (
          <CircleMarker
            key={disaster.id}
            center={[disaster.latitude, disaster.longitude]}
            radius={10}
            pathOptions={{
              fillColor: '#ff0000',
              fillOpacity: 0.7,
              color: '#000',
              weight: 1,
            }}
            className="pulsing-marker"
            eventHandlers={{
              mouseover: () => setHoveredDisaster(disaster),
              mouseout: () => setHoveredDisaster(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <div className="flex items-center gap-2">
                {disasterIcons[disaster.disasterType]} {disaster.disasterType}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {hoveredDisaster && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-[300px] z-[1000]">
          <h3 className="font-bold mb-2 text-lg">{hoveredDisaster.disasterType}</h3>
          <p className="text-sm mb-1">Location: {hoveredDisaster.district}, {hoveredDisaster.province}</p>
          <p className="text-sm mb-1">Date: {new Date(hoveredDisaster.datetime).toLocaleDateString()}</p>
          <p className="text-sm mb-1">Deaths: {hoveredDisaster.deaths}</p>
          <p className="text-sm mb-1">Volunteers needed: {hoveredDisaster.volunteerRequired}</p>
          <p className="text-sm mb-1">Resources needed:</p>
          <ul className="text-sm list-disc pl-6">
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
