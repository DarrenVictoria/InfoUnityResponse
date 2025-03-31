import React from 'react';
import { X, MapPin, ExternalLink } from 'lucide-react';

const DisasterDetailsPopup = ({ selectedDisaster, setSelectedDisaster }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  // Extract location data
  const location = selectedDisaster?.disasterLocation || {};
  const latitude = location.latitude || selectedDisaster?.latitude;
  const longitude = location.longitude || selectedDisaster?.longitude;
  const locationName = location.name || selectedDisaster?.name || 'Disaster Location';

  // Google Maps URLs
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  
  // OpenStreetMap URL
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  
  // Try a different static map service that's more reliable
  // Using OpenStreetMap via a different static map provider
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=600x300&markers=color:red%7C${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`;

  // If you don't want to use Google's static map API, we can use a placeholder image instead
  const usePlaceholderImage = true;
  const placeholderImageUrl = `/api/placeholder/600/300`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedDisaster.disasterType} in {selectedDisaster.district}
          </h2>
          <button onClick={() => setSelectedDisaster(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Location Map Section */}
        {latitude && longitude && (
          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> Location
            </h3>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              {/* Embedded OpenStreetMap iFrame approach */}
              <div className="relative w-full h-64">
                <iframe
                  title="Disaster Location Map"
                  className="w-full h-full border-0"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}`}
                ></iframe>
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2">
                  <p className="font-medium">{locationName}</p>
                  <p className="text-sm text-gray-600">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              {/* Map Actions */}
              <div className="flex border-t border-gray-200">
                <a 
                  href={openStreetMapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 px-4 flex-1 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> View in OpenStreetMap
                </a>
                <div className="w-px bg-gray-200"></div>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 px-4 flex-1 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Google Maps
                </a>
                <div className="w-px bg-gray-200"></div>
                <a 
                  href={googleMapsDirectionsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 px-4 flex-1 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" /> Get Directions
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium mb-2">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="font-semibold">DS Division:</span> {selectedDisaster.dsDivision}</p>
              <p><span className="font-semibold">Date Commenced:</span> {formatDate(selectedDisaster.dateCommenced)}</p>
              <p><span className="font-semibold">Date Ended:</span> {formatDate(selectedDisaster.dateEnded)}</p>
              <p><span className="font-semibold">Risk Level:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedDisaster.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  selectedDisaster.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedDisaster.riskLevel}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Human Impact</h3>
            {selectedDisaster.humanEffect ? (
              <div className="space-y-2">
                <p><span className="font-semibold">Affected Families:</span> {selectedDisaster.humanEffect.affectedFamilies}</p>
                <p><span className="font-semibold">Affected People:</span> {selectedDisaster.humanEffect.affectedPeople}</p>
                <p><span className="font-semibold">Deaths:</span> {selectedDisaster.humanEffect.deaths}</p>
                <p><span className="font-semibold">Injured:</span> {selectedDisaster.humanEffect.injured}</p>
                <p><span className="font-semibold">Missing:</span> {selectedDisaster.humanEffect.missing}</p>
              </div>
            ) : (
              <p className="text-gray-500">No human impact data available</p>
            )}
          </div>
        </div>

        {/* Infrastructure Damage Section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Infrastructure Damage</h3>
          {selectedDisaster.infrastructure ? (
            <div className="space-y-2">
              <p><span className="font-semibold">Houses Fully Damaged:</span> {selectedDisaster.infrastructure.housesFullyDamaged}</p>
              <p><span className="font-semibold">Houses Partially Damaged:</span> {selectedDisaster.infrastructure.housesPartiallyDamaged}</p>
              <p><span className="font-semibold">Small Infrastructure Damages:</span> {selectedDisaster.infrastructure.smallInfrastructureDamages}</p>
              {selectedDisaster.infrastructure.criticalInfrastructureDamages?.length > 0 && (
                <div>
                  <p className="font-semibold">Critical Infrastructure Damages:</p>
                  <ul className="list-disc pl-5">
                    {selectedDisaster.infrastructure.criticalInfrastructureDamages.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No infrastructure damage data available</p>
          )}
        </div>

        {/* Volunteer Requests Section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Volunteer Requests</h3>
          {selectedDisaster.volunteerRequests ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(selectedDisaster.volunteerRequests).map(([type, count]) => (
                <div key={type} className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-semibold">{type}</p>
                  <p>Required: {count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No volunteer requests data available</p>
          )}
        </div>

        {/* Assigned Volunteers Section */}
        {selectedDisaster.assignedVolunteers?.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Assigned Volunteers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Red Cross</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedDisaster.assignedVolunteers.map((volunteer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{volunteer.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {volunteer.isRedCrossVolunteer ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Yes</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(volunteer.assignedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisasterDetailsPopup;