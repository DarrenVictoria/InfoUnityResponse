import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc,updateDoc,setDoc} from 'firebase/firestore';
import { MapPin, Users, Home, AlertTriangle, Heart, Clock } from 'lucide-react';

const DisasterDetails = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndDisasterModal, setShowEndDisasterModal] = useState(false);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDisasterDetails = async () => {
      try {
        const disasterDoc = await getDoc(doc(db, 'verifiedDisasters', id));
        if (disasterDoc.exists()) {
          const data = disasterDoc.data();
          setDisaster({
            ...data,
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

    fetchDisasterDetails();
  }, [id]);

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold">{disaster.disasterType} Situation</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{disaster.district}, {disaster.dsDivision}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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