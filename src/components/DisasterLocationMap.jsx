// DisasterLocationMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { AlertTriangle } from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const DisasterLocationMap = ({ 
  latitude, 
  longitude, 
  disasterType, 
  location, 
  riskLevel 
}) => {
  const position = [latitude, longitude];

  // Custom styles for the map container
  const mapStyle = {
    height: '400px',
    width: '100%',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  };

  if (!latitude || !longitude) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Disaster Location</h2>
        <div className="bg-white rounded-lg shadow p-4 h-[400px] flex items-center justify-center">
          <p className="text-gray-500">Location coordinates not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* <h2 className="text-xl font-bold mb-4">Disaster Location</h2> */}
      <div className="bg-white rounded-lg shadow p-4">
        <MapContainer 
          center={position} 
          zoom={13} 
          style={mapStyle}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={DefaultIcon}>
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{disasterType}</span>
                </div>
                <div className="text-sm">
                  <p>Location: {location}</p>
                  <p className="mt-1">Risk Level: 
                    <span className={`ml-1 ${
                      riskLevel === 'High' ? 'text-red-500' :
                      riskLevel === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {riskLevel}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );

  
};



export default DisasterLocationMap;