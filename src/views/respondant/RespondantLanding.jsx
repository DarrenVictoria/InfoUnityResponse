import React, { useState, useEffect } from 'react';
import { Search, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import backgroundImage from '../../assets/hero-background.jpg';
import NavigationBar from '../../utils/Navbar';

const RespondantLanding = () => {
  return (
    <div>
      <NavigationBar />
      <Hero />
    </div>
  );
};

export default RespondantLanding;

const StatusIndicator = ({ label, status, type }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm inline-flex items-center justify-center min-w-[120px]";

  const getStatusStyles = () => {
    if (type === 'warning') {
      switch (status.toLowerCase()) {
        case 'high':
          return 'bg-red-600 text-white';
        case 'medium':
          return 'bg-yellow-500 text-white';
        case 'low':
          return 'bg-green-600 text-white';
        default:
          return 'bg-gray-600 text-white';
      }
    }
    if (type === 'safety') {
      return status ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
    } else {
      return !status ? 'bg-green-600 text-white' : 'bg-red-600 text-white'; // Inverted for volunteer status
    }
  };

  const getStatusText = () => {
    if (type === 'warning') {
      return `${status} Risk`;
    }
    if (type === 'safety') {
      return status ? 'Safe' : 'Not Safe';
    }
    return status ? 'Required' : 'Not Required';
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-sm text-gray-200">{label}</span>
      <div className={`${baseStyles} ${getStatusStyles()}`}>
        {type === 'warning' && <AlertTriangle className="w-4 h-4 mr-2" />}
        {getStatusText()}
      </div>
    </div>
  );
};

const StatusIndicators = ({ safetyStatus = true, volunteerNeed = false, warningStatus = 'Low' }) => {
  return (
    <div className="flex items-center gap-6 p-4 flex-wrap justify-center">
      <StatusIndicator label="Warning Level" status={warningStatus} type="warning" />
      <StatusIndicator label="Safety Status" status={safetyStatus} type="safety" />
      <StatusIndicator label="Volunteer Need" status={volunteerNeed} type="volunteer" />
    </div>
  );
};

const divisionalSecretariats = [
  { id: 1, DivisionalSecretariats: "Negombo", district: "Gampaha", coordinates: { lat: 7.2083, lon: 79.8358 } },
  { id: 2, DivisionalSecretariats: "Colombo", district: "Colombo", coordinates: { lat: 6.9271, lon: 79.8612 } },
  { id: 3, DivisionalSecretariats: "Galle", district: "Galle", coordinates: { lat: 6.0535, lon: 80.2210 } }
];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchLocationStatus = async (divisionalSecretariat) => {
    try {
      const docRef = doc(db, "Location_Status", "divisionalSecretariats");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const trimmedName = divisionalSecretariat.trim(); // Trim any spaces
        
        if (data[trimmedName]) {
          const statusData = data[trimmedName];
          return {
            safetyStatus: statusData.Safety || false,
            volunteerStatus: statusData["Volunteer Need"] || false,
            warningStatus: statusData.WarningStatus || 'Low'
          };
        } else {
          console.log(`No data found for ${divisionalSecretariat}`);
          return {
            safetyStatus: true,
            volunteerStatus: false,
            warningStatus: 'Low'
          };
        }
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error('Error fetching location status:', error);
      return null;
    }
  };
  
  

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Weather data fetch failed');
      const data = await response.json();
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = divisionalSecretariats.filter(ds =>
        ds.DivisionalSecretariats.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleLocationSelect = async (location) => {
    setSearchQuery(location.DivisionalSecretariats);
    setShowSuggestions(false);
    setLoading(true);
    setSelectedLocation(location);

    try {
      const [weather, status] = await Promise.all([
        fetchWeatherData(location.coordinates.lat, location.coordinates.lon),
        fetchLocationStatus(location.DivisionalSecretariats)
      ]);

      setWeatherData(weather);
      setLocationStatus(status);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    const location = divisionalSecretariats.find(ds =>
      ds.DivisionalSecretariats.toLowerCase() === searchQuery.toLowerCase()
    );
    if (location) {
      handleLocationSelect(location);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" style={{ maxWidth: '100%' }} />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>
      <div className="relative z-10 px-4 py-32 mx-auto max-w-screen-xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">INFO UNITY RESPONSE</h1>
        <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl">Uniting Information, Empowering Response</p>
        
        <div className="w-full max-w-2xl mx-auto ">
          <div className="relative ">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search divisional secretariats..."
              className="w-full px-4 py-3 pr-10 text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <button onClick={handleSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
              <Search size={20} />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full bg-gray-700 rounded-md shadow-lg z-20 mt-1">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="px-4 py-2 text-left text-white cursor-pointer hover:bg-gray-600"
                    onClick={() => handleLocationSelect(s)}
                  >
                    <MapPin size={16} className="inline-block mr-2 text-gray-400" />
                    {s.DivisionalSecretariats} (District -{s.district})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className="w-full max-w-lg mx-auto mt-10">
            <Card className="bg-gray-800 border border-gray-700 text-white">
              <CardHeader className="border-b border-gray-700">
                <div className="text-lg font-medium">
                  Weather and Response Status in {selectedLocation.DivisionalSecretariats}, {selectedLocation.district}
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <>
                    {weatherData && (
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xl font-semibold">{weatherData.temperature}°C</div>
                          <div className="text-sm text-gray-400 capitalize">{weatherData.description}</div>
                        </div>
                        <img
                          src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
                          alt="Weather Icon"
                          className="w-12 h-12"
                        />
                      </div>
                    )}
                    <StatusIndicators
                      safetyStatus={locationStatus?.safetyStatus}
                      volunteerNeed={locationStatus?.volunteerStatus}
                      warningStatus={locationStatus?.warningStatus}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
