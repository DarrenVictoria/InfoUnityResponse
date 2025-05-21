import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Create custom icons
const missingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const foundIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const MissingPersonsMap = ({ filteredPersons }) => {
  const [center, setCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [zoom, setZoom] = useState(7.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filteredPersons.length > 0) {
      // Calculate average position for center
      const validLocations = filteredPersons.filter(p => p.location && p.location.latitude && p.location.longitude);
      if (validLocations.length > 0) {
        const avgLat = validLocations.reduce((sum, p) => sum + p.location.latitude, 0) / validLocations.length;
        const avgLng = validLocations.reduce((sum, p) => sum + p.location.longitude, 0) / validLocations.length;
        setCenter([avgLat, avgLng]);
        setZoom(10);
      }
      setLoading(false);
    }
  }, [filteredPersons]);

  if (loading && filteredPersons.length === 0) {
    return <div className="flex items-center justify-center h-[400px] bg-gray-100">
      <div className="text-lg">Loading missing persons data...</div>
    </div>;
  }

  return (
    <div className="relative w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {filteredPersons.map((person) => {
          if (person.location && person.location.latitude && person.location.longitude) {
            return (
              <Marker
                key={person.id}
                position={[person.location.latitude, person.location.longitude]}
                icon={person.status === 'found' ? foundIcon : missingIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg">{person.missingPersonName}</h3>
                    <p className="text-sm">Status: 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        person.status === 'found' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {person.status || 'missing'}
                      </span>
                    </p>
                    {person.age && <p className="text-sm">Age: {person.age}</p>}
                    {person.lastSeenDate && <p className="text-sm">Last seen: {new Date(person.lastSeenDate).toLocaleDateString()}</p>}
                    {person.description && <p className="text-sm mt-2">{person.description}</p>}
                    {person.photoURL && (
                      <div className="mt-2">
                        <img 
                          src={person.photoURL} 
                          alt={person.missingPersonName} 
                          className="w-full h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold mb-2 text-sm">Map Legend</h3>
        <div className="flex items-center gap-2 mb-2">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" 
            alt="Missing icon" 
            className="w-4 h-4"
          />
          <span className="text-sm">Missing Persons</span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" 
            alt="Found icon" 
            className="w-4 h-4"
          />
          <span className="text-sm">Found Persons</span>
        </div>
      </div>
    </div>
  );
};

export default MissingPersonsMap;