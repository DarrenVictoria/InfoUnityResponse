import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc,updateDoc,setDoc} from 'firebase/firestore';
import { MapPin, Users, Home, AlertTriangle, Heart, Clock, Minus, Plus, Trash2,Plus as PlusIcon, Edit2, Save, X} from 'lucide-react';
import DisasterLocationMap from '../../components/DisasterLocationMap';

const DisasterDetails = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndDisasterModal, setShowEndDisasterModal] = useState(false);
  const [endDate, setEndDate] = useState('');

  const fetchDisasterDetails = async () => {
    try {
      const disasterDoc = await getDoc(doc(db, 'verifiedDisasters', id));
      if (disasterDoc.exists()) {
        const data = disasterDoc.data();
        setDisaster({
          ...data,
          disasterId: id,
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

  const handleDataUpdate = async () => {
    await fetchDisasterDetails();
  };

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            {/* Disaster Type and Location */}
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
            
            {/* Dates */}
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

  const HumanEffectSection = ({ disaster, onUpdate }) => {
    

    const handleCountChange = async (field, value) => {
      if (value < 0) return;
      
      const updatedHumanEffect = {
        ...disaster.humanEffect,
        [field]: value
      };
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          humanEffect: updatedHumanEffect
        });
        onUpdate();
      } catch (error) {
        console.error('Error updating count:', error);
        alert('Failed to update count');
      }
    };
  
    const CounterField = ({ label, value, field }) => (
      <div className="bg-white rounded-lg shadow p-4">
        <label className="text-sm text-gray-600">{label}</label>
        <div className="flex items-center space-x-2 mt-2">
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={() => handleCountChange(field, (value || 0) - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-xl font-bold min-w-[3rem] text-center">
            {value || 0}
          </span>
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={() => handleCountChange(field, (value || 0) + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Human Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CounterField 
            label="Affected Families"
            value={disaster.humanEffect?.affectedFamilies}
            field="affectedFamilies"
          />
          <CounterField 
            label="Affected People"
            value={disaster.humanEffect?.affectedPeople}
            field="affectedPeople"
          />
          <CounterField 
            label="Missing Persons"
            value={disaster.humanEffect?.missing}
            field="missing"
          />
          <CounterField 
            label="Injured"
            value={disaster.humanEffect?.injured}
            field="injured"
          />
          <CounterField 
            label="Deaths"
            value={disaster.humanEffect?.deaths}
            field="deaths"
          />
        </div>
      </div>
    );
  };

  const InfrastructureEffectSection = ({ disaster, onUpdate }) => {
    const [newDamage, setNewDamage] = useState('');
  
    const handleCountChange = async (field, value) => {
      if (value < 0) return;
      
      const updatedInfrastructure = {
        ...disaster.infrastructure,
        [field]: value
      };
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          infrastructure: updatedInfrastructure
        });
        onUpdate();
      } catch (error) {
        console.error('Error updating infrastructure:', error);
        alert('Failed to update infrastructure data');
      }
    };
  
    const handleAddDamage = async () => {
      if (!newDamage.trim()) return;
  
      const updatedDamages = [
        ...(disaster.infrastructure?.criticalInfrastructureDamages || []),
        newDamage.trim()
      ];
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          'infrastructure.criticalInfrastructureDamages': updatedDamages
        });
        setNewDamage('');
        onUpdate();
      } catch (error) {
        console.error('Error adding damage:', error);
        alert('Failed to add damage');
      }
    };
  
    const handleRemoveDamage = async (index) => {
      const updatedDamages = (disaster.infrastructure?.criticalInfrastructureDamages || [])
        .filter((_, i) => i !== index);
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          'infrastructure.criticalInfrastructureDamages': updatedDamages
        });
        onUpdate();
      } catch (error) {
        console.error('Error removing damage:', error);
        alert('Failed to remove damage');
      }
    };
  
    const CounterField = ({ label, value, field }) => (
      <div className="bg-white rounded-lg shadow p-4">
        <label className="text-sm text-gray-600">{label}</label>
        <div className="flex items-center space-x-2 mt-2">
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={() => handleCountChange(field, (value || 0) - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-xl font-bold min-w-[3rem] text-center">
            {value || 0}
          </span>
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={() => handleCountChange(field, (value || 0) + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Infrastructure Impact</h2>
        
        {/* Damage Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CounterField 
            label="Houses Fully Damaged"
            value={disaster.infrastructure?.housesFullyDamaged}
            field="housesFullyDamaged"
          />
          <CounterField 
            label="Houses Partially Damaged"
            value={disaster.infrastructure?.housesPartiallyDamaged}
            field="housesPartiallyDamaged"
          />
          <CounterField 
            label="Small Infrastructure Damages"
            value={disaster.infrastructure?.smallInfrastructureDamages}
            field="smallInfrastructureDamages"
          />
        </div>
  
        {/* Critical Infrastructure Damages List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Critical Infrastructure Damages</h3>
          
          {/* Add New Damage */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDamage}
              onChange={(e) => setNewDamage(e.target.value)}
              placeholder="Enter critical infrastructure damage"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddDamage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
  
          {/* Damages List */}
          <div className="space-y-2">
            {disaster.infrastructure?.criticalInfrastructureDamages?.map((damage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{damage}</span>
                <button
                  onClick={() => handleRemoveDamage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  

  const handleEndDisaster = async () => {
    try {
      const disasterRef = doc(db, 'verifiedDisasters', id);
      await updateDoc(disasterRef, {
        dateEnded: endDate,
        status: 'Ended'
      });

      // Update Location_Status collection
      const locationStatusRef = doc(db, 'Location_Status', 'divisionalSecretariats');
      const locationStatusDoc = await getDoc(locationStatusRef);

      if (locationStatusDoc.exists()) {
        const data = locationStatusDoc.data();
        const updatedData = { ...data };

        // Update the specific DS Division
        if (updatedData[disaster.dsDivision]) {
          updatedData[disaster.dsDivision].Safety = true;
          updatedData[disaster.dsDivision].VolunteerNeed = false;
          updatedData[disaster.dsDivision].WarningStatus = 'Low';
        }

        await setDoc(locationStatusRef, updatedData);
      }

      setShowEndDisasterModal(false);
      alert('Disaster marked as ended successfully!');
      // Refresh the disaster details to reflect the updated status
      fetchDisasterDetails();
    } catch (error) {
      console.error('Error ending disaster:', error);
      alert('Failed to mark disaster as ended.');
    }

    
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
      {/* Header Section */}
      

      <DisasterHeader disaster={disaster} />

      {/* Status Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Risk Level Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <h3 className="text-xl font-bold">{disaster.riskLevel}</h3>
              </div>
              <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(disaster.riskLevel)}`}></div>
            </div>
          </div>

          

          {/* Volunteers Card */}
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

          {/* Missing Persons Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missing Persons</p>
                <h3 className="text-xl font-bold">{disaster.humanEffect?.missing || 0}</h3>
              </div>
              <Heart className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          {/* Deaths Card */}
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
          latitude={disaster.latitude}
          longitude={disaster.longitude}
          disasterType={disaster.disasterType}
          location={`${disaster.district}, ${disaster.dsDivision}`}
          riskLevel={disaster.riskLevel}
        />
      </div>

      <InfrastructureEffectSection 
          disaster={disaster} 
          onUpdate={handleDataUpdate} 
        />


      <HumanEffectSection 
          disaster={disaster} 
          onUpdate={handleDataUpdate} 
        />

        {/* Safe Locations Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Safe Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disaster.safeLocations?.map((location, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Home className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{location.name}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
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

        {/* Resource Requests Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Resource Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disaster.resourceRequests?.map((request, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{request.type}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{request.contactDetails?.contactPersonName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{request.contactDetails?.contactMobileNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Rendering for Mark Disaster as Ended */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {disaster.status === 'Ended' ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
              <p className="font-bold">Disaster Status</p>
              <p>This disaster has already been marked as ended.</p>
            </div>
          ) : (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
              onClick={() => setShowEndDisasterModal(true)}
            >
              Mark Disaster as Ended
            </button>
          )}
        </div>

        {/* End Disaster Modal */}
        {showEndDisasterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Mark Disaster as Ended</h2>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border rounded-lg mb-4"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                  onClick={() => setShowEndDisasterModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick={handleEndDisaster}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisasterDetails;