import React, { useState, useEffect } from 'react';
import NavigationBar from '../../utils/Navbar'
import { Search, MapPin } from 'lucide-react';
import backgroundImage from '../../assets/hero-background.png'; // Make sure to put your image in the assets folder


const RespondantLanding = () => {
  return (
    <div>
        <NavigationBar/>
        <Hero/>
    </div>
  )
}

export default RespondantLanding

// Sample divisional secretariats data - replace with your full list
const divisionalSecretariats = [
    { id: 1, name: "Negombo", district: "Gampaha", coordinates: { lat: 7.2083, lon: 79.8358 } },
    { id: 2, name: "Colombo", district: "Colombo", coordinates: { lat: 6.9271, lon: 79.8612 } },
    { id: 3, name: "Galle", district: "Galle", coordinates: { lat: 6.0535, lon: 80.2210 } },
    // Add more secretariats
  ];


  const Hero = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [safetyStatus, setSafetyStatus] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
  
    const WEATHER_API_KEY = 'YOUR_API_KEY_HERE';
  
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
  
    const checkSafetyStatus = async (location) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: 'Safe', level: 'green' });
        }, 500);
      });
    };
  
    useEffect(() => {
      if (searchQuery.length > 2) {
        const filtered = divisionalSecretariats.filter(ds =>
          ds.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, [searchQuery]);
  
    const handleLocationSelect = async (location) => {
      setSearchQuery(location.name);
      setShowSuggestions(false);
      setLoading(true);
  
      try {
        const [safety, weather] = await Promise.all([
          checkSafetyStatus(location.name),
          fetchWeatherData(location.coordinates.lat, location.coordinates.lon)
        ]);
  
        setSafetyStatus(safety);
        setWeatherData(weather);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  
      setLoading(false);
    };
  
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <img
          src={backgroundImage}
          alt="Disaster Response Background"
          className="absolute w-full h-full object-cover object-center"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        
        {/* Content */}
        <div className="relative z-10 px-4 py-16 mx-auto max-w-screen-xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl animate-fade-in">
            INFO UNITY RESPONSE
          </h1>
          
          <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl animate-fade-in-up">
            Uniting Information, Empowering Response
          </p>
  
          {/* Search form */}
          <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full p-4 pl-10 text-sm border rounded-lg bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white backdrop-blur-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Search Divisional Secretariat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute w-full mt-2 border border-gray-700 backdrop-blur-md bg-white/90">
                  <CardBody className="p-0">
                    {suggestions.map((ds) => (
                      <button
                        key={ds.id}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
                        onClick={() => handleLocationSelect(ds)}
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{ds.name} - {ds.district} District</span>
                      </button>
                    ))}
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
  
          {/* Status and Weather display */}
          {(safetyStatus || weatherData) && (
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              {safetyStatus && (
                <Card className="max-w-xs bg-white/90 backdrop-blur-md border border-gray-200">
                  <CardHeader className="text-lg font-semibold">Safety Status</CardHeader>
                  <CardBody>
                    <span className={`px-3 py-1 rounded-full ${
                      safetyStatus.status === 'Safe' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                      {safetyStatus.status}
                    </span>
                  </CardBody>
                </Card>
              )}
              
              {weatherData && (
                <Card className="max-w-xs bg-white/90 backdrop-blur-md border border-gray-200">
                  <CardHeader className="text-lg font-semibold">Weather Information</CardHeader>
                  <CardBody>
                    <div className="flex flex-col items-center">
                      <img 
                        src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                        alt="Weather icon"
                        className="w-16 h-16"
                      />
                      <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                      <p className="capitalize">{weatherData.description}</p>
                      <div className="mt-2 text-sm">
                        <p>Humidity: {weatherData.humidity}%</p>
                        <p>Wind: {weatherData.windSpeed} m/s</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
