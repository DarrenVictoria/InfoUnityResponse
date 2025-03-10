import ReactMapGL, { Marker } from 'react-map-gl';

const MapFallback = ({ onCoordinatesSelect }) => {
  const [viewport, setViewport] = useState({
    latitude: 7.8731, // Default center (Sri Lanka)
    longitude: 80.7718,
    zoom: 7
  });

  const handleMapClick = (e) => {
    const { lngLat } = e;
    onCoordinatesSelect({ latitude: lngLat[1], longitude: lngLat[0] });
  };

  return (
    <div className="mt-4">
      <ReactMapGL
        {...viewport}
        width="100%"
        height="400px"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={setViewport}
        onClick={handleMapClick}
        mapboxApiAccessToken="YOUR_MAPBOX_ACCESS_TOKEN"
      >
        {manualCoordinates.latitude && manualCoordinates.longitude && (
          <Marker
            latitude={manualCoordinates.latitude}
            longitude={manualCoordinates.longitude}
          >
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </Marker>
        )}
      </ReactMapGL>
      <button
        type="button"
        onClick={() => setShowMapFallback(false)}
        className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  );
};