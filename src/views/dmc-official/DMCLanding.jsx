import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, query, getDocs } from 'firebase/firestore';
import SriLankaMap from '../../maps/SriLankaMap';
import { PenSquare, X, AlertCircle, Users, Package } from 'lucide-react';
import Navbar from '../../utils/Navbar';


const EditProfileModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    district: userData?.district || '',
    division: userData?.division || ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, formData);
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Division</label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const DisasterTable = ({ disasters, tableType }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  // Filter disasters based on status
  const filteredDisasters = disasters.filter(disaster => {
    if (tableType === 'ongoing') {
      return disaster.status !== 'Ended';
    } else {
      return disaster.status === 'Ended';
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDisasters.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredDisasters.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format date function remains the same
  const formatDate = (timestamp) => {
    try {
      if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatResources = (resources) => {
    if (!resources) return 'None specified';
    if (Array.isArray(resources)) {
      return resources.map((resource, index) => (
        <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {resource}
        </span>
      ));
    }
    if (typeof resources === 'string') {
      return resources.split(',').map((resource, index) => (
        <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {resource.trim()}
        </span>
      ));
    }
    return 'None specified';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <div className={`px-6 py-4 border-b border-gray-200 ${tableType === 'ongoing' ? 'bg-red-50' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 justify-center">
          <AlertCircle className={`h-5 w-5 ${tableType === 'ongoing' ? 'text-red-500' : 'text-gray-500'}`} />
          {tableType === 'ongoing' ? 'Ongoing Verified Disasters' : 'Closed Verified Disasters'}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date and Time
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location Details
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disaster Info
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((disaster) => (
              <tr key={disaster.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">
                    {formatDate(disaster.datetime)}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-900 font-medium">
                    {disaster.district || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {disaster.division && `${disaster.dsDivision}, `}{disaster.district || 'N/A'}
                  </div>
                  {disaster.Location && (
                    <div className="text-xs text-gray-400">
                      {`[${disaster.Location.latitude}, ${disaster.Location.longitude}]`}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {disaster.disasterType}
                  </div>
                  {disaster.deaths > 0 && (
                    <div className="text-sm text-red-600">
                      Deaths: {disaster.deaths}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => navigate(`/disaster/${disaster.id}`)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-md transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center py-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {filteredDisasters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {tableType === 'ongoing' ? 'ongoing' : 'closed'} disasters found
        </div>
      )}
    </div>
  );
};

const DisasterTables = ({ disasters }) => {
  return (
    <div>
      <DisasterTable disasters={disasters} tableType="ongoing" />
      <DisasterTable disasters={disasters} tableType="closed" />
    </div>
  );
};

// Main DMCLanding Component
const DMCLanding = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [verifiedDisasters, setVerifiedDisasters] = useState([]);
  const [crowdsourcedReports, setCrowdsourcedReports] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Number of items per page

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: auth.currentUser.uid });
        }
      }
    };

    const fetchDisasterData = async () => {
      try {
        // Fetch verified disasters
        const verifiedQuery = query(collection(db, 'verifiedDisasters'));
        const verifiedSnapshot = await getDocs(verifiedQuery);
        const verifiedData = verifiedSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Extract coordinates from Location field
          let coordinates = null;
          if (data.Location) {
            // Handle string format "[lat, lon]"
            if (typeof data.Location === 'string') {
              const cleanStr = data.Location.replace('[', '').replace(']', '');
              const [lat, lon] = cleanStr.split(',').map(coord => parseFloat(coord.trim()));
              coordinates = { latitude: lat, longitude: lon };
            } 
            // Handle array format
            else if (Array.isArray(data.Location)) {
              coordinates = { 
                latitude: parseFloat(data.Location[0]), 
                longitude: parseFloat(data.Location[1]) 
              };
            }
            // Handle direct coordinate format
            else {
              coordinates = {
                latitude: parseFloat(data.Location),
                longitude: parseFloat(data.Location)
              };
            }
          }
          
          return {
            id: doc.id,
            ...data,
            Location: coordinates || data.Location,
            datetime: data.datetime || data.dateCommenced,
            district: data.district,
            province: data.province,
            disasterType: data.disasterType,
            deaths: data.deaths,
            volunteerRequired: data.volunteerRequired,
            resourcesRequired: Array.isArray(data.resourcesRequired) 
              ? data.resourcesRequired 
              : data.resourcesRequired?.split(',').map(r => r.trim()) || []
          };
        });
        setVerifiedDisasters(verifiedData);

        // Fetch crowdsourced reports
        const crowdsourcedQuery = query(collection(db, 'crowdsourcedReports'));
        const crowdsourcedSnapshot = await getDocs(crowdsourcedQuery);
        const crowdsourcedData = crowdsourcedSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Extract coordinates from Location field using the same logic
          let coordinates = null;
          if (data.Location) {
            if (typeof data.Location === 'string') {
              const cleanStr = data.Location.replace('[', '').replace(']', '');
              const [lat, lon] = cleanStr.split(',').map(coord => parseFloat(coord.trim()));
              coordinates = { latitude: lat, longitude: lon };
            } else if (Array.isArray(data.Location)) {
              coordinates = { 
                latitude: parseFloat(data.Location[0]), 
                longitude: parseFloat(data.Location[1]) 
              };
            } else {
              coordinates = {
                latitude: parseFloat(data.Location),
                longitude: parseFloat(data.Location)
              };
            }
          }

          return {
            id: doc.id,
            ...data,
            Location: coordinates || data.Location,
            datetime: data.datetime,
            district: data.district,
            province: data.province,
            disasterType: data.disasterType,
            description: data.description,
            reportedBy: data.reportedBy
          };
        });
        setCrowdsourcedReports(crowdsourcedData);
      } catch (error) {
        console.error('Error fetching disaster data:', error);
      }
    };

    fetchUserData();
    fetchDisasterData();
  }, []);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const navigateToSection = (path) => {
    navigate(path);
  };

  return (
    <div>
        <Navbar />
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 mt-16">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {userData?.fullName || 'Loading...'}
          </h1>
          <div className="text-gray-600 text-left">
            <div>District: {userData?.district}</div>
            <div>Division: {userData?.division}</div>
          </div>
        </div>
        <button 
          onClick={handleEditProfile}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <PenSquare className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigateToSection('/dmc/managedisasters')}
        >
          <h2 className="text-xl font-bold mb-2">Verify Disaster</h2>
          <p className="text-gray-600">Validate Crowdsourced Information</p>
        </div>

        <div 
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigateToSection('/dmc/WarningForm')}
        >
          <h2 className="text-xl font-bold mb-2">Send Warning</h2>
          <p className="text-gray-600">Update Population On A Disaster</p>
        </div>

        <div 
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigateToSection('/dmc/adddisaster')}
        >
          <h2 className="text-xl font-bold mb-2">Disaster Entry</h2>
          <p className="text-gray-600">Add In A Disaster In Order To Act On Response</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <SriLankaMap/>
      </div>

      {/* Updated Disaster Table */}
      <div className="mb-8">
        <DisasterTables disasters={verifiedDisasters} />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigateToSection('/missing-persons')}
        >
          <h2 className="text-xl font-bold mb-2">Monitor Missing Person Registry</h2>
          <p className="text-gray-600">Track and manage missing person reports</p>
        </div>

        <div 
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigateToSection('/resource-allocation')}
        >
          <h2 className="text-xl font-bold mb-2">Resource Allocation Management</h2>
          <p className="text-gray-600">Manage and allocate resources for disaster response</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onUpdate={handleProfileUpdate}
      />
    </div>

    </div>
  );
};

export default DMCLanding;