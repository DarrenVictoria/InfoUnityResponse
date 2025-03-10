import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital, Shield, Pill, Flame, MapPin, Navigation, ExternalLink } from 'lucide-react';

// Define safety location types with icons and colors
const safetyLocations = {
  hospital: {
    name: 'Hospitals',
    icon: Hospital,
    query: 'hospital',
    color: '#ff4757', // Red
  },
  police: {
    name: 'Police Stations',
    icon: Shield,
    query: 'police',
    color: '#1e90ff', // Blue
  },
  pharmacy: {
    name: 'Pharmacies',
    icon: Pill,
    query: 'pharmacy',
    color: '#2ed573', // Green
  },
  fire_station: {
    name: 'Fire Stations',
    icon: Flame,
    query: 'fire_station',
    color: '#ff7f50', // Orange
  },
};

// Custom icon creator function - smaller size with visible symbol
const createCustomIcon = (IconComponent, color) => {
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: ${color}; border-radius: 50%; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${getIconPath(IconComponent.name)}
        </svg>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Function to get SVG path based on icon name
const getIconPath = (iconName) => {
  switch (iconName) {
    case 'Hospital':
      return '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M21 7v13m-9-6h.01M17 16h.01"/>';
    case 'Shield':
      return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>';
    case 'Pill':
      return '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>';
    case 'Flame':
      return '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>';
    case 'MapPin':
      return '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';
    default:
      return '';
  }
};

// User location icon - smaller size
const userLocationIcon = L.divIcon({
  html: `
    <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      <div style="width: 16px; height: 16px; background-color: #4b7bec; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #4b7bec, 0 0 8px rgba(0,0,0,0.5);"></div>
    </div>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to handle map center and zoom changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const ResourceLocator = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [safetyPlaces, setSafetyPlaces] = useState([]);
  const [selectedType, setSelectedType] = useState('hospital');
  const [inputLocation, setInputLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Default to Sri Lanka center
  const [zoomLevel, setZoomLevel] = useState(7.5);
  const [searchLocationName, setSearchLocationName] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const mapRef = useRef(null);

  // Location modal instead of alert
  const LocationModal = () => {
    if (!showLocationModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Location Access</h3>
          <p className="mb-6">Would you like to use your current location or enter a location manually?</p>
          <div className="flex gap-4 justify-end">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => setShowLocationModal(false)}
            >
              Enter Manually
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => {
                getCurrentLocation();
                setShowLocationModal(false);
              }}
            >
              Use My Location
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setMapCenter([latitude, longitude]);
          setZoomLevel(14);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Unable to fetch your location. Please enter a location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please enter a location manually.');
    }
  };

  // Reverse geocode to get location name
  const reverseGeocode = (lat, lon) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.display_name) {
          setSearchLocationName(data.display_name);
        }
      })
      .catch((error) => console.error('Error reverse geocoding:', error));
  };

  // Handle manual location input
  const handleLocationInput = () => {
    if (!inputLocation) return;

    // Use OpenStreetMap's Nominatim API to geocode the input location
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputLocation)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const newLat = parseFloat(lat);
          const newLon = parseFloat(lon);
          
          setMapCenter([newLat, newLon]);
          setZoomLevel(14);
          setUserLocation({ latitude: newLat, longitude: newLon });
          setSearchLocationName(data[0].display_name);
        } else {
          alert('Location not found. Please try again.');
        }
      })
      .catch((error) => console.error('Error fetching location:', error));
  };

  // Handle key press for location input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLocationInput();
    }
  };

  // Get directions using Google Maps or OpenStreetMap
  const getDirections = (destinationLat, destinationLon, service) => {
    if (!userLocation) return;
    
    const { latitude, longitude } = userLocation;
    
    if (service === 'google') {
      // Google Maps directions with start and end points
      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destinationLat},${destinationLon}`;
      window.open(url, '_blank');
    } else if (service === 'osm') {
      // OpenStreetMap directions with start and end points
      const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${latitude},${longitude};${destinationLat},${destinationLon}`;
      window.open(url, '_blank');
    }
  };

  // Fetch safety locations using Overpass API
  useEffect(() => {
    if (!userLocation) return;

    const { latitude, longitude } = userLocation;
    const query = `[out:json];
      node["amenity"="${safetyLocations[selectedType].query}"](around:5000,${latitude},${longitude});
      out;`;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        const places = data.elements.map((element) => ({
          id: element.id,
          name: element.tags.name || `Unnamed ${safetyLocations[selectedType].name.slice(0, -1)}`,
          coordinates: [element.lat, element.lon],
          address: element.tags['addr:street'] || '',
          phone: element.tags.phone || '',
        }));
        setSafetyPlaces(places);
      })
      .catch((error) => console.error('Error fetching safety locations:', error));
  }, [userLocation, selectedType]);

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      {/* Location Modal */}
      <LocationModal />

      {/* Location Input */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter a location (e.g., Colombo)"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={handleLocationInput}
              className="bg-blue-500 text-white px-4 py-2 rounded flex-grow hover:bg-blue-600"
            >
              Search
            </button>
            <button
              onClick={getCurrentLocation}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Location Display */}
      {searchLocationName && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate">{searchLocationName}</span>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer 
        center={mapCenter} 
        zoom={zoomLevel} 
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Map Updater component to handle zoom and center changes */}
        <MapUpdater center={mapCenter} zoom={zoomLevel} />

        {/* Search Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <p className="text-sm text-gray-600">{searchLocationName}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Safety Locations */}
        {safetyPlaces.map((place) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={createCustomIcon(
              safetyLocations[selectedType].icon,
              safetyLocations[selectedType].color
            )}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                {place.address && <p className="text-sm mb-1"><strong>Address:</strong> {place.address}</p>}
                {place.phone && <p className="text-sm mb-1"><strong>Phone:</strong> {place.phone}</p>}
                
                {/* Directions buttons */}
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-sm font-medium">Get Directions:</p>
                  <div className="flex gap-2">
                    <button 
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => getDirections(place.coordinates[0], place.coordinates[1], 'google')}
                    >
                      <ExternalLink size={14} /> Google Maps
                    </button>
                    <button 
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => getDirections(place.coordinates[0], place.coordinates[1], 'osm')}
                    >
                      <Navigation size={14} /> OpenStreetMap
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Safety Location Selectors */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold mb-2 text-sm text-center">Safety Locations</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(safetyLocations).map((type) => {
            const { name, color } = safetyLocations[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="flex items-center gap-1 px-3 py-1 rounded transition-colors"
                style={{
                  backgroundColor: selectedType === type ? color : '#f1f1f1',
                  color: selectedType === type ? 'white' : '#333',
                }}
              >
                <span className="text-sm">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold mb-2 text-sm">Legend</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4b7bec', borderRadius: '50%' }}></div>
            <span className="text-xs">Your Location</span>
          </div>
          {Object.keys(safetyLocations).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: safetyLocations[type].color, 
                  borderRadius: '50%' 
                }}
              ></div>
              <span className="text-xs">{safetyLocations[type].name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceLocator;