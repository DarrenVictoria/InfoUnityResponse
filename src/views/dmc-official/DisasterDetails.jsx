import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc,updateDoc,setDoc} from 'firebase/firestore';
import { MapPin, Users, Home, AlertTriangle, Heart, Clock, Minus, Plus, Trash2,Plus as PlusIcon, Edit2, Save, X} from 'lucide-react';
import DisasterLocationMap from '../../components/DisasterLocationMap';

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

  const SafeLocationsSection = ({ disaster, onUpdate }) => {
    const [newLocation, setNewLocation] = useState({
      name: '',
      capacity: '',
      currentHeadcount: 0
    });
  
    const handleAddLocation = async () => {
      if (!newLocation.name || !newLocation.capacity) return;
      
      const updatedLocations = [
        ...(disaster.safeLocations || []),
        newLocation
      ];
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          safeLocations: updatedLocations
        });
        setNewLocation({ name: '', capacity: '', currentHeadcount: 0 });
        onUpdate();
      } catch (error) {
        console.error('Error adding safe location:', error);
        alert('Failed to add safe location');
      }
    };
  
    const handleDeleteLocation = async (index) => {
      const updatedLocations = disaster.safeLocations.filter((_, i) => i !== index);
      
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          safeLocations: updatedLocations
        });
        onUpdate();
      } catch (error) {
        console.error('Error deleting safe location:', error);
        alert('Failed to delete safe location');
      }
    };
  
    const handleUpdateHeadcount = async (index, change) => {
      const updatedLocations = [...disaster.safeLocations];
      const newCount = (updatedLocations[index].currentHeadcount || 0) + change;
      
      if (newCount < 0 || newCount > updatedLocations[index].capacity) return;
      
      updatedLocations[index].currentHeadcount = newCount;
      
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          safeLocations: updatedLocations
        });
        onUpdate();
      } catch (error) {
        console.error('Error updating headcount:', error);
        alert('Failed to update headcount');
      }
    };
  
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Safe Locations</h2>
        
        {/* Add New Location Form */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Location Name"
              className="px-3 py-2 border rounded-lg"
              value={newLocation.name}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Capacity"
              className="px-3 py-2 border rounded-lg"
              value={newLocation.capacity}
              onChange={(e) => setNewLocation(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
            />
            <button
              onClick={handleAddLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </button>
          </div>
        </div>
  
        {/* Locations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disaster.safeLocations?.map((location, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{location.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteLocation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Occupancy</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateHeadcount(index, -1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="font-medium">{location.currentHeadcount}/{location.capacity}</span>
                    <button
                      onClick={() => handleUpdateHeadcount(index, 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
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

  const ResourceRequestsSection = ({ disaster, onUpdate }) => {
    const [newRequest, setNewRequest] = useState({
      type: '',
      status: 'Request Received',
      contactDetails: {
        contactPersonName: '',
        contactMobileNumber: ''
      },
      description: ''
    });
  
    const handleAddRequest = async () => {
      if (!newRequest.type || !newRequest.contactDetails.contactPersonName || !newRequest.contactDetails.contactMobileNumber) return;
      
      const updatedRequests = [
        ...(disaster.resourceRequests || []),
        newRequest
      ];
  
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          resourceRequests: updatedRequests
        });
        setNewRequest({
          type: '',
          status: 'Pending',
          contactDetails: {
            contactPersonName: '',
            contactMobileNumber: ''
          },
          description: ''
        });
        onUpdate();
      } catch (error) {
        console.error('Error adding resource request:', error);
        alert('Failed to add resource request');
      }
    };
  
    const handleDeleteRequest = async (index) => {
      const updatedRequests = disaster.resourceRequests.filter((_, i) => i !== index);
      
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          resourceRequests: updatedRequests
        });
        onUpdate();
      } catch (error) {
        console.error('Error deleting resource request:', error);
        alert('Failed to delete resource request');
      }
    };
  
    const handleUpdateStatus = async (index, newStatus) => {
      const updatedRequests = [...disaster.resourceRequests];
      updatedRequests[index].status = newStatus;
      
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          resourceRequests: updatedRequests
        });
        onUpdate();
      } catch (error) {
        console.error('Error updating request status:', error);
        alert('Failed to update request status');
      }
    };
  
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Resource Requests</h2>
        
        {/* Add New Request Form */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="px-3 py-2 border rounded-lg"
              value={newRequest.type}
              onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Select Resource Type</option>
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Contact Person Name"
              className="px-3 py-2 border rounded-lg"
              value={newRequest.contactDetails.contactPersonName}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                contactDetails: { ...prev.contactDetails, contactPersonName: e.target.value }
              }))}
            />
            
            <input
              type="text"
              placeholder="Contact Mobile Number"
              className="px-3 py-2 border rounded-lg"
              value={newRequest.contactDetails.contactMobileNumber}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                contactDetails: { ...prev.contactDetails, contactMobileNumber: e.target.value }
              }))}
            />
            
            <textarea
              placeholder="Description"
              className="px-3 py-2 border rounded-lg"
              value={newRequest.description}
              onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <button
              onClick={handleAddRequest}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Request
            </button>
          </div>
        </div>
  
        {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disaster.resourceRequests?.map((request, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{request.type}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Request Received' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
                <button
                  onClick={() => handleDeleteRequest(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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

  const VolunteerRequestsSection = ({ disaster, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedRequests, setEditedRequests] = useState({ ...disaster.volunteerRequests });
  
    const handleSaveChanges = async () => {
      try {
        const disasterRef = doc(db, 'verifiedDisasters', disaster.disasterId);
        await updateDoc(disasterRef, {
          volunteerRequests: editedRequests,
          volunteerNeeded: Object.keys(editedRequests).length > 0
        });
        setIsEditing(false);
        onUpdate();
      } catch (error) {
        console.error('Error updating volunteer requests:', error);
        alert('Failed to update volunteer requests');
      }
    };
  
    const handleUpdateCount = (type, count) => {
      if (count < 0) return;
      setEditedRequests(prev => ({
        ...prev,
        [type]: count
      }));
    };
  
    const handleToggleType = (type) => {
      setEditedRequests(prev => {
        const updated = { ...prev };
        if (updated[type] !== undefined) {
          delete updated[type];
        } else {
          updated[type] = 0;
        }
        return updated;
      });
    };

    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Volunteer Requests</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Requests
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveChanges}
                className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedRequests({ ...disaster.volunteerRequests });
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {Object.entries(VOLUNTEER_CATEGORIES).map(([category, types]) => (
            <div key={category} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map(type => (
                  <div key={type} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={isEditing ? editedRequests[type] !== undefined : disaster.volunteerRequests[type] !== undefined}
                        onChange={() => isEditing && handleToggleType(type)}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{type}</span>
                    </div>
                    
                    {(isEditing ? editedRequests[type] !== undefined : disaster.volunteerRequests[type] !== undefined) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => isEditing && handleUpdateCount(type, (editedRequests[type] || 0) - 1)}
                          disabled={!isEditing}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {isEditing ? editedRequests[type] : disaster.volunteerRequests[type]}
                        </span>
                        <button
                          onClick={() => isEditing && handleUpdateCount(type, (editedRequests[type] || 0) + 1)}
                          disabled={!isEditing}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Total Volunteers Needed:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(isEditing ? editedRequests : disaster.volunteerRequests).map(([type, count]) => (
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
          style={{ zIndex: -99999 }}
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <SafeLocationsSection 
          disaster={disaster} 
          onUpdate={handleDataUpdate} 
        />
        
        <ResourceRequestsSection 
          disaster={disaster} 
          onUpdate={handleDataUpdate} 
        />
        
        <VolunteerRequestsSection 
          disaster={disaster} 
          onUpdate={handleDataUpdate} 
        />
        
        
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