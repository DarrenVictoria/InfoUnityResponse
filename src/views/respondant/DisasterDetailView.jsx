import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Users, Home, AlertTriangle, Heart, Clock } from 'lucide-react';
import DisasterLocationMap from '../../components/DisasterLocationMap';
import NavigationBar from '../../utils/Navbar';

const VOLUNTEER_CATEGORIES = {
  "Emergency Response": ["Search and Rescue (SAR)", "Medical Assistance", "Firefighting Support", "Evacuation Assistance", "Damage Assessment"],
  "Relief and Humanitarian Aid": ["Food Distribution", "Shelter Assistance", "Clothing & Supplies Distribution", "Water, Sanitation, and Hygiene (WASH) Support"],
  "Psychosocial Support": ["Counseling and Psychological First Aid", "Childcare & Education", "Community Support"],
  "Technical Support": ["Communication & IT Support", "Transportation & Logistics", "GIS & Mapping"],
  "Recovery & Reconstruction": ["Debris Removal & Cleanup", "Rebuilding Infrastructure", "Livelihood Restoration"],
  "Disaster Preparedness": ["Community Training & Drills"],
  "Animal Rescue": ["Animal Evacuation & Shelter", "Wildlife Conservation"]
};

const RESOURCE_TYPES = ["Food", "Shelter", "Clothing"];

const DisasterDetails = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDisasterDetails = async () => {
    try {
      const disasterDoc = await getDoc(doc(db, 'verifiedDisasters', id));
      if (disasterDoc.exists()) {
        const data = disasterDoc.data();
        setDisaster({
            ...data,
            disasterId: id,
            latitude: data.disasterLocation?.latitude,  // Flatten the coordinates
            longitude: data.disasterLocation?.longitude,
            safeLocations: data.safeLocations || [],
            resourceRequests: data.resourceRequests || [],
            volunteerRequests: data.volunteerRequests || {},
          });
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching disaster details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasterDetails();
  }, [id]);

  const DisasterHeader = ({ disaster }) => {
    const getDisasterTypeColor = (type) => {
      const colors = {
        Flood: 'bg-blue-500',
        Landslide: 'bg-orange-500',
        Drought: 'bg-yellow-500',
        Cyclone: 'bg-purple-500',
        Earthquake: 'bg-red-500'
      };
      return colors[type] || 'bg-gray-500';
    };
  
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      return new Date(timestamp.seconds * 1000).toLocaleString();
    };
  
    return (
      <div className="bg-white shadow-sm border-b mt-14">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{disaster.disasterType}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${getDisasterTypeColor(disaster.disasterType)}`}>
                    {disaster.disasterType}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{disaster.district}, {disaster.dsDivision}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="text-gray-600">Started:</span>
                <span className="ml-2 font-medium">{formatDate(disaster.dateCommenced)}</span>
              </div>
              {disaster.dateEnded && (
                <div>
                  <span className="text-gray-600">Ended:</span>
                  <span className="ml-2 font-medium">{formatDate(disaster.dateEnded)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HumanEffectSection = ({ disaster }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Human Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Affected Families</label>
            <div className="text-xl font-bold mt-2">{disaster.humanEffect?.affectedFamilies || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Affected People</label>
            <div className="text-xl font-bold mt-2">{disaster.humanEffect?.affectedPeople || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Missing Persons</label>
            <div className="text-xl font-bold mt-2">{disaster.humanEffect?.missing || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Injured</label>
            <div className="text-xl font-bold mt-2">{disaster.humanEffect?.injured || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Deaths</label>
            <div className="text-xl font-bold mt-2">{disaster.humanEffect?.deaths || 0}</div>
          </div>
        </div>
      </div>
    );
  };

  const InfrastructureEffectSection = ({ disaster }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Infrastructure Impact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Houses Fully Damaged</label>
            <div className="text-xl font-bold mt-2">{disaster.infrastructure?.housesFullyDamaged || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Houses Partially Damaged</label>
            <div className="text-xl font-bold mt-2">{disaster.infrastructure?.housesPartiallyDamaged || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="text-sm text-gray-600">Small Infrastructure Damages</label>
            <div className="text-xl font-bold mt-2">{disaster.infrastructure?.smallInfrastructureDamages || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Critical Infrastructure Damages</h3>
          <div className="space-y-2">
            {disaster.infrastructure?.criticalInfrastructureDamages?.map((damage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{damage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SafeLocationsSection = ({ disaster }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Safe Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disaster.safeLocations?.map((location, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{location.name}</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Occupancy</span>
                  <span className="font-medium">{location.currentHeadcount}/{location.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 rounded-full h-2"
                    style={{ width: `${(location.currentHeadcount / location.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ResourceRequestsSection = ({ disaster }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Resource Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disaster.resourceRequests?.map((request, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{request.type}</h3>
                <div className={`px-2 py-1 rounded-full text-sm ${
                  request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{request.contactDetails.contactPersonName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{request.contactDetails.contactMobileNumber}</span>
                </div>
                {request.description && (
                  <p className="text-gray-600 mt-2">{request.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const VolunteerRequestsSection = ({ disaster }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Volunteer Requests</h2>
        <div className="space-y-6">
          {Object.entries(VOLUNTEER_CATEGORIES).map(([category, types]) => (
            <div key={category} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map(type => (
                  <div key={type} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm">{type}</span>
                    </div>
                    {disaster.volunteerRequests[type] !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-center font-medium">
                          {disaster.volunteerRequests[type]}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Total Volunteers Needed:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(disaster.volunteerRequests).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between bg-white p-2 rounded-lg">
                <span className="text-sm">{type}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!disaster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No disaster data found.</div>
      </div>
    );
  }

  const getRiskLevelColor = (level) => {
    const colors = {
      High: 'bg-red-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-green-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DisasterHeader disaster={disaster} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <h3 className="text-xl font-bold">{disaster.riskLevel}</h3>
              </div>
              <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(disaster.riskLevel)}`}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volunteers Needed</p>
                <h3 className="text-xl font-bold">
                  {Object.values(disaster.volunteerRequests || {}).reduce((a, b) => a + b, 0)}
                </h3>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missing Persons</p>
                <h3 className="text-xl font-bold">{disaster.humanEffect?.missing || 0}</h3>
              </div>
              <Heart className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deaths</p>
                <h3 className="text-xl font-bold">{disaster.humanEffect?.deaths || 0}</h3>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <DisasterLocationMap  
            latitude={disaster.disasterLocation?.latitude}
            longitude={disaster.disasterLocation?.longitude}
            disasterType={disaster.disasterType}
            location={`${disaster.district}, ${disaster.dsDivision}`}
            riskLevel={disaster.riskLevel}
          />
        </div>

        <InfrastructureEffectSection disaster={disaster} />
        <HumanEffectSection disaster={disaster} />

        <div className="max-w-7xl mx-auto px-4 py-6">
          <SafeLocationsSection disaster={disaster} />
          <ResourceRequestsSection disaster={disaster} />
          {/* <VolunteerRequestsSection disaster={disaster} /> */}
        </div>
      </div>
    </div>
  );
};

export default DisasterDetails;