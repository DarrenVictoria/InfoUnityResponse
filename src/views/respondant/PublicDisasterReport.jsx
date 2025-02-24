import React, { useState } from 'react';
import { MapPin, Upload, AlertCircle, Loader, PlusCircle, XCircle } from 'lucide-react';
import { db, storage } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import LocationSelectorPin from '../../components/LocationSelectorPin';
import LocationSelector from '../../components/LocationSelector';

const DISASTER_TYPES = [
  "Flood", "Landslide", "Drought", "Cyclone", "Tsunami",
  "Coastal Erosion", "Lightning Strike", "Forest Fire",
  "Industrial Accident", "Epidemic"
];

export default function PublicDisasterReport() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    disasterType: '',
    district: '',
    dsDivision: '',
    description: '',
    images: [],
    latitude: null,
    longitude: null,
    locationName: '',
    reportType: 'single', // 'single' or 'multiple'
    beneficiaries: [], // [{name: '', idNumber: ''}]
    reporterName: '',
    reporterIdNumber: ''
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageUpload = async (files) => {
    if (!user) {
      setError("You must be logged in to upload images.");
      return;
    }
  
    setUploading(true);
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
  
    try {
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
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

      await addDoc(collection(db, 'crowdsourcedReports'), reportData);
      setSuccessMessage('Report submitted successfully!');
      
      // Reset form
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

    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Report a Disaster</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-6">
          {successMessage}
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
          />
        </div>

        <LocationSelectorPin onLocationSelect={handleLocationSelect} />

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
            capture="environment" // Use 'environment' for rear camera, 'user' for front camera
            onChange={(e) => handleImageUpload(Array.from(e.target.files))}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
          disabled={uploading}
        >
          {uploading ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : "Submit Report"}
        </button>
      </form>
    </div>
  );
}