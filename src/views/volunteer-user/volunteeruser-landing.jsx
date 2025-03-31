import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { Users, AlertTriangle, Check, MapPin, Heart, Info, X, Plus, Minus, Clock } from 'lucide-react';
import NavigationBar from '../../utils/Navbar';
import DisasterDetailsPopup from './DisasterDetailsPopup';

const VOLUNTEER_CATEGORIES = {
  "Emergency Response": ["Search and Rescue (SAR)", "Medical Assistance", "Firefighting Support", "Evacuation Assistance", "Damage Assessment"],
  "Relief and Humanitarian Aid": ["Food Distribution", "Shelter Assistance", "Clothing & Supplies Distribution", "Water, Sanitation, and Hygiene (WASH) Support"],
  "Psychosocial Support": ["Counseling and Psychological First Aid", "Childcare & Education", "Community Support"],
  "Technical Support": ["Communication & IT Support", "Transportation & Logistics", "GIS & Mapping"],
  "Recovery & Reconstruction": ["Debris Removal & Cleanup", "Rebuilding Infrastructure", "Livelihood Restoration"],
  "Disaster Preparedness": ["Community Training & Drills"],
  "Animal Rescue": ["Animal Evacuation & Shelter", "Wildlife Conservation"]
};

const VolunteerLanding = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalOpenDisasters: 0,
    approvedDisasters: 0,
    approvedInRegion: 0,
    assignedDisasters: 0,
    totalHoursLogged: 0,
    approvedHours: 0
  });
  const [assignedDisasters, setAssignedDisasters] = useState([]);
  const [availableDisasters, setAvailableDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loggedHours, setLoggedHours] = useState([]);
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [selectedDisasterForLogging, setSelectedDisasterForLogging] = useState(null);

  // Function to get user ID from IndexedDB
  const getUserIdFromIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('firebaseLocalStorageDb');
      
      request.onerror = () => reject('Error opening IndexedDB');
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['firebaseLocalStorage'], 'readonly');
        const store = transaction.objectStore('firebaseLocalStorage');
        const userRequest = store.get('firebase:authUser:[DEFAULT]');
        
        userRequest.onerror = () => reject('Error getting user data');
        
        userRequest.onsuccess = () => {
          if (userRequest.result && userRequest.result.uid) {
            resolve(userRequest.result.uid);
          } else {
            reject('User data not found in IndexedDB');
          }
        };
      };
    });
  };

  // Fetch user data and stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get user ID from multiple sources
        let userId = auth.currentUser?.uid;
        
        if (!userId) {
          userId = localStorage.getItem('userId');
        }
        
        if (!userId) {
          try {
            userId = await getUserIdFromIndexedDB();
          } catch (indexedDBError) {
            console.log('Could not get user ID from IndexedDB:', indexedDBError);
          }
        }

        if (!userId) {
          console.error('User ID not found');
          return;
        }

        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...userData, uid: userId }); // Ensure uid is set in user object

          // Set preferences from user data or empty array
          setPreferences(userData.disasterCategories || []);

          // Fetch all disasters stats
          const disastersSnapshot = await getDocs(collection(db, 'verifiedDisasters'));
          const approvedSnapshot = await getDocs(
            query(collection(db, 'verifiedVolunteer'), where('volunteerStatus', '==', 'Approved'))
          );

          // Calculate stats
          const totalOpenDisasters = disastersSnapshot.size;
          const approvedDisasters = approvedSnapshot.size;
          const approvedInRegion = approvedSnapshot.docs.filter(
            (doc) => doc.data().district === userData.district && 
                    doc.data().division === userData.dsDivision
          ).length;

          // Fetch assigned disasters
          if (userData.assignedDisasterIds && userData.assignedDisasterIds.length > 0) {
            const assignedDisastersPromises = userData.assignedDisasterIds.map(async (disasterId) => {
              const disasterDoc = await getDoc(doc(db, 'verifiedVolunteer', disasterId));
              return disasterDoc.exists() ? { id: disasterDoc.id, ...disasterDoc.data() } : null;
            });

            const assignedDisastersList = (await Promise.all(assignedDisastersPromises)).filter(Boolean);
            setAssignedDisasters(assignedDisastersList);
            setUserStats(prev => ({
              ...prev,
              totalOpenDisasters,
              approvedDisasters,
              approvedInRegion,
              assignedDisasters: assignedDisastersList.length
            }));
          } else {
            setUserStats({
              totalOpenDisasters,
              approvedDisasters,
              approvedInRegion,
              assignedDisasters: 0,
              totalHoursLogged: 0,
              approvedHours: 0
            });
          }

          // Fetch available disasters in user's region
          const availableQuery = query(
            collection(db, 'verifiedVolunteer'),
            where('volunteerStatus', '==', 'Approved'),
            where('district', '==', userData.district),
            where('dsDivision', '==', userData.dsDivision)
          );
          const availableSnapshot = await getDocs(availableQuery);
          const availableDisastersList = availableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAvailableDisasters(availableDisastersList);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch logged hours
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'volunteerHours'),
      where('volunteerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hoursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      setLoggedHours(hoursData);
      
      // Update stats
      const approvedHours = hoursData
        .filter(h => h.status === 'approved')
        .reduce((sum, h) => sum + h.hours, 0);
      
      setUserStats(prev => ({
        ...prev,
        totalHoursLogged: hoursData.length,
        approvedHours
      }));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const handleAddPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference)) {
      setPreferences([...preferences, newPreference]);
      setNewPreference('');
    }
  };

  const handleRemovePreference = (preference) => {
    setPreferences(preferences.filter(p => p !== preference));
  };

  const handleSavePreferences = async () => {
    try {
      const userId = auth.currentUser?.uid || localStorage.getItem('userId') || user?.uid;
      if (!userId) {
        console.error('No user ID available to save preferences');
        return;
      }
      await updateDoc(doc(db, 'users', userId), {
        disasterCategories: preferences
      });
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences.');
    }
  };

  const filteredAvailableDisasters = availableDisasters.filter(disaster => {
    if (!categoryFilter) return true;
    return disaster.disasterCategories?.includes(categoryFilter) || 
           Object.values(disaster.volunteerRequests || {}).some((_, key) => key.includes(categoryFilter));
  });

  const LogHoursModal = ({ disaster, onClose }) => {
    const [hours, setHours] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        // Use the user object's uid or fall back to auth.currentUser
        const volunteerId = user?.uid || auth.currentUser?.uid;
        if (!volunteerId) {
          throw new Error('No user ID available for logging hours');
        }

        await addDoc(collection(db, 'volunteerHours'), {
          disasterId: disaster.id,
          volunteerId: volunteerId,
          volunteerName: user.fullName,
          disasterType: disaster.disasterType,
          hours: parseFloat(hours),
          date: new Date(date),
          status: 'pending',
          createdAt: new Date()
        });
        onClose();
      } catch (error) {
        console.error('Error logging hours:', error);
        alert('Failed to log hours');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Log Hours for {disaster.disasterType}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Hours Worked</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {submitting ? 'Logging...' : 'Log Hours'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <NavigationBar/>
      {/* User Profile Section */}
      <div className="mb-8 space-y-4 mt-16">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold">{user?.fullName || 'Volunteer'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              user?.isRedCrossVolunteer ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.isRedCrossVolunteer ? 'Red Cross Volunteer' : 'Volunteer'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {user?.division} , {user?.district}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-sm text-gray-500">Total Open Disasters</h3>
              <p className="text-xl font-bold">{userStats.totalOpenDisasters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-sm text-gray-500">Approved Disasters</h3>
              <p className="text-xl font-bold">{userStats.approvedDisasters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-sm text-gray-500">Assigned to You</h3>
              <p className="text-xl font-bold">{userStats.assignedDisasters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-sm text-gray-500">Approved Hours</h3>
              <p className="text-xl font-bold">{userStats.approvedHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Preferences Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Volunteer Preferences</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Preference</label>
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 border rounded-lg"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
            >
              <option value="">Select a category</option>
              {Object.entries(VOLUNTEER_CATEGORIES).map(([category, subcategories]) => (
                <optgroup key={category} label={category}>
                  {subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={handleAddPreference}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Current Preferences</h3>
          {preferences.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {preferences.map(preference => (
                <div key={preference} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  {preference}
                  <button 
                    onClick={() => handleRemovePreference(preference)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No preferences selected</p>
          )}
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Save Preferences
        </button>
      </div>

      {/* Assigned Disasters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Assigned Disasters</h2>
        {assignedDisasters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disaster Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Commenced</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{disaster.disasterType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{disaster.district}, {disaster.dsDivision}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(disaster.dateCommenced)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        disaster.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        disaster.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disaster.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDisaster(disaster)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedDisasterForLogging(disaster);
                          setShowLogHoursModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Log Hours
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            You are not currently assigned to any disasters.
          </div>
        )}
      </div>

      {/* Hours Log Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Hours Log</h2>
        {loggedHours.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disaster</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loggedHours.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.disasterType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.date?.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                      entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                    {entry.comments && (
                      <div className="text-sm text-gray-500 mt-1">{entry.comments}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No hours logged yet
          </div>
        )}
      </div>

      {/* Available Disasters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Disasters Open for Volunteering in Your Area</h2>
          <div className="flex items-center gap-2">
            <select
              className="p-2 border rounded-lg text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.entries(VOLUNTEER_CATEGORIES).map(([category, subcategories]) => (
                <optgroup key={category} label={category}>
                  {subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {filteredAvailableDisasters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disaster Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Commenced</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAvailableDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{disaster.disasterType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{disaster.district}, {disaster.dsDivision}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(disaster.dateCommenced)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        disaster.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        disaster.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disaster.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDisaster(disaster)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No available disasters matching your criteria in your area.
          </div>
        )}
      </div>

      {/* Disaster Details Popup */}
      {selectedDisaster && (
        <DisasterDetailsPopup
          selectedDisaster={selectedDisaster}
          setSelectedDisaster={setSelectedDisaster}
        />
      )}

      {/* Log Hours Modal */}
      {showLogHoursModal && (
        <LogHoursModal
          disaster={selectedDisasterForLogging}
          onClose={() => setShowLogHoursModal(false)}
        />
      )}
    </div>
  );
};

export default VolunteerLanding;