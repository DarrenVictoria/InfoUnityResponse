// components/MissingPersonForm.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const MissingPersonForm = ({ db, storage, auth, setAlert }) => {
  const [formData, setFormData] = useState({
    reporterName: '',
    contactNumber: '',
    missingPersonName: '',
    age: '',
    gender: '',
    lastSeenDate: '',
    lastSeenTime: '',
    lastKnownLocation: '',
    description: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        photo: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reporterName || !formData.contactNumber || !formData.missingPersonName) {
      setAlert({ 
        message: "Please fill in all required fields", 
        type: "error" 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload photo if provided
      let photoURL = null;
      if (formData.photo) {
        const fileId = uuidv4();
        const fileExtension = formData.photo.name.split('.').pop();
        const fileName = `missing_persons/${fileId}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Create document in Firestore
      const docRef = await addDoc(collection(db, "missingPersons"), {
        reporterName: formData.reporterName,
        contactNumber: formData.contactNumber,
        missingPersonName: formData.missingPersonName,
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        lastSeenDate: formData.lastSeenDate,
        lastSeenTime: formData.lastSeenTime,
        lastKnownLocation: formData.lastKnownLocation,
        description: formData.description,
        photoURL: photoURL,
        status: "missing",
        reportedAt: serverTimestamp(),
        // Add reporter UID if authenticated
        reporterUid: auth.currentUser ? auth.currentUser.uid : null
      });
      
      // Reset form
      setFormData({
        reporterName: '',
        contactNumber: '',
        missingPersonName: '',
        age: '',
        gender: '',
        lastSeenDate: '',
        lastSeenTime: '',
        lastKnownLocation: '',
        description: '',
        photo: null
      });
      setPhotoPreview(null);
      
      setAlert({ 
        message: "Missing person report submitted successfully", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      setAlert({ 
        message: "Error submitting report. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Report a Missing Person</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="reporterName">
            Your Name*
          </label>
          <input
            type="text"
            id="reporterName"
            name="reporterName"
            value={formData.reporterName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="contactNumber">
            Contact Number*
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="missingPersonName">
            Missing Person's Name*
          </label>
          <input
            type="text"
            id="missingPersonName"
            name="missingPersonName"
            value={formData.missingPersonName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="age">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0"
            max="120"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastSeenDate">
              Last Seen Date & Time
            </label>
            <input
              type="date"
              id="lastSeenDate"
              name="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastSeenTime">
              &nbsp;
            </label>
            <input
              type="time"
              id="lastSeenTime"
              name="lastSeenTime"
              value={formData.lastSeenTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="lastKnownLocation">
            Last Known Location
          </label>
          <input
            type="text"
            id="lastKnownLocation"
            name="lastKnownLocation"
            value={formData.lastKnownLocation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            placeholder="Physical description, clothing worn, any distinguishing features..."
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Upload Photo
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-24 h-24 border border-gray-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <input
              type="file"
              id="photo"
              name="photo"
              onChange={handlePhotoChange}
              accept="image/*"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default MissingPersonForm;