import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search } from 'lucide-react';

const LocationSelectorPin = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultCenter = {
    lat: 7.8731,
    lng: 80.7718
  };

  useEffect(() => {
    if (!mapRef.current || mapRef.current._leaflet_map) return;

    const leafletMap = L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], 8);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);

    const leafletMarker = L.marker([defaultCenter.lat, defaultCenter.lng], {
      draggable: true
    }).addTo(leafletMap);

    leafletMarker.on('dragend', () => {
      const position = leafletMarker.getLatLng();
      handlePinDrop(position);
    });

    setMap(leafletMap);
    setMarker(leafletMarker);

    return () => {
      if (leafletMap) {
        leafletMap.remove();
      }
    };
  }, [mapRef]);

  const handlePinDrop = (position) => {
    const location = {
      name: 'Dropped Pin',
      latitude: position.lat,
      longitude: position.lng
    };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const searchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=c90c3737e36f4659abf111cfedfcb6e3&countrycode=lk&limit=5`
      );
      const data = await response.json();

      if (data.results) {
        const formattedSuggestions = data.results.map(result => ({
          name: result.formatted,
          latitude: result.geometry.lat,
          longitude: result.geometry.lng
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Suggestion error:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedLocation(suggestion);
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);

    if (map && marker) {
      marker.setLatLng([suggestion.latitude, suggestion.longitude]);
      map.setView([suggestion.latitude, suggestion.longitude], 13);
    }

    onLocationSelect(suggestion);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-4">
      {/* Search Container - Now positioned relative to parent */}
      <div className="relative" style={{ zIndex: 1000 }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search for a location in Sri Lanka..."
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isLoading ? (
              <div className="absolute right-3 top-2.5 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Suggestions Dropdown - With higher z-index */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-1" style={{ zIndex: 1000 }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSuggestionClick(suggestion);
                }}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-sm text-gray-500">
                      {suggestion.latitude.toFixed(6)}, {suggestion.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Container - Lower z-index */}
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg border border-gray-300"
        style={{ minHeight: "400px", zIndex: 1 }}
      />

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700">Selected Location</h3>
          <p className="text-sm text-gray-600">{selectedLocation.name}</p>
          <p className="text-sm text-gray-500">
            Lat: {selectedLocation.latitude.toFixed(6)}, 
            Long: {selectedLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelectorPin;