import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
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

const disasterIcons = {
  Flood: FloodIcon,
  Landslide: LandslideIcon,
  Lightning: LightningIcon,
  'Forest Fire': ForestFireIcon,
  Tsunami: TsunamiIcon,
  Tornado: TornadoIcon,
  Earthquake: EarthquakeIcon,
  Volcano: VolcanoIcon,
  Drought: DroughtIcon,
  'Tree Fallen': TreeFallenIcon,
};

const PulsatingCircleMarker = ({ center, disaster, onMouseOver, onMouseOut }) => {
  const [radius, setRadius] = useState(20);
  const IconComponent = disasterIcons[disaster.disasterType] || FloodIcon;

  React.useEffect(() => {
    let frame;
    let phase = 0;
    
    const animate = () => {
      const newRadius = 20 + Math.sin(phase) * 5;
      setRadius(newRadius);
      phase += 0.1;
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <CircleMarker
        center={center}
        radius={radius}
        pathOptions={{
          fillColor: '#ff000033',
          fillOpacity: 0.2,
          color: '#ff0000',
          weight: 2,
        }}
      />
      
      <CircleMarker
        center={center}
        radius={18}
        pathOptions={{
          fillColor: '#ff0000',
          fillOpacity: 0.7,
          color: '#000',
          weight: 1,
        }}
        eventHandlers={{
          mouseover: onMouseOver,
          mouseout: onMouseOut,
        }}
      >
        <div className="relative w-0 h-0">
          <div className="absolute -mt-3 -ml-3">
            <IconComponent style={{ color: 'white', fontSize: '24px' }} />
          </div>
        </div>
      </CircleMarker>
    </>
  );
};

const CrowdsourcedMarker = ({ center, disaster, onMouseOver, onMouseOut }) => (
  <CircleMarker
    center={center}
    radius={6}
    pathOptions={{
      fillColor: '#000',
      fillOpacity: 0.6,
      color: '#000',
      weight: 1,
    }}
    eventHandlers={{
      mouseover: onMouseOver,
      mouseout: onMouseOut,
    }}
  />
);

const SriLankaMap = () => {
  const [verifiedDisasters, setVerifiedDisasters] = useState([]);
  const [crowdsourcedReports, setCrowdsourcedReports] = useState([]);
  const [hoveredDisaster, setHoveredDisaster] = useState(null);
  const [hoveredCrowdsourced, setHoveredCrowdsourced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch verified disasters
        const verifiedRef = collection(db, 'verifiedDisasters');
        const verifiedSnapshot = await getDocs(verifiedRef);
        const verifiedData = verifiedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVerifiedDisasters(verifiedData);

        // Fetch crowdsourced reports
        const crowdsourcedRef = collection(db, 'crowdsourcedReports');
        const crowdsourcedSnapshot = await getDocs(crowdsourcedRef);
        const crowdsourcedData = crowdsourcedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCrowdsourcedReports(crowdsourcedData);
      } catch (err) {
        setError('Failed to fetch disaster data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const getCoordinates = (disaster) => {
    const location = disaster.Location || disaster.location;
    if (!location) return null;
    
    // Handle if location is already an array of coordinates
    if (Array.isArray(location)) {
      return location;
    }
  
    // Handle if location is an object with lat/lng properties
    if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
      return [location.lat, location.lng];
    }
  
    // Handle string format "[latitude° N, longitude° E]"
    if (typeof location === 'string') {
      const match = location.match(/\[([\d.]+)° N, ([\d.]+)° E\]/);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])];
      }
  
      // Handle simple "lat,lng" string format
      const simpleMatch = location.split(',').map(coord => parseFloat(coord.trim()));
      if (simpleMatch.length === 2 && !isNaN(simpleMatch[0]) && !isNaN(simpleMatch[1])) {
        return simpleMatch;
      }
    }
  
    console.warn('Unable to parse location:', location);
    return null;
  };

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={7.5} 
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {crowdsourcedReports.map((report) => {
          const coordinates = getCoordinates(report);
          if (!coordinates) return null;
          
          return (
            <CrowdsourcedMarker
              key={report.id}
              center={coordinates}
              disaster={report}
              onMouseOver={() => setHoveredCrowdsourced(report)}
              onMouseOut={() => setHoveredCrowdsourced(null)}
            />
          );
        })}

        {verifiedDisasters.map((disaster) => {
          const coordinates = getCoordinates(disaster);
          if (!coordinates) return null;
          
          return (
            <PulsatingCircleMarker
              key={disaster.id}
              center={coordinates}
              disaster={disaster}
              onMouseOver={() => setHoveredDisaster(disaster)}
              onMouseOut={() => setHoveredDisaster(null)}
            />
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold mb-2 text-sm">Map Legend</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm">Verified Disasters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-black"></div>
          <span className="text-sm">Crowdsourced Reports</span>
        </div>
      </div>

      {hoveredDisaster && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-[300px] z-[1000]">
          <h3 className="font-bold mb-2 text-lg">{hoveredDisaster.disasterType}</h3>
          <p className="text-sm mb-1">Location: {hoveredDisaster.district}, {hoveredDisaster.province}</p>
          <p className="text-sm mb-1">Date: {new Date(hoveredDisaster.datetime).toLocaleDateString()}</p>
          <p className="text-sm mb-1">Deaths: {hoveredDisaster.deaths}</p>
          <p className="text-sm mb-1">Volunteers needed: {hoveredDisaster.volunteerRequired}</p>
          {hoveredDisaster.resourcesRequired && (
            <>
              <p className="text-sm mb-1">Resources needed:</p>
              <ul className="text-sm list-disc pl-6">
                {hoveredDisaster.resourcesRequired.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {hoveredCrowdsourced && !hoveredDisaster && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-[300px] z-[1000]">
          <h3 className="font-bold mb-2 text-lg">Crowdsourced Report</h3>
          <p className="text-sm mb-1">Location: {hoveredCrowdsourced.district}, {hoveredCrowdsourced.province}</p>
          <p className="text-sm mb-1">Type: {hoveredCrowdsourced.disasterType}</p>
          <p className="text-sm mb-1">Date: {new Date(hoveredCrowdsourced.datetime).toLocaleDateString()}</p>
          <p className="text-sm mb-1">Description: {hoveredCrowdsourced.description}</p>
          <p className="text-sm mb-1">Reported by: {hoveredCrowdsourced.reportedBy}</p>
        </div>
      )}
    </div>
  );
};

export default SriLankaMap;