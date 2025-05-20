import React, { useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ClusterIcon = ({ count }) => (
  <div className="cluster-marker">
    <div className="cluster-inner">{count}</div>
  </div>
);

const createClusterCustomIcon = (cluster) => {
  const pointCount = cluster.properties?.point_count || 1;
  
  return L.divIcon({
    html: `<div class="cluster-marker">
             <div class="cluster-inner">${pointCount}</div>
           </div>`,
    className: 'custom-cluster-marker',
    iconSize: L.point(40, 40, true)
  });
};

const ClusterMarker = ({ cluster, onClick }) => {
  useMapEvents({
    zoomend: () => {
      // Popup closes on zoom
    }
  });

  const pointCount = cluster.properties?.point_count || 1;
  const isCluster = pointCount > 1;

  return (
    <Marker
      position={[cluster.geometry.coordinates[1], cluster.geometry.coordinates[0]]}
      icon={createClusterCustomIcon(cluster)}
      eventHandlers={{
        click: () => onClick(cluster)
      }}
    >
      {isCluster && (
        <Popup>
          <div className="cluster-popup">
            <h1>{pointCount} reports</h1>
            
          </div>
        </Popup>
      )}
    </Marker>
  );
};

const ZoomHandler = ({ onZoomChange }) => {
  const map = useMap();
  useMapEvents({
    zoomend: () => {
      onZoomChange?.(map.getZoom());
    }
  });
  return null;
};

const SriLankaMapReportMan = ({ 
  clusters = [], 
  selectedCluster,
  onClusterClick,
  onZoomChange
}) => {
  const mapRef = useRef(null);

  const handleCreated = useCallback((map) => {
    mapRef.current = map;
    onZoomChange?.(map.getZoom());
  }, [onZoomChange]);

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={7.5} 
        className="h-full w-full"
        zoomControl={false}
        whenCreated={handleCreated}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomHandler onZoomChange={onZoomChange} />

        {clusters.map((cluster) => {
          if (!cluster?.geometry?.coordinates) return null;
          
          const [longitude, latitude] = cluster.geometry.coordinates;
          if (isNaN(latitude) || isNaN(longitude)) return null;

          const key = cluster.properties?.cluster_id 
              ? `cluster-${cluster.properties.cluster_id}` 
              : `report-${cluster.properties?.report?.id || Math.random()}`;

          return (
              <ClusterMarker
              key={key}
              cluster={cluster}
              onClick={onClusterClick}
              />
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold mb-2 text-sm">Map Legend</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="cluster-marker">
            <div className="cluster-inner">3</div>
          </div>
          <span className="text-sm">Report Cluster</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="cluster-marker">
            <div className="cluster-inner">1</div>
          </div>
          <span className="text-sm">Single Report</span>
        </div>
      </div>

      <style jsx>{`
        .cluster-marker {
          background: rgba(220, 38, 38, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cluster-marker:hover {
          transform: scale(1.1);
        }

        .cluster-inner {
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 60%;
          height: 60%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 0.8rem;
        }

        .cluster-popup {
          min-width: 150px;
          padding: 8px;
          text-align: center;
        }

        .leaflet-control-zoom {
          margin-right: 10px !important;
          margin-bottom: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default SriLankaMapReportMan;