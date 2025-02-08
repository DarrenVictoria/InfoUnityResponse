import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Save, MapPin, Trash2  } from 'lucide-react';
import LocationSelector from "../../components/LocationSelector";
import { db } from '../../../firebase';
import { collection, addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import LocationSelectorPin from '../../components/LocationSelectorPin';

// Common disaster types in Sri Lanka
const DISASTER_TYPES = [
  "Flood",
  "Landslide",
  "Drought",
  "Cyclone",
  "Tsunami",
  "Coastal Erosion",
  "Lightning Strike",
  "Forest Fire",
  "Industrial Accident",
  "Epidemic"
];

const VOLUNTEER_CATEGORIES = {
  "Emergency Response": ["Search and Rescue (SAR)", "Medical Assistance", "Firefighting Support", "Evacuation Assistance", "Damage Assessment"],
  "Relief and Humanitarian Aid": ["Food Distribution", "Shelter Assistance", "Clothing & Supplies Distribution", "Water, Sanitation, and Hygiene (WASH) Support"],
  "Psychosocial Support": ["Counseling and Psychological First Aid", "Childcare & Education", "Community Support"],
  "Technical Support": ["Communication & IT Support", "Transportation & Logistics", "GIS & Mapping"],
  "Recovery & Reconstruction": ["Debris Removal & Cleanup", "Rebuilding Infrastructure", "Livelihood Restoration"],
  "Disaster Preparedness": ["Community Training & Drills"],
  "Animal Rescue": ["Animal Evacuation & Shelter", "Wildlife Conservation"]
};

const STEPPER_LABELS = [
  ["Main Details", "Human Effect", "Infrastructure", "Safe Locations"],
  ["Resource Requests", "Volunteer Requests", "Summary"]
];

const RESOURCE_TYPES = ["Food", "Shelter", "Clothing"];
const RESOURCE_STATUSES = ["Request Received", "Pending Approval", "Approved", "Dispatched", "Rejected"];

export default function DisasterReportingStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  const [dateErrors, setDateErrors] = useState({
    dateCommenced: '',
    dateEnded: ''
  });
  
  const [formData, setFormData] = useState({
    // Main Details
    disasterId: '',
    reportDateTime: new Date(),
    province: '',
    district: '',
    dsDivision: '',
    disasterType: '',
    dateCommenced: '',
    dateEnded: '',
    riskLevel: '',

    disasterLocation: { // Add this field
      latitude: null,
      longitude: null,
      name: ''
    },
    
    // Human Effect
    humanEffect: {
      affectedFamilies: 0,
      affectedPeople: 0,
      deaths: 0,
      injured: 0,
      missing: 0
    },
    
    // Infrastructure
    infrastructure: {
      housesFullyDamaged: 0,
      housesPartiallyDamaged: 0,
      smallInfrastructureDamages: 0,
      criticalInfrastructureDamages: []
    },
    
    // Safe Locations
    safeLocations: [],

    
    // Resource Requests
    resourceRequests: [],
    resourceRequestType: '', // Temporary field for type
  resourceRequestContactName: '', // Temporary field for contact name
  resourceRequestContactNumber: '', // Temporary field for contact number
  resourceRequestDescription: '', // Temporary field for description
    
    // Volunteer Requests
    volunteerNeeded: false,
    volunteerRequests: {}
  });

  const handleLocationChange = (district, division) => {
    setFormData(prev => ({
      ...prev,
      district,
      dsDivision: division
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.district && formData.dsDivision && formData.disasterType && formData.dateCommenced;
      case 2:
        return formData.humanEffect.affectedPeople >= formData.humanEffect.affectedFamilies;
      case 3:
        return true; // Basic infrastructure data is optional
      case 4:
        return formData.safeLocations.length > 0;
      case 5:
        return formData.resourceRequests.length > 0;
      case 6:
        return formData.volunteerNeeded ? Object.keys(formData.volunteerRequests).length > 0 : true;
      case 7:
        return true; // No validation needed for the summary step
      default:
        return false;
    }
  };

  const validateDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date and time';
    }

    // Check year is exactly 4 digits
    const year = date.getFullYear();
    if (year.toString().length !== 4) {
      return 'Year must be exactly 4 digits';
    }

    // Check if date is in future
    if (date > new Date()) {
      return 'Date cannot be in the future';
    }

    // Check if month is valid (1-12)
    const month = date.getMonth() + 1;
    if (month < 1 || month > 12) {
      return 'Invalid month';
    }

    // Check if day is valid for the given month
    const day = date.getDate();
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) {
      return 'Invalid day for the selected month';
    }

    return '';
  };

  const handleDateChange = (e, field) => {
    const value = e.target.value;
    const error = validateDate(value);
    
    setDateErrors(prev => ({
      ...prev,
      [field]: error
    }));

    if (!error) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const renderStepperProgress = () => {
    const currentStepIndex = currentStep - 1;
    const totalSteps = STEPPER_LABELS.flat().length;
    const progress = (currentStepIndex / (totalSteps - 1)) * 100;
  
    return (
      <div className="mb-12 overflow-x-auto">
        <div className="relative min-w-[800px]">
          {/* Progress Bar */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Stepper Labels */}
          <div className="relative flex justify-between">
            {STEPPER_LABELS.flat().map((label, index) => {
              const stepNumber = index + 1;
              return (
                <button
                  key={stepNumber}
                  onClick={() => {
                    if (stepNumber <= currentStep) {
                      setCurrentStep(stepNumber);
                    }
                  }}
                  className={`flex flex-col items-center ${
                    stepNumber <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white
                      ${stepNumber <= currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                      }
                      ${stepNumber === currentStep ? 'ring-4 ring-blue-100' : ''}
                    `}
                  >
                    {stepNumber}
                  </div>
                  <span 
                    className={`mt-2 text-xs sm:text-sm text-center ${
                      stepNumber <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMainDetails = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Disaster Main Details</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <LocationSelector onLocationChange={handleLocationChange} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Disaster Type</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.disasterType}
            onChange={(e) => setFormData(prev => ({...prev, disasterType: e.target.value}))}
          >
            <option value="">Select Disaster Type</option>
            {DISASTER_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Disaster Location</label>
          <LocationSelectorPin
  onLocationSelect={(location) => {
    setFormData(prev => ({
      ...prev,
      disasterLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name
      }
    }));
  }}
/>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date Commenced</label>
            <input
              type="datetime-local"
              className={`w-full px-4 py-2 border rounded-lg ${dateErrors.dateCommenced ? 'border-red-500' : ''}`}
              value={formData.dateCommenced}
              onChange={(e) => handleDateChange(e, 'dateCommenced')}
            />
            {dateErrors.dateCommenced && (
              <p className="text-red-500 text-sm mt-1">{dateErrors.dateCommenced}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Ended</label>
            <input
              type="datetime-local"
              className={`w-full px-4 py-2 border rounded-lg ${dateErrors.dateEnded ? 'border-red-500' : ''}`}
              value={formData.dateEnded}
              onChange={(e) => handleDateChange(e, 'dateEnded')}
            />
            {dateErrors.dateEnded && (
              <p className="text-red-500 text-sm mt-1">{dateErrors.dateEnded}</p>
            )}
          </div>
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Risk Level</label>
          <div className="flex gap-4">
            {['Low', 'Medium', 'High'].map(level => (
              <label key={level} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="riskLevel"
                  value={level}
                  checked={formData.riskLevel === level}
                  onChange={(e) => setFormData(prev => ({...prev, riskLevel: e.target.value}))}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHumanEffect = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Human Effect</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Affected Families</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.humanEffect.affectedFamilies}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              humanEffect: {
                ...prev.humanEffect,
                affectedFamilies: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Affected People</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.humanEffect.affectedPeople}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              humanEffect: {
                ...prev.humanEffect,
                affectedPeople: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deaths</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.humanEffect.deaths}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              humanEffect: {
                ...prev.humanEffect,
                deaths: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Injured</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.humanEffect.injured}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              humanEffect: {
                ...prev.humanEffect,
                injured: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Missing</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.humanEffect.missing}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              humanEffect: {
                ...prev.humanEffect,
                missing: parseInt(e.target.value)
              }
            }))}
          />
        </div>
      </div>
    </div>
  );

  const renderInfrastructure = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Infrastructure Damage</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fully Damaged Houses</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.infrastructure.housesFullyDamaged}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              infrastructure: {
                ...prev.infrastructure,
                housesFullyDamaged: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Partially Damaged Houses</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.infrastructure.housesPartiallyDamaged}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              infrastructure: {
                ...prev.infrastructure,
                housesPartiallyDamaged: parseInt(e.target.value)
              }
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Small Infrastructure Damages</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.infrastructure.smallInfrastructureDamages}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              infrastructure: {
                ...prev.infrastructure,
                smallInfrastructureDamages: parseInt(e.target.value)
              }
            }))}
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Critical Infrastructure Damages</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="Enter damage description"
              value={formData.newDamage || ''}
              onChange={(e) => setFormData(prev => ({...prev, newDamage: e.target.value}))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && formData.newDamage) {
                  setFormData(prev => ({
                    ...prev,
                    infrastructure: {
                      ...prev.infrastructure,
                      criticalInfrastructureDamages: [...prev.infrastructure.criticalInfrastructureDamages, prev.newDamage]
                    },
                    newDamage: ''
                  }));
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              disabled={!formData.newDamage}
              onClick={() => {
                if (formData.newDamage) {
                  setFormData(prev => ({
                    ...prev,
                    infrastructure: {
                      ...prev.infrastructure,
                      criticalInfrastructureDamages: [...prev.infrastructure.criticalInfrastructureDamages, prev.newDamage]
                    },
                    newDamage: ''
                  }));
                }
              }}
            >
              Add
            </button>
          </div>
          
          {/* List of Critical Infrastructure Damages */}
          {formData.infrastructure.criticalInfrastructureDamages.length > 0 && (
            <div className="mt-4 space-y-2 border rounded-lg p-4">
              <h3 className="font-medium text-sm text-gray-700">Listed Critical Infrastructure Damages:</h3>
              {formData.infrastructure.criticalInfrastructureDamages.map((damage, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">{damage}</span>
                  <button
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        infrastructure: {
                          ...prev.infrastructure,
                          criticalInfrastructureDamages: prev.infrastructure.criticalInfrastructureDamages.filter((_, i) => i !== index)
                        }
                      }));
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const addSafeLocation = () => {
    const newLocation = {
      name: formData.safeLocationName,
      latitude: formData.safeLocationLatitude,
      longitude: formData.safeLocationLongitude,
      currentHeadcount: formData.safeLocationHeadcount,
      capacity: formData.safeLocationCapacity
    };
  
    // Validate required fields
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude || !newLocation.currentHeadcount || !newLocation.capacity) {
      alert("Please fill all fields for the safe location.");
      return;
    }
  
    // Add the new location to the safeLocations array
    setFormData(prev => ({
      ...prev,
      safeLocations: [...prev.safeLocations, newLocation],
      safeLocationName: '',
      safeLocationLatitude: '',
      safeLocationLongitude: '',
      safeLocationHeadcount: '',
      safeLocationCapacity: ''
    }));
  };

  const renderSafeLocations = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Safe Locations</h2>
      
      {/* Add new safe location form */}
      <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
        <LocationSelectorPin
          onLocationSelect={(location) => {
            setFormData(prev => ({
              ...prev,
              safeLocationName: location.name,
              safeLocationLatitude: location.latitude,
              safeLocationLongitude: location.longitude,
            }));
          }}
        />
  
        <input
          type="number"
          className="px-4 py-2 border rounded-lg"
          placeholder="Current headcount"
          value={formData.safeLocationHeadcount || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, safeLocationHeadcount: e.target.value }))}
        />
        <input
          type="number"
          className="px-4 py-2 border rounded-lg"
          placeholder="Capacity"
          value={formData.safeLocationCapacity || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, safeLocationCapacity: e.target.value }))}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          disabled={!formData.safeLocationName || !formData.safeLocationHeadcount || !formData.safeLocationCapacity}
          onClick={addSafeLocation}
        >
          Add Safe Location
        </button>
      </div>
  
      {/* List of safe locations */}
      {formData.safeLocations.length > 0 && (
        <div className="mt-4 space-y-2 border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-700">Listed Safe Locations:</h3>
          {formData.safeLocations.map((location, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <span className="text-sm font-medium">{location.name}</span>
                <span className="text-sm">Lat: {location.latitude}</span>
                <span className="text-sm">Lng: {location.longitude}</span>
                <span className="text-sm">Current: {location.currentHeadcount}</span>
                <span className="text-sm">Capacity: {location.capacity}</span>
              </div>
              <button
                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    safeLocations: prev.safeLocations.filter((_, i) => i !== index)
                  }));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  const addResourceRequest = () => {
    const newRequest = {
      type: formData.resourceRequestType,
      requestedTimestamp: new Date().toISOString().slice(0, 16),
      contactDetails: {
        contactPersonName: formData.resourceRequestContactName,
        contactMobileNumber: formData.resourceRequestContactNumber
      },
      description: formData.resourceRequestDescription,
      status: 'Request Received'
    };
  
    setFormData(prev => ({
      ...prev,
      resourceRequests: [...prev.resourceRequests, newRequest],
      resourceRequestType: '',
      resourceRequestContactName: '',
      resourceRequestContactNumber: '',
      resourceRequestDescription: ''
    }));
  };

  const renderResourceRequests = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Resource Requests</h2>
      
      {/* Add new resource request form */}
      <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Resource Type</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.resourceRequestType}
            onChange={(e) => setFormData(prev => ({ ...prev, resourceRequestType: e.target.value }))}
          >
            <option value="">Select Resource Type</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Contact Person Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter contact person name"
            value={formData.resourceRequestContactName}
            onChange={(e) => setFormData(prev => ({ ...prev, resourceRequestContactName: e.target.value }))}
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Contact Mobile Number</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter contact mobile number"
            value={formData.resourceRequestContactNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, resourceRequestContactNumber: e.target.value }))}
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter necessary resource description"
            value={formData.resourceRequestDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, resourceRequestDescription: e.target.value }))}
          />
        </div>
  
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          disabled={!formData.resourceRequestType || !formData.resourceRequestContactName || !formData.resourceRequestContactNumber}
          onClick={addResourceRequest}
        >
          Add Resource Request
        </button>
      </div>
  
      {/* List of resource requests */}
      {formData.resourceRequests.length > 0 && (
        <div className="mt-4 space-y-2 border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-700">Listed Resource Requests:</h3>
          {formData.resourceRequests.map((request, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <span className="text-sm font-medium">{request.type}</span>
                <span className="text-sm">Status: {request.status}</span>
                <span className="text-sm">Contact: {request.contactDetails.contactPersonName}</span>
                <span className="text-sm">Mobile: {request.contactDetails.contactMobileNumber}</span>
              </div>
              <button
                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    resourceRequests: prev.resourceRequests.filter((_, i) => i !== index)
                  }));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVolunteerRequests = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Volunteer Requests</h2>
      
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium">Need Volunteers?</label>
        <input
          type="checkbox"
          checked={formData.volunteerNeeded}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            volunteerNeeded: e.target.checked
          }))}
        />
      </div>
  
      {formData.volunteerNeeded && (
        <div className="space-y-4">
          {Object.entries(VOLUNTEER_CATEGORIES).map(([category, types]) => (
            <div key={category}>
              <h3 className="font-medium text-lg">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData.volunteerRequests[type]}
                      onChange={(e) => {
                        const updatedRequests = { ...formData.volunteerRequests };
                        if (e.target.checked) {
                          updatedRequests[type] = 0;
                        } else {
                          delete updatedRequests[type];
                        }
                        setFormData(prev => ({
                          ...prev,
                          volunteerRequests: updatedRequests
                        }));
                      }}
                    />
                    <label className="text-sm">{type}</label>
                    {formData.volunteerRequests[type] !== undefined && (
                      <input
                        type="number"
                        min="0"
                        className="w-20 px-2 py-1 border rounded-lg"
                        value={formData.volunteerRequests[type]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          volunteerRequests: {
                            ...prev.volunteerRequests,
                            [type]: parseInt(e.target.value)
                          }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Report Summary</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Main Details Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Main Details</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">District:</span>
              <p className="font-medium">{formData.district}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">DS Division:</span>
              <p className="font-medium">{formData.dsDivision}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Disaster Type:</span>
              <p className="font-medium">{formData.disasterType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Risk Level:</span>
              <p className="font-medium">{formData.riskLevel}</p>
            </div>
          </div>
        </div>

        {/* Human Effect Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Human Effect</h3>
          <div className="space-y-2">
            {Object.entries(formData.humanEffect).map(([key, value]) => (
              <div key={key}>
                <span className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Infrastructure Damage</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Fully Damaged Houses:</span>
              <p className="font-medium">{formData.infrastructure.housesFullyDamaged}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Partially Damaged Houses:</span>
              <p className="font-medium">{formData.infrastructure.housesPartiallyDamaged}</p>
            </div>
            {formData.infrastructure.criticalInfrastructureDamages.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">Critical Infrastructure:</span>
                <ul className="list-disc pl-4">
                  {formData.infrastructure.criticalInfrastructureDamages.map((damage, idx) => (
                    <li key={idx} className="text-sm">{damage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Safe Locations Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Safe Locations</h3>
          <div className="space-y-2">
            {formData.safeLocations.map((location, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-gray-600">
                  Capacity: {location.currentHeadcount}/{location.capacity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Requests Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Resource Requests</h3>
          <div className="space-y-2">
            {formData.resourceRequests.map((request, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{request.type}</p>
                <div className="text-sm text-gray-600">
                  <p>Status: {request.status}</p>
                  <p>Contact: {request.contactDetails.contactPersonName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Volunteer Requests Summary */}
      {formData.volunteerNeeded && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-600">Volunteer Requests</h3>
          <div className="space-y-2">
            {Object.entries(formData.volunteerRequests).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{type}</p>
                <p className="text-sm text-gray-600">{count} volunteers needed</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );

  const renderSafeLocationsReadOnly = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Safe Locations</h2>
      
      {/* Display saved safe locations in read-only mode */}
      {formData.safeLocations.length > 0 && (
        <div className="mt-4 space-y-2 border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-700">Listed Safe Locations:</h3>
          {formData.safeLocations.map((location, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <span className="text-sm font-medium">{location.name}</span>
                <span className="text-sm">Current: {location.currentHeadcount}</span>
                <span className="text-sm">Capacity: {location.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResourceRequestsReadOnly = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Resource Requests</h2>
      
      {formData.resourceRequests.length > 0 && (
        <div className="mt-4 space-y-2 border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-700">Listed Resource Requests:</h3>
          {formData.resourceRequests.map((request, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <span className="text-sm font-medium">{request.type}</span>
                <span className="text-sm">Status: {request.status}</span>
                <span className="text-sm">Contact: {request.contactDetails.contactPersonName}</span>
                <span className="text-sm">Mobile: {request.contactDetails.contactMobileNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderMainDetails();
      case 2:
        return renderHumanEffect();
      case 3:
        return renderInfrastructure();
      case 4:
        return renderSafeLocations(); // Allow input for safe locations
      case 5:
        return renderResourceRequests(); // Allow input for resource requests
      case 6:
        return renderVolunteerRequests();
      case 7:
        return (
          <>
            {renderSafeLocationsReadOnly()} {/* Read-only mode */}
            {renderResourceRequestsReadOnly()} {/* Read-only mode */}
            {renderSummary()}
          </>
        );
      default:
        return null;
    }
  };

  const handleSaveReport = async () => {
    try {
      // Clean and validate form data before saving
      const cleanFormData = {
        // Main Details
        reportDateTime: new Date(),
        province: formData.province?.trim() || '',
        district: formData.district?.trim() || '',
        dsDivision: formData.dsDivision?.trim() || '',
        disasterType: formData.disasterType?.trim() || '',
        dateCommenced: formData.dateCommenced ? new Date(formData.dateCommenced) : null,
        dateEnded: formData.dateEnded ? new Date(formData.dateEnded) : null,
        riskLevel: formData.riskLevel?.trim() || '',
        
        // Disaster Location - added at the base level
        latitude: formData.disasterLocation.latitude || null,
        longitude: formData.disasterLocation.longitude || null,
        
        // Human Effect - ensure all numbers are properly parsed
        humanEffect: {
          affectedFamilies: parseInt(formData.humanEffect?.affectedFamilies) || 0,
          affectedPeople: parseInt(formData.humanEffect?.affectedPeople) || 0,
          deaths: parseInt(formData.humanEffect?.deaths) || 0,
          injured: parseInt(formData.humanEffect?.injured) || 0,
          missing: parseInt(formData.humanEffect?.missing) || 0
        },
        
        // Infrastructure - ensure all numbers are properly parsed
        infrastructure: {
          housesFullyDamaged: parseInt(formData.infrastructure?.housesFullyDamaged) || 0,
          housesPartiallyDamaged: parseInt(formData.infrastructure?.housesPartiallyDamaged) || 0,
          smallInfrastructureDamages: parseInt(formData.infrastructure?.smallInfrastructureDamages) || 0,
          criticalInfrastructureDamages: formData.infrastructure?.criticalInfrastructureDamages || []
        },
        
        // Safe Locations - validate coordinates and numbers
        safeLocations: formData.safeLocations.map(location => ({
          name: location.name?.trim() || '',
          latitude: parseFloat(location.latitude) || 0,
          longitude: parseFloat(location.longitude) || 0,
          currentHeadcount: parseInt(location.currentHeadcount) || 0,
          capacity: parseInt(location.capacity) || 0
        })),
        
        // Resource Requests - ensure proper structure and defaults
        resourceRequests: formData.resourceRequests.map(request => ({
          type: request.type?.trim() || '',
          requestedTimestamp: request.requestedTimestamp || new Date().toISOString(),
          contactDetails: {
            contactPersonName: request.contactDetails?.contactPersonName?.trim() || '',
            contactMobileNumber: request.contactDetails?.contactMobileNumber?.trim() || ''
          },
          description: request.description?.trim() || '',
          status: request.status || 'Request Received'
        })),
        
        // Volunteer Requests - clean and validate
        volunteerNeeded: Boolean(formData.volunteerNeeded),
        volunteerRequests: Object.entries(formData.volunteerRequests || {}).reduce((acc, [key, value]) => {
          acc[key] = parseInt(value) || 0;
          return acc;
        }, {})
      };
  
      // Validate required fields
      const requiredFields = ['district', 'dsDivision', 'disasterType', 'dateCommenced'];
      const missingFields = requiredFields.filter(field => !cleanFormData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      // Validate safe location coordinates
      const invalidLocations = cleanFormData.safeLocations.filter(
        loc => !isValidCoordinate(loc.latitude, loc.longitude)
      );
      
      if (invalidLocations.length > 0) {
        throw new Error('Invalid coordinates found in safe locations');
      }
  
      // Create the document and get the auto-generated ID
      const disasterRef = await addDoc(collection(db, 'verifiedDisasters'), cleanFormData);
      
      // Update the document with its ID as the disasterId
      await updateDoc(disasterRef, {
        disasterId: disasterRef.id
      });
      
      console.log('Report saved successfully with ID: ', disasterRef.id);
      alert('Report submitted successfully!');
      window.location.href = '/dmc/home';
      
      return disasterRef.id;
  
    } catch (error) {
      console.error('Error saving report: ', error);
      alert(`Failed to submit report: ${error.message}`);
      throw error;
    }
  };
  
  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    const validLat = typeof lat === 'number' && lat >= -90 && lat <= 90;
    const validLng = typeof lng === 'number' && lng >= -180 && lng <= 180;
    return validLat && validLng;
  };

  const updateDisasterDoc = async (currentStepData) => {
    try {
      if (!formData.disasterId) {
        // Create new document with auto-generated ID
        const disasterRef = doc(collection(db, 'verifiedDisasters'));
        const newDisasterId = disasterRef.id;
        
        await setDoc(disasterRef, {
          disasterId: newDisasterId,
          reportDateTime: new Date(),
          currentStep: currentStep,
          ...currentStepData
        });

        setFormData(prev => ({
          ...prev,
          disasterId: newDisasterId
        }));
      } else {
        // Update existing document
        const disasterRef = doc(db, 'verifiedDisasters', formData.disasterId);
        await updateDoc(disasterRef, {
          currentStep: currentStep,
          ...currentStepData
        });
      }
    } catch (error) {
      console.error('Error updating disaster document:', error);
      // Handle error appropriately
    }
  };

  const handleStepSubmit = async () => {
    let stepData = {};
  
    switch (currentStep) {
      case 1:
        stepData = {
          district: formData.district,
          dsDivision: formData.dsDivision,
          disasterType: formData.disasterType,
          dateCommenced: formData.dateCommenced,
          dateEnded: formData.dateEnded,
          riskLevel: formData.riskLevel
        };
        break;
      
      case 2:
        stepData = {
          humanEffect: formData.humanEffect
        };
        break;
      
      case 3:
        stepData = {
          infrastructure: formData.infrastructure
        };
        break;
      
      case 4:
        // Add safe locations to subcollection
        if (formData.safeLocations.length > 0) {
          for (const location of formData.safeLocations) {
            await addSubcollectionDoc('safeLocations', location);
          }
        }
        stepData = {
          hasSafeLocations: formData.safeLocations.length > 0
        };
        break;
      
      case 5:
        // Add resource requests to subcollection
        if (formData.resourceRequests.length > 0) {
          for (const request of formData.resourceRequests) {
            await addSubcollectionDoc('resourceRequests', request);
          }
        }
        stepData = {
          hasResourceRequests: formData.resourceRequests.length > 0
        };
        break;
      
      case 6:
        // Add volunteer requests to subcollection
        if (formData.volunteerNeeded && Object.keys(formData.volunteerRequests).length > 0) {
          await addSubcollectionDoc('volunteerRequests', {
            requests: formData.volunteerRequests
          });
        }
        stepData = {
          volunteerNeeded: formData.volunteerNeeded,
          hasVolunteerRequests: Object.keys(formData.volunteerRequests).length > 0
        };
        break;
      
      case 7:
        // Final submission - update status
        stepData = {
          status: 'completed',
          completedAt: new Date()
        };
        break;
    }
  
    await updateDisasterDoc(stepData);
  };

  // Modify the Next/Submit button click handler
const handleNextClick = async () => {
  if (validateStep(currentStep)) {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final submission - save the entire report
      await handleSaveReport();
    }
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepperProgress()}

      <div className="mb-8">
        {renderStepContent()}
      </div>

      <div className="flex justify-between">
        <button
          className="px-4 py-2 flex items-center gap-2 text-gray-600 disabled:opacity-50"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          onClick={handleNextClick}
          disabled={!validateStep(currentStep)}
        >
          {currentStep === 7 ? (
            <>
              Save Report
              <Save className="w-4 h-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}