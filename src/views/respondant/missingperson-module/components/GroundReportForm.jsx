// components/GroundReportForm.js (continued)
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const GroundReportForm = ({ db, storage, auth, setAlert }) => {
  const [formData, setFormData] = useState({
    personName: '',
    facilityType: '',
    currentLocation: '',
    timeLogged: '',
    additionalNotes: '',
    identificationDocs: []
  });
  const [loading, setLoading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(true); // In a real app, check auth status

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];
    
    const uploadPromises = selectedFiles.map(async (file) => {
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const fileName = `ground_reports/${fileId}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileURL: downloadURL
      };
    });
    
    // Update progress (simplified)
    setFileUploadProgress(50);
    
    const uploadedFiles = await Promise.all(uploadPromises);
    setFileUploadProgress(100);
    
    return uploadedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.personName || !formData.currentLocation) {
      setAlert({ 
        message: "Please fill in all required fields", 
        type: "error" 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload identification documents
      const uploadedFiles = await uploadFiles();
      
      // Create ground report document
      const groundReportRef = await addDoc(collection(db, "groundReports"), {
        personName: formData.personName,
        facilityType: formData.facilityType,
        currentLocation: formData.currentLocation,
        timeLogged: formData.timeLogged,
        additionalNotes: formData.additionalNotes,
        identificationDocs: uploadedFiles,
        reportedAt: serverTimestamp(),
        reporterUid: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        status: 'active'
      });
      
      // Check if this matches any missing person report
      const missingPersonsRef = collection(db, "missingPersons");
      const q = query(missingPersonsRef, where("missingPersonName", "==", formData.personName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update the missing person record
        const missingPersonDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "missingPersons", missingPersonDoc.id), {
          status: "found",
          groundReportId: groundReportRef.id,
          foundAt: serverTimestamp(),
          foundLocation: formData.currentLocation
        });
        
        setAlert({ 
          message: "Ground report submitted and matching missing person record updated!", 
          type: "success" 
        });
      } else {
        setAlert({ 
          message: "Ground report submitted successfully", 
          type: "success" 
        });
      }
      
      // Reset form
      setFormData({
        personName: '',
        facilityType: '',
        currentLocation: '',
        timeLogged: '',
        additionalNotes: '',
        identificationDocs: []
      });
      setSelectedFiles([]);
      setFileUploadProgress(0);
      
    } catch (error) {
      console.error("Error submitting ground report:", error);
      setAlert({ 
        message: "Error submitting report. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              This form is for authorized ground personnel (medical staff, relief workers, etc.) to quickly report individuals found during emergency operations.
            </p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Ground Report</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="personName">
            Person's Name (if known)
          </label>
          <input
            type="text"
            id="personName"
            name="personName"
            value={formData.personName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Name or description"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="facilityType">
            Facility/Location Type
          </label>
          <select
            id="facilityType"
            name="facilityType"
            value={formData.facilityType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select type</option>
            <option value="hospital">Hospital</option>
            <option value="shelter">Relief Shelter</option>
            <option value="medicalCamp">Medical Camp</option>
            <option value="rescuePoint">Rescue Point</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="currentLocation">
            Current Location
          </label>
          <input
            type="text"
            id="currentLocation"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Location details"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="timeLogged">
            Time Logged
          </label>
          <input
            type="datetime-local"
            id="timeLogged"
            name="timeLogged"
            value={formData.timeLogged}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="additionalNotes">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            placeholder="Any additional information that might help identification..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Identification Materials
          </label>
          <div className="mt-1 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please upload clear images of the person and any available identification documents (ID cards, passports, etc.). These will help in identification and family reunification.
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 flex justify-center items-center flex-col"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4 text-center">
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload files</span>
              </label>
              <p className="pl-1 text-gray-500">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported files: Images (JPG, PNG) and Documents (PDF)
            </p>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 w-full">
                <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                <ul className="text-xs text-gray-500">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="mb-1">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {fileUploadProgress > 0 && fileUploadProgress < 100 && (
              <div className="w-full mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${fileUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setFormData({
              personName: '',
              facilityType: '',
              currentLocation: '',
              timeLogged: '',
              additionalNotes: '',
              identificationDocs: []
            })}
          >
            Clear
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Ground Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroundReportForm;