import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';

const LocationSelector = ({ onLocationChange }) => {
  const [position, setPosition] = useState([6.9271, 79.8612]); // Default to Colombo, Sri Lanka
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (selectedLocation) {
      setPosition([selectedLocation.lat, selectedLocation.lon]);
      onLocationChange(selectedLocation.display_name, selectedLocation);
    }
  }, [selectedLocation, onLocationChange]);

  const handleSearch = async (inputValue) => {
    if (inputValue) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}`);
      const data = await response.json();
      setSearchResults(data.map(item => ({
        value: item,
        label: item.display_name
      })));
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        onLocationChange('Current Location', {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select
          className="flex-1"
          options={searchResults}
          onInputChange={handleSearch}
          onChange={setSelectedLocation}
          placeholder="Search for a location..."
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleUseCurrentLocation}
        >
          Use Current Location
        </button>
      </div>

      <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const newPos = e.target.getLatLng();
              setPosition([newPos.lat, newPos.lng]);
              onLocationChange('Dropped Pin', {
                lat: newPos.lat,
                lon: newPos.lng
              });
            }
          }}
        >
          <Popup>
            Selected Location <br />
            Lat: {position[0]}, Lon: {position[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationSelector;