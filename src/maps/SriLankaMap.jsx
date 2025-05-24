import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure you have this firebase config file
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
  const [radius, setRadius] = useState(10);
  const IconComponent = disasterIcons[disaster.disasterType] || null; // Fallback to null if not found

  React.useEffect(() => {
    let frame;
    let phase = 0;
    
    const animate = () => {
      const newRadius = 20 + Math.sin(phase) * 2.5;
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
        radius={9}
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
        {IconComponent && (
          <div className="relative w-0 h-0">
            <div className="absolute -mt-3 -ml-3">
              <IconComponent style={{ color: 'white', fontSize: '24px' }} />
            </div>
          </div>
        )}
      </CircleMarker>
    </>
  );
};

const CrowdsourcedMarker = ({ center, disaster, onMouseOver, onMouseOut }) => (
  <CircleMarker
    center={center}
    radius={2}
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

const SriLankaMap = ({ selectedCluster = [], selectedReports = [] }) => {
  const [verifiedDisasters, setVerifiedDisasters] = useState([]);
  const [crowdsourcedReports, setCrowdsourcedReports] = useState([]);
  const [hoveredDisaster, setHoveredDisaster] = useState(null);
  const [hoveredCrowdsourced, setHoveredCrowdsourced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisasterData = async () => {
      try {
        // Fetch verified disasters
        const verifiedDisastersRef = collection(db, 'verifiedDisasters');
        const verifiedSnapshot = await getDocs(verifiedDisastersRef);
        const verifiedData = verifiedSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Flatten the location data for easier access
              latitude: doc.data().disasterLocation?.latitude,
              longitude: doc.data().disasterLocation?.longitude
            }))
            .filter(disaster => {
              // Validate latitude and longitude
              const lat = parseFloat(disaster.latitude);
              const lon = parseFloat(disaster.longitude);
              return !isNaN(lat) && !isNaN(lon);
            });

        setVerifiedDisasters(verifiedData || []);

        // Fetch crowdsourced reports
        const crowdsourcedReportsRef = collection(db, 'crowdsourcedReports');
        const crowdsourcedSnapshot = await getDocs(crowdsourcedReportsRef);
        const crowdsourcedData = crowdsourcedSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(report => {
            // Validate latitude and longitude
            const lat = parseFloat(report.latitude);
            const lon = parseFloat(report.longitude);
            return !isNaN(lat) && !isNaN(lon);
          });

        setCrowdsourcedReports(crowdsourcedData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching disaster data:', err);
        setError('Failed to load disaster data');
        setLoading(false);
      }
    };

    fetchDisasterData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[600px] bg-gray-100">
      <div className="text-lg">Loading disaster data...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[600px] bg-red-50">
      <div className="text-lg text-red-600">{error}</div>
    </div>;
  }

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <MapContainer center={[7.8731, 80.7718]} zoom={7.5} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {crowdsourcedReports && crowdsourcedReports.map((disaster) => (
          <CrowdsourcedMarker
            key={disaster.id}
            center={[disaster.latitude, disaster.longitude]}
            disaster={disaster}
            onMouseOver={() => setHoveredCrowdsourced(disaster)}
            onMouseOut={() => setHoveredCrowdsourced(null)}
          />
        ))}

        {verifiedDisasters.map((disaster) => (
          <PulsatingCircleMarker
            key={disaster.id}
            center={[disaster.latitude, disaster.longitude]}
            disaster={disaster}
            onMouseOver={() => setHoveredDisaster(disaster)}
            onMouseOut={() => setHoveredDisaster(null)}
          />
        ))}
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
          {/* <p className="text-sm mb-1">Date: {new Date(hoveredDisaster.datetime).toLocaleDateString()}</p>
          <p className="text-sm mb-1">Deaths: {hoveredDisaster.deaths}</p>
          <p className="text-sm mb-1">Volunteers needed: {hoveredDisaster.volunteerRequired}</p>
          <p className="text-sm mb-1">Resources needed:</p> */}
          <ul className="text-sm list-disc pl-6">
            {hoveredDisaster.resourcesRequired?.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      )}

      {hoveredCrowdsourced && !hoveredDisaster && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-[300px] z-[1000]">
          <h3 className="font-bold mb-2 text-lg">Crowdsourced Report</h3>
          <p className="text-sm mb-1">Location: {hoveredCrowdsourced.district}</p>
          <p className="text-sm mb-1">Type: {hoveredCrowdsourced.disasterType}</p>
          {/* <p className="text-sm mb-1">Date: {new Date(hoveredCrowdsourced.datetime).toLocaleDateString()}</p> */}
          <p className="text-sm mb-1">Description: {hoveredCrowdsourced.description}</p>
          {/* <p className="text-sm mb-1">Reported by: {hoveredCrowdsourced.reportedBy}</p> */}
        </div>
      )}
    </div>
  );
};

export default SriLankaMap;