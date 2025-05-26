import React, { useState, useEffect } from 'react';
import { MapPin, Upload, AlertCircle, Loader, PlusCircle, XCircle, WifiOff, RefreshCw } from 'lucide-react';
import { db as firestore, storage } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import LocationSelectorPin from '../../components/LocationSelectorPin';
import LocationSelector from '../../components/LocationSelector';
import { saveReportOffline, saveFileForOfflineUpload } from '../../utils/offlineStorage';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../../utils/Navbar';
const DISASTER_TYPES = [
  "Flood", "Landslide", "Drought", "Cyclone", "Tsunami",
  "Coastal Erosion", "Lightning Strike", "Forest Fire",
  "Industrial Accident", "Epidemic"
];

export default function PublicDisasterReport() {
  const { user } = useAuth();
  const { isOnline, isSyncing, syncStatus, synchronizePendingReports } = useConnectivity();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    disasterType: '',
    district: '',
    dsDivision: '',
    description: '',
    images: [],
    latitude: null,
    longitude: null,
    locationName: '',
    reportType: 'single',
    beneficiaries: [],
    reporterName: '',
    reporterIdNumber: ''
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [offlineImageIds, setOfflineImageIds] = useState([]);
  const [cachedForm, setCachedForm] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load cached form data when component mounts
  useEffect(() => {
    const savedForm = localStorage.getItem('disasterReportForm');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setFormData(parsedForm);
        setCachedForm(parsedForm);
      } catch (err) {
        console.error('Error parsing saved form:', err);
      }
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('disasterReportForm', JSON.stringify(formData));
    } catch (err) {
      console.error('Error saving form to localStorage:', err);
    }
  }, [formData]);

  // Handle redirect after successful submission
  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        navigate('/home');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, navigate]);

  const handleImageUpload = async (files) => {
    if (!user) {
      setError("You must be logged in to upload images.");
      return;
    }
  
    setUploading(true);
    
    try {
      if (isOnline) {
        // Online mode - upload directly to Firebase
        const uploadPromises = [];
        
        for (const file of files) {
          const uniqueFileName = `${Date.now()}_${file.name}`;
          const storageRef = ref(storage, `disaster-evidence/${user.uid}/${uniqueFileName}`);
        
          const uploadTask = uploadBytes(storageRef, file)
            .then((snapshot) => getDownloadURL(snapshot.ref))
            .catch((error) => {
              console.error("Upload error:", error);
              throw error;
            });
        
          uploadPromises.push(uploadTask);
        }
        
        const urls = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      } else {
        // Offline mode - store files for later upload
        const newPendingFiles = [...pendingFiles];
        const newOfflineImageIds = [...offlineImageIds];
        
        for (const file of files) {
          // Store file in IndexedDB
          const id = await saveFileForOfflineUpload(file, file.name, user.uid);
          newOfflineImageIds.push(id);
          
          // Add to pending files list for UI display
          newPendingFiles.push({
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: URL.createObjectURL(file)
          });
        }
        
        setPendingFiles(newPendingFiles);
        setOfflineImageIds(newOfflineImageIds);
        setFormData(prev => ({ 
          ...prev, 
          offlineImageIds: newOfflineImageIds 
        }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to handle images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (id) => {
    setPendingFiles(prev => prev.filter(file => file.id !== id));
    setOfflineImageIds(prev => prev.filter(fileId => fileId !== id));
    setFormData(prev => ({
      ...prev,
      offlineImageIds: prev.offlineImageIds?.filter(fileId => fileId !== id) || []
    }));
  };

  const addBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { name: '', idNumber: '' }]
    }));
  };

  const removeBeneficiary = (index) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }));
  };

  const updateBeneficiary = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((ben, i) => 
        i === index ? { ...ben, [field]: value } : ben
      )
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.name
    }));
  };

  const clearForm = () => {
    setFormData({
      disasterType: '',
      district: '',
      dsDivision: '',
      description: '',
      images: [],
      latitude: null,
      longitude: null,
      locationName: '',
      reportType: 'single',
      beneficiaries: [],
      reporterName: '',
      reporterIdNumber: ''
    });
    setPendingFiles([]);
    setOfflineImageIds([]);
    localStorage.removeItem('disasterReportForm');
    setCachedForm(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.disasterType || !formData.district || !formData.dsDivision || !formData.latitude) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.reportType === 'single' && (!formData.reporterName || !formData.reporterIdNumber)) {
      setError('Please provide reporter details.');
      return;
    }

    if (formData.reportType === 'multiple' && formData.beneficiaries.length === 0) {
      setError('Please add at least one beneficiary.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const reportData = {
        ...formData,
        timestamp: new Date(),
        userId: user?.uid || 'anonymous',
        status: 'pending'
      };

      if (isOnline) {
        // Online submission
        await addDoc(collection(firestore, 'crowdsourcedReports'), reportData);
        setSuccessMessage('Report submitted successfully!');
        setShowSuccessModal(true);
        clearForm();
      } else {
        // Offline submission - save to IndexedDB
        await saveReportOffline(reportData);
        setSuccessMessage('Report saved offline. It will be submitted when you reconnect to the internet.');
        setShowSuccessModal(true);
        clearForm();
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSyncClick = async () => {
    if (isOnline) {
      try {
        const result = await synchronizePendingReports();
        if (result.success) {
          setSuccessMessage(result.message);
          setShowSuccessModal(true);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to synchronize data.');
      }
    } else {
      setError('Cannot synchronize while offline.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative pt-20">
      <NavigationBar />
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Success!</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {successMessage || 'Operation completed successfully.'}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  You will be redirected to the home page shortly...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Report a Disaster</h1>
      
      {/* Connectivity Status */}
      <div className={`mb-4 p-3 rounded-lg ${isOnline ? 'bg-green-50' : 'bg-amber-50'}`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="text-green-700 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online Mode
            </span>
          ) : (
            <span className="text-amber-700 flex items-center">
              <WifiOff className="w-4 h-4 mr-2" />
              Offline Mode - Your report will be saved locally and uploaded when you're back online
            </span>
          )}
          
          {!isOnline && (
            <button 
              className="ml-auto text-blue-600 flex items-center gap-1 text-sm"
              onClick={handleSyncClick}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync when online
            </button>
          )}
        </div>
        
        {isSyncing && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${syncStatus.total ? (syncStatus.completed / syncStatus.total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Syncing {syncStatus.completed} of {syncStatus.total} items...
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && !showSuccessModal && (
        <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {cachedForm && (
        <div className="bg-blue-50 p-3 rounded-lg mb-6">
          <p className="text-blue-700">You have a saved form. Continue filling it or start a new one.</p>
          <button 
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
            onClick={clearForm}
          >
            Clear saved form
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Disaster Type *</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.disasterType}
            onChange={(e) => setFormData(prev => ({ ...prev, disasterType: e.target.value }))}
            required
          >
            <option value="">Select Disaster Type</option>
            {DISASTER_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location *</label>
          <LocationSelector 
            onLocationChange={(district, division) => {
              setFormData(prev => ({
                ...prev,
                district,
                dsDivision: division
              }));
            }}
            selectedDistrict={formData.district}
            selectedDivision={formData.dsDivision}
          />
        </div>

        <LocationSelectorPin 
          onLocationSelect={handleLocationSelect}
          initialLatitude={formData.latitude}
          initialLongitude={formData.longitude}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Report Type *</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.reportType}
            onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
            required
          >
            <option value="single">Single Person</option>
            <option value="multiple">Multiple People</option>
          </select>
        </div>

        {formData.reportType === 'single' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reporter Name *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.reporterName}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reporter ID Number *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.reporterIdNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterIdNumber: e.target.value }))}
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Beneficiaries *</label>
              <button
                type="button"
                onClick={addBeneficiary}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
              >
                <PlusCircle className="w-4 h-4" />
                Add Beneficiary
              </button>
            </div>
            {formData.beneficiaries.map((ben, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-2 border rounded-lg mb-2"
                    value={ben.name}
                    onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="ID Number"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={ben.idNumber}
                    onChange={(e) => updateBeneficiary(index, 'idNumber', e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBeneficiary(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Provide a detailed description..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Evidence (Images/Videos)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            capture="environment"
            onChange={(e) => handleImageUpload(Array.from(e.target.files))}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          
          {/* Display pending files for offline mode */}
          {pendingFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Pending Files (will be uploaded when online):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {pendingFiles.map(file => (
                  <div key={file.id} className="border rounded p-2 relative">
                    {file.type.startsWith('image/') ? (
                      <img src={file.preview} alt={file.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{file.type}</span>
                      </div>
                    )}
                    <p className="text-xs truncate mt-1">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => removePendingFile(file.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Display already uploaded images */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Uploaded Files:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {formData.images.map((url, index) => (
                  <div key={index} className="border rounded p-2 relative">
                    <img src={url} alt={`Uploaded ${index}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
          disabled={uploading}
        >
          {uploading ? (
            <Loader className="animate-spin w-5 h-5 mx-auto" />
          ) : isOnline ? (
            "Submit Report"
          ) : (
            "Save Report Offline"
          )}
        </button>
      </form>
    </div>
  );
}