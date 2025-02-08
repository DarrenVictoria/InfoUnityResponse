import React, { useState } from 'react';
import { MapPin, Upload, AlertCircle, Loader  } from 'lucide-react';
import { db, storage } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import LocationSelectorPin from '../../components/LocationSelectorPin';

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

export default function PublicDisasterReport() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    disasterType: '',
    district: '',
    dsDivision: '',
    description: '',
    images: [],
    location: {
      latitude: null,
      longitude: null,
      name: ''
    }
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageUpload = async (files) => {
    if (!files.length) {
      setError('Please select at least one image.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const uploadPromises = files.map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        throw new Error('File size exceeds limit');
      }

      const uniqueFileName = `${crypto.randomUUID()}_${file.name}`;
      const storagePath = `disaster-evidence/${user.uid}/${uniqueFileName}`;
      const storageRef = ref(storage, storagePath);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      setSuccessMessage('Images uploaded successfully!');
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.disasterType || !formData.district || !formData.dsDivision || !formData.location.latitude) {
      setError('Please fill all required fields.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const reportData = {
        ...formData,
        timestamp: new Date(),
        userId: user.uid, // Attach user ID
        status: 'pending' // Default status for public reports
      };

      await addDoc(collection(db, 'publicDisasterReports'), reportData);
      setSuccessMessage('Report submitted successfully!');
      
      // Reset form after submission
      setFormData({
        disasterType: '',
        district: '',
        dsDivision: '',
        description: '',
        images: [],
        location: { latitude: null, longitude: null, name: '' }
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
          <label className="block text-sm font-medium mb-1">Disaster Type</label>
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

        <LocationSelectorPin
          onLocationSelect={(location) => {
            setFormData(prev => ({
              ...prev,
              location: {
                latitude: location.latitude,
                longitude: location.longitude,
                name: location.name
              },
              district: location.district,
              dsDivision: location.dsDivision
            }));
          }}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Provide a detailed description..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Evidence (Images)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(Array.from(e.target.files))}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50" disabled={uploading}>
          {uploading ? <Loader className="animate-spin w-5 h-5" /> : "Submit Report"}
        </button>
      </form>
    </div>
  );
}