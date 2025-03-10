import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { db } from '../../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Droplet, Mountain, Ship, AlertTriangle } from 'lucide-react';

const getDisasterIcon = (type) => {
    const iconSize = 24; // Adjust size as needed
    const iconColor = '#FFFFFF'; // Icon color
    const iconBackground = {
      Flood: '#3182CE', // Blue
      Landslide: '#DD6B20', // Orange
      Marine: '#805AD5', // Purple
      Other: '#718096' // Gray
    }[type];
  
    const iconComponent = {
      Flood: <Droplet size={iconSize} color={iconColor} />,
      Landslide: <Mountain size={iconSize} color={iconColor} />,
      Marine: <Ship size={iconSize} color={iconColor} />,
      Other: <AlertTriangle size={iconSize} color={iconColor} />
    }[type];
  
    // Convert React component to HTML string
    const iconHTML = ReactDOMServer.renderToString(iconComponent);
  
    return L.divIcon({
      html: `
        <div style="
          background: ${iconBackground};
          width: ${iconSize + 8}px;
          height: ${iconSize + 8}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          animation: pulse 1.5s infinite;
        ">
          ${iconHTML}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [iconSize + 8, iconSize + 8],
      iconAnchor: [(iconSize + 8) / 2, iconSize + 8]
    });
  };

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const WarningLocationMap = () => {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const fetchWarnings = async () => {
      const warningsRef = collection(db, 'warnings');
      const snapshot = await getDocs(warningsRef);
      const warningsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWarnings(warningsData);
    };

    fetchWarnings();
  }, []);

  const getMarkerColor = (type) => {
    switch (type) {
      case 'Flood':
        return 'blue';
      case 'Landslide':
        return 'orange';
      case 'Marine':
        return 'purple';
      case 'Other':
        return 'gray';
      default:
        return 'red';
    }
  };

  const Legend = () => (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      {/* <h3 className="text-lg font-semibold mb-2">Disaster Legend</h3> */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Flood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>Landslide</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>Marine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
          <span>Other</span>
        </div>
        <div>
            <p className="text-red-500">Click on pulsating markers for more information</p>
        </div>
      </div>
    </div>
  );

  const customIcon = (color) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const mapStyle = {
    height: '400px',
    width: '100%',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4">
        <MapContainer 
          center={[7.8731, 80.7718]} // Center of Sri Lanka
          zoom={7} 
          style={mapStyle}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {warnings.map(warning => (
            <Marker
            key={warning.id}
            position={[warning.latitude, warning.longitude]}
            icon={getDisasterIcon(warning.type)}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{warning.type}</span>
                </div>
                <div className="text-sm">
                  <p>Severity: {warning.severity}</p>
                  <p>Location: {warning.district} - {warning.dsDivision}</p>
                  <p>Valid From: {new Date(warning.validFrom.seconds * 1000).toLocaleString()}</p>
                  <p>Valid Until: {new Date(warning.validUntil.seconds * 1000).toLocaleString()}</p>
                  {warning.type === 'Flood' && (
                    <>
                      <p>River Basin: {warning.riverBasin}</p>
                      <p>Current Level: {warning.currentLevel}m</p>
                      <p>Alert Level: {warning.alertLevel}m</p>
                    </>
                  )}
                  {warning.type === 'Marine' && (
                    <>
                      <p>Wind Speed: {warning.windSpeed} kmph</p>
                      <p>Wave Height: {warning.waveHeight}m</p>
                    </>
                  )}
                  <p className="mt-1">Warning Message: {warning.warningMessage}</p>
                </div>
              </div>
            </Popup>
          </Marker>
          ))}
        </MapContainer>
        <Legend /> 
      </div>
    </div>
  );
};

export default WarningLocationMap;