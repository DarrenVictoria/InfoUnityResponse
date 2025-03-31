import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase'; // Added auth to the import
import { collection, getDocs, doc, setDoc, updateDoc, query, where, arrayUnion, arrayRemove, getDoc, onSnapshot } from "firebase/firestore";
import { Search, Filter, Info, Check, X, Users, AlertTriangle, Clock } from 'lucide-react';

const VOLUNTEER_CATEGORIES = {
  "Emergency Response": ["Search and Rescue (SAR)", "Medical Assistance", "Firefighting Support", "Evacuation Assistance", "Damage Assessment"],
  "Relief and Humanitarian Aid": ["Food Distribution", "Shelter Assistance", "Clothing & Supplies Distribution", "Water, Sanitation, and Hygiene (WASH) Support"],
  "Psychosocial Support": ["Counseling and Psychological First Aid", "Childcare & Education", "Community Support"],
  "Technical Support": ["Communication & IT Support", "Transportation & Logistics", "GIS & Mapping"],
  "Recovery & Reconstruction": ["Debris Removal & Cleanup", "Rebuilding Infrastructure", "Livelihood Restoration"],
  "Disaster Preparedness": ["Community Training & Drills"],
  "Animal Rescue": ["Animal Evacuation & Shelter", "Wildlife Conservation"]
};

const VolunteerAdminPage = () => {
  const [verifiedDisasters, setVerifiedDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolunteerTypes, setSelectedVolunteerTypes] = useState([]);
  const [searchQueryApproved, setSearchQueryApproved] = useState('');
  const [searchQueryCannotAttend, setSearchQueryCannotAttend] = useState('');
  const [currentPageApproved, setCurrentPageApproved] = useState(1);
  const [currentPageCannotAttend, setCurrentPageCannotAttend] = useState(1);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [volunteerTypeSuggestions, setVolunteerTypeSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvedDisasters, setApprovedDisasters] = useState([]);
  const [cannotAttendDisasters, setCannotAttendDisasters] = useState([]);
  const [pendingHours, setPendingHours] = useState([]);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    redCrossVolunteers: 0,
    pendingDisasters: 0,
    approvedDisasters: 0,
    cannotAttendDisasters: 0,
    totalVolunteerRequests: 0,
    topNeededSkills: []
  });

  const [volunteerSuggestions, setVolunteerSuggestions] = useState([]);
  const [defaultVolunteers, setDefaultVolunteers] = useState([]);
  const [searchQueryVolunteer, setSearchQueryVolunteer] = useState('');

  // Fix the useEffect to properly fetch volunteers that match the disaster district and division
  useEffect(() => {
    if (selectedDisaster) {
      const fetchDisasterDetails = async () => {
        try {
          // If the disaster is in verifiedVolunteer collection, get the latest data
          if (selectedDisaster.volunteerStatus) {
            const disasterDoc = await getDoc(doc(db, 'verifiedVolunteer', selectedDisaster.id));
            if (disasterDoc.exists()) {
              const updatedData = disasterDoc.data();
              setSelectedDisaster(prev => ({...prev, ...updatedData}));
            }
          }
          
          // Fetch volunteers in the area regardless
          const fetchDefaultVolunteers = async () => {
            try {
              // Create a query to get volunteers in the same district and division
              const usersQuery = query(
                collection(db, 'users'),
                where('roles', 'array-contains', 'Volunteer'),
                where('district', '==', selectedDisaster.district),
                where('division', '==', selectedDisaster.dsDivision)
              );
          
              const usersSnapshot = await getDocs(usersQuery);
              const volunteers = [];
          
              usersSnapshot.forEach((doc) => {
                const userData = doc.data();
          
                // Calculate similarity between volunteer skills and disaster needs
                const similarity = calculateSimilarity(
                  userData.disasterCategories || [], 
                  selectedDisaster.disasterCategories || []
                );
          
                // Handle missing fields:
                // - If `isVolunteering` is missing, treat it as `false` (available for assignment)
                // - If `isRedCrossVolunteer` is missing, treat it as `false` (not a Red Cross volunteer)
                const isVolunteering = userData.isVolunteering ?? false; // Default to false if field is missing
                const isRedCrossVolunteer = userData.isRedCrossVolunteer ?? false; // Default to false if field is missing
          
                // Additional criteria checks (optional, depending on your requirements)
                const hasTransportation = userData.hasTransportation ?? true; // Default to true if field is missing
                const isPhysicallyFit = userData.isPhysicallyFit ?? true; // Default to true if field is missing
          
                // Only include volunteers who are not currently volunteering (or if the field is missing)
                if (!isVolunteering) {
                  volunteers.push({ 
                    userId: doc.id, 
                    ...userData, 
                    similarity,
                    isRedCrossVolunteer,
                    isVolunteering: isVolunteering // Include this field for clarity
                  });
                }
              });
          
              // Sort by similarity score (highest first), then by Red Cross affiliation
              volunteers.sort((a, b) => {
                if (b.similarity === a.similarity) {
                  return b.isRedCrossVolunteer - a.isRedCrossVolunteer; // Red Cross volunteers first
                }
                return b.similarity - a.similarity;
              });
          
              setDefaultVolunteers(volunteers);
            } catch (error) {
              console.error("Error fetching volunteers:", error);
            }
          };

          fetchDefaultVolunteers();
        } catch (error) {
          console.error("Error fetching disaster details:", error);
        }
      };

      fetchDisasterDetails();
    }
  }, [selectedDisaster?.id]);

  useEffect(() => {
    const q = query(collection(db, 'volunteerHours'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setPendingHours(hours);
    });
    return () => unsubscribe();
  }, []);

  // Add approval handlers
  const handleApproveHours = async (hourEntry) => {
    try {
      await updateDoc(doc(db, 'volunteerHours', hourEntry.id), {
        status: 'approved',
        reviewedBy: auth.currentUser?.displayName || 'Admin', // Fallback to 'Admin' if displayName is not available
        reviewedAt: new Date()
      });
    } catch (error) {
      console.error('Error approving hours:', error);
      alert('Failed to approve hours');
    }
  };

  const handleRejectHours = async (hourEntry) => {
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      try {
        await updateDoc(doc(db, 'volunteerHours', hourEntry.id), {
          status: 'rejected',
          comments,
          reviewedBy: auth.currentUser?.displayName || 'Admin', // Fallback to 'Admin' if displayName is not available
          reviewedAt: new Date()
        });
      } catch (error) {
        console.error('Error rejecting hours:', error);
        alert('Failed to reject hours');
      }
    }
  };

  // Improved similarity calculation function
  const calculateSimilarity = (userCategories, disasterCategories) => {
    // Handle case where either array is empty or undefined
    if (!userCategories || !disasterCategories || 
        userCategories.length === 0 || disasterCategories.length === 0) {
      return 0;
    }
    
    // Count matching categories
    const commonCategories = userCategories.filter(category => 
      disasterCategories.includes(category)
    );
    
    // Calculate percentage match
    const similarityScore = Math.round((commonCategories.length / disasterCategories.length) * 100);
    return similarityScore;
  };

  // Improved volunteer search function
  const handleSearchVolunteers = (query) => {
    setSearchQueryVolunteer(query);
    
    if (!query.trim()) {
      setVolunteerSuggestions([]);
      return;
    }
    
    const filteredVolunteers = defaultVolunteers.filter(volunteer =>
      volunteer.fullName.toLowerCase().includes(query.toLowerCase())
    );
    
    setVolunteerSuggestions(filteredVolunteers);
  };

  // Enhanced volunteer assignment function
  const handleAssignVolunteer = async (volunteer) => {
    try {
      // Update the user document to mark as volunteering
      await updateDoc(doc(db, 'users', volunteer.userId), {
        isVolunteering: true, // Set to true when assigned
        assignedDisasterIds: arrayUnion(selectedDisaster.id)
      });

      // Update the disaster document to add the volunteer
      await updateDoc(doc(db, 'verifiedVolunteer', selectedDisaster.id), {
        assignedVolunteers: arrayUnion({
          userId: volunteer.userId,
          fullName: volunteer.fullName,
          isRedCrossVolunteer: volunteer.isRedCrossVolunteer ?? false, // Handle missing field
          assignedAt: new Date().toISOString()
        })
      });

      // Update local state immediately
      setDefaultVolunteers(prev => 
        prev.map(v => v.userId === volunteer.userId ? { ...v, isVolunteering: true } : v)
      );

      setVolunteerSuggestions(prev => 
        prev.map(v => v.userId === volunteer.userId ? { ...v, isVolunteering: true } : v)
      );

      alert('Volunteer successfully assigned to this disaster!');
    } catch (error) {
      console.error('Error assigning volunteer: ', error);
      alert('Failed to assign volunteer. Please try again.');
    }
  };

  const handleUnassignVolunteer = async (volunteer) => {
    try {
      // First, update the user document to remove volunteer status
      await updateDoc(doc(db, 'users', volunteer.userId), {
        isVolunteering: false,
        assignedDisasterIds: arrayRemove(selectedDisaster.id)
      });
      
      // Then update the disaster document to remove the volunteer
      await updateDoc(doc(db, 'verifiedVolunteer', selectedDisaster.id), {
        assignedVolunteers: arrayRemove({
          userId: volunteer.userId,
          fullName: volunteer.fullName,
          isRedCrossVolunteer: volunteer.isRedCrossVolunteer || false,
          assignedAt: volunteer.assignedAt
        })
      });
      
      // Update local state to reflect changes
      setSelectedDisaster(prev => ({
        ...prev,
        assignedVolunteers: prev.assignedVolunteers 
          ? prev.assignedVolunteers.filter(v => v.userId !== volunteer.userId) 
          : []
      }));
      
      // Update the volunteer's status in the local state
      setDefaultVolunteers(prev => 
        prev.map(v => v.userId === volunteer.userId ? {...v, isVolunteering: false} : v)
      );
      
      setVolunteerSuggestions(prev => 
        prev.map(v => v.userId === volunteer.userId ? {...v, isVolunteering: false} : v)
      );
      
      alert('Volunteer successfully unassigned from this disaster!');
    } catch (error) {
      console.error('Error unassigning volunteer: ', error);
      alert('Failed to unassign volunteer. Please try again.');
    }
  };

  const itemsPerPage = 12;

  // Fetch all data and stats
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch volunteers stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalVolunteers = 0;
      let redCrossVolunteers = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.roles && userData.roles.includes('Volunteer')) {
          totalVolunteers++;
          if (userData.isRedCrossVolunteer) {
            redCrossVolunteers++;
          }
        }
      });
      
      // Fetch verified disasters with volunteer requests that don't have a status yet
      const disastersSnapshot = await getDocs(collection(db, 'verifiedDisasters'));
      const pendingDisasters = [];
      let skillsCount = {};
      
      disastersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.volunteerRequests && Object.keys(data.volunteerRequests).length > 0) {
          pendingDisasters.push({ id: doc.id, ...data, status: 'Pending' });
          
          // Count skills needed
          Object.entries(data.volunteerRequests).forEach(([skill, count]) => {
            skillsCount[skill] = (skillsCount[skill] || 0) + parseInt(count);
          });
        }
      });
      
      // Fetch disasters with status
      const approvedSnapshot = await getDocs(query(collection(db, 'verifiedVolunteer'), where('volunteerStatus', '==', 'Approved')));
      const approvedDisastersList = [];
      
      approvedSnapshot.forEach((doc) => {
        approvedDisastersList.push({ id: doc.id, ...doc.data() });
      });
      
      const cannotAttendSnapshot = await getDocs(query(collection(db, 'verifiedVolunteer'), where('volunteerStatus', '==', 'Cannot attend to')));
      const cannotAttendDisastersList = [];
      
      cannotAttendSnapshot.forEach((doc) => {
        cannotAttendDisastersList.push({ id: doc.id, ...doc.data() });
      });
      
      // Calculate top needed skills
      const topSkills = Object.entries(skillsCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }));
      
      // Update state with all fetched data
      setVerifiedDisasters(pendingDisasters);
      setFilteredDisasters(pendingDisasters);
      setApprovedDisasters(approvedDisastersList);
      setCannotAttendDisasters(cannotAttendDisastersList);
      
      // Update stats
      setStats({
        totalVolunteers,
        redCrossVolunteers,
        pendingDisasters: pendingDisasters.length,
        approvedDisasters: approvedDisastersList.length,
        cannotAttendDisasters: cannotAttendDisastersList.length,
        totalVolunteerRequests: Object.values(skillsCount).reduce((sum, count) => sum + count, 0),
        topNeededSkills: topSkills
      });
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchDisasters = async () => {
      const approvedSnapshot = await getDocs(query(collection(db, 'verifiedVolunteer'), where('volunteerStatus', '==', 'Approved')));
      const approvedDisastersList = approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApprovedDisasters(approvedDisastersList);

      const cannotAttendSnapshot = await getDocs(query(collection(db, 'verifiedVolunteer'), where('volunteerStatus', '==', 'Cannot attend to')));
      const cannotAttendDisastersList = cannotAttendSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCannotAttendDisasters(cannotAttendDisastersList);
    };

    fetchDisasters();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = verifiedDisasters;

    // Filter by search query (disaster type, district, or DS division)
    if (searchQuery) {
      filtered = filtered.filter((disaster) =>
        disaster.disasterType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disaster.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disaster.dsDivision?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected volunteer types
    if (selectedVolunteerTypes.length > 0) {
      filtered = filtered.filter((disaster) =>
        selectedVolunteerTypes.some((type) => disaster.volunteerRequests?.[type])
      );
    }

    setFilteredDisasters(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, selectedVolunteerTypes, verifiedDisasters]);

  // Handle approval for volunteering
  const handleApproveForVolunteering = async (disaster) => {
    try {
      await setDoc(doc(db, 'verifiedVolunteer', disaster.id), {
        ...disaster,
        volunteerStatus: 'Approved',
      });
      
      // Update local state immediately
      setVerifiedDisasters(prev => prev.filter(d => d.id !== disaster.id));
      setApprovedDisasters(prev => [...prev, {...disaster, volunteerStatus: 'Approved'}]);
      setStats(prev => ({
        ...prev,
        pendingDisasters: prev.pendingDisasters - 1,
        approvedDisasters: prev.approvedDisasters + 1
      }));
      
      alert('Disaster approved for volunteering!');
    } catch (error) {
      console.error('Error approving disaster for volunteering: ', error);
      alert('Failed to approve disaster for volunteering.');
    }
  };

  // Handle marking as "Cannot attend to"
  const handleCannotAttend = async (disaster) => {
    try {
      await setDoc(doc(db, 'verifiedVolunteer', disaster.id), {
        ...disaster,
        volunteerStatus: 'Cannot attend to',
      });
      
      // Update local state immediately
      setVerifiedDisasters(prev => prev.filter(d => d.id !== disaster.id));
      setCannotAttendDisasters(prev => [...prev, {...disaster, volunteerStatus: 'Cannot attend to'}]);
      setStats(prev => ({
        ...prev,
        pendingDisasters: prev.pendingDisasters - 1,
        cannotAttendDisasters: prev.cannotAttendDisasters + 1
      }));
      
      alert('Disaster marked as "Cannot attend to"!');
    } catch (error) {
      console.error('Error updating disaster status: ', error);
      alert('Failed to update disaster status.');
    }
  };

  // Generate volunteer type suggestions for autocomplete
  const handleSearchVolunteerTypes = (query) => {
    const allTypes = Object.values(VOLUNTEER_CATEGORIES).flat();
    const suggestions = allTypes.filter((type) =>
      type.toLowerCase().includes(query.toLowerCase())
    );
    setVolunteerTypeSuggestions(suggestions);
  };

  // Get top 3 most required volunteer types
  const getTopVolunteerTypes = (volunteerRequests) => {
    if (!volunteerRequests) return [];
    return Object.entries(volunteerRequests)
      .sort(([, a], [, b]) => b - a) // Sort by count in descending order
      .slice(0, 3) // Get top 3
      .map(([type]) => type); // Extract type names
  };

  // Calculate countdown in days
  const getCountdown = (dateCommenced) => {
    if (!dateCommenced) return 'Unknown';
    
    const now = new Date();
    const commencedDate = new Date(dateCommenced);
    const timeDiff = commencedDate.getTime() + 14 * 24 * 60 * 60 * 1000 - now.getTime(); // 14 days from commenced
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired';
  };

  const filteredApprovedDisasters = approvedDisasters.filter(disaster =>
    disaster.disasterType?.toLowerCase().includes(searchQueryApproved.toLowerCase()) ||
    disaster.district?.toLowerCase().includes(searchQueryApproved.toLowerCase()) ||
    disaster.dsDivision?.toLowerCase().includes(searchQueryApproved.toLowerCase())
  );

  // Filter cannot attend disasters
  const filteredCannotAttendDisasters = cannotAttendDisasters.filter(disaster =>
    disaster.disasterType?.toLowerCase().includes(searchQueryCannotAttend.toLowerCase()) ||
    disaster.district?.toLowerCase().includes(searchQueryCannotAttend.toLowerCase()) ||
    disaster.dsDivision?.toLowerCase().includes(searchQueryCannotAttend.toLowerCase())
  );

  // Pagination logic for approved disasters
  const indexOfLastApproved = currentPageApproved * itemsPerPage;
  const indexOfFirstApproved = indexOfLastApproved - itemsPerPage;
  const currentApprovedDisasters = filteredApprovedDisasters.slice(indexOfFirstApproved, indexOfLastApproved);

  // Pagination logic for cannot attend disasters
  const indexOfLastCannotAttend = currentPageCannotAttend * itemsPerPage;
  const indexOfFirstCannotAttend = indexOfLastCannotAttend - itemsPerPage;
  const currentCannotAttendDisasters = filteredCannotAttendDisasters.slice(indexOfFirstCannotAttend, indexOfLastCannotAttend);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDisasters.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Volunteer Management Dashboard</h1>

      {/* Statistics Dashboard */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Total Volunteers</h3>
              <p className="text-xl font-bold">{stats.totalVolunteers}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Red Cross Volunteers: {stats.redCrossVolunteers}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Pending Disasters</h3>
              <p className="text-xl font-bold">{stats.pendingDisasters}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Total Volunteer Requests: {stats.totalVolunteerRequests}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Approved</h3>
              <p className="text-xl font-bold">{stats.approvedDisasters}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Actionable disaster events
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Cannot Attend</h3>
              <p className="text-xl font-bold">{stats.cannotAttendDisasters}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Limited resource events
          </div>
        </div>
      </div>

      {/* Top Needed Skills */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Top Needed Skills</h2>
        <div className="flex flex-wrap gap-2">
          {stats.topNeededSkills.map(({skill, count}) => (
            <div key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
              <span>{skill}</span>
              {/* <span className="ml-2 px-2 py-0.5 bg-blue-200 rounded-full text-xs">{count}</span> */}
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Pending Volunteer Requests</h2>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center bg-white border rounded-lg overflow-hidden">
          <Search className="w-5 h-5 text-gray-500 mx-3" />
          <input
            type="text"
            placeholder="Search by disaster type, district, or DS division..."
            className="flex-1 p-2 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Volunteer Type Autocomplete Search */}
        <div className="relative">
          <div className="flex items-center bg-white border rounded-lg overflow-hidden">
            <Filter className="w-5 h-5 text-gray-500 mx-3" />
            <input
              type="text"
              placeholder="Search volunteer types..."
              className="flex-1 p-2 outline-none"
              onChange={(e) => handleSearchVolunteerTypes(e.target.value)}
            />
          </div>
          {volunteerTypeSuggestions.length > 0 && (
            <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto">
              {volunteerTypeSuggestions.map((type) => (
                <div
                  key={type}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedVolunteerTypes((prev) =>
                      prev.includes(type) ? prev : [...prev, type]
                    );
                    setVolunteerTypeSuggestions([]);
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Volunteer Types */}
        <div className="flex flex-wrap gap-2">
          {selectedVolunteerTypes.map((type) => (
            <div
              key={type}
              className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2"
            >
              {type}
              <button
                onClick={() =>
                  setSelectedVolunteerTypes((prev) => prev.filter((t) => t !== type))
                }
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Disaster Cards Grid */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((disaster) => {
            const topVolunteerTypes = getTopVolunteerTypes(disaster.volunteerRequests);
            const countdown = getCountdown(disaster.dateCommenced);

            return (
              <div
                key={disaster.id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Basic Details */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{disaster.disasterType}</h2>
                  <p className="text-sm text-gray-600">{disaster.district}, {disaster.dsDivision}</p>
                  <p className="text-sm text-gray-600">Risk Level: {disaster.riskLevel}</p>
                  <p className="text-sm text-gray-600">
                    Date Commenced: {new Date(disaster.dateCommenced).toLocaleString()}
                  </p>
                  <p className={`text-sm ${countdown === 'Expired' ? 'text-red-500' : 'text-yellow-600'}`}>
                    {countdown}
                  </p>
                </div>

                {/* Top Volunteer Types as Chips */}
                <div className="p-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {topVolunteerTypes.map((type) => (
                      <div
                        key={type}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex justify-between items-center">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                    onClick={() => handleApproveForVolunteering(disaster)}
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                    onClick={() => handleCannotAttend(disaster)}
                  >
                    <X className="w-5 h-5" />
                    Cannot Attend
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    onClick={() => setSelectedDisaster(disaster)}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No pending disaster volunteer requests found.
        </div>
      )}

      {/* Pagination */}
      {filteredDisasters.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          {Array.from({ length: Math.ceil(filteredDisasters.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              className={`px-4 py-2 mx-1 rounded-lg ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Approved Disasters Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Approved Volunteer Requests</h2>
        <div className="mb-6">
          <div className="flex items-center bg-white border rounded-lg overflow-hidden">
            <Search className="w-5 h-5 text-gray-500 mx-3" />
            <input
              type="text"
              placeholder="Search approved disasters..."
              className="flex-1 p-2 outline-none"
              value={searchQueryApproved}
              onChange={(e) => setSearchQueryApproved(e.target.value)}
            />
          </div>
        </div>
        {currentApprovedDisasters.length > 0 ? (
          <>
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border border-gray-200 text-left">Disaster Type</th>
                  <th className="p-2 border border-gray-200 text-left">District</th>
                  <th className="p-2 border border-gray-200 text-left">DS Division</th>
                  <th className="p-2 border border-gray-200 text-left">Date Commenced</th>
                  <th className="p-2 border border-gray-200 text-left">Status</th>
                  <th className="p-2 border border-gray-200 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentApprovedDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td className="p-2 border border-gray-200">{disaster.disasterType}</td>
                    <td className="p-2 border border-gray-200">{disaster.district}</td>
                    <td className="p-2 border border-gray-200">{disaster.dsDivision}</td>
                    <td className="p-2 border border-gray-200">{new Date(disaster.dateCommenced).toLocaleString()}</td>
                    <td className="p-2 border border-gray-200">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {disaster.volunteerStatus}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-200">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        onClick={() => setSelectedDisaster(disaster)}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApprovedDisasters.length > itemsPerPage && (
              <div className="mt-6 flex justify-center">
                {Array.from({ length: Math.ceil(filteredApprovedDisasters.length / itemsPerPage) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-4 py-2 mx-1 rounded-lg ${
                      currentPageApproved === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setCurrentPageApproved(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            No approved disaster volunteer requests found.
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Pending Hours Approval</h2>
        {pendingHours.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disaster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingHours.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.volunteerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.disasterType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.date?.toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.hours}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => handleApproveHours(entry)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectHours(entry)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            No pending hours to approve
          </div>
        )}
      </div>

      {/* Cannot Attend Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Cannot Attend Disasters</h2>
        <div className="mb-6">
          <div className="flex items-center bg-white border rounded-lg overflow-hidden">
            <Search className="w-5 h-5 text-gray-500 mx-3" />
            <input
              type="text"
              placeholder="Search cannot attend disasters..."
              className="flex-1 p-2 outline-none"
              value={searchQueryCannotAttend}
              onChange={(e) => setSearchQueryCannotAttend(e.target.value)}
            />
          </div>
        </div>
        {currentCannotAttendDisasters.length > 0 ? (
          <>
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border border-gray-200 text-left">Disaster Type</th>
                  <th className="p-2 border border-gray-200 text-left">District</th>
                  <th className="p-2 border border-gray-200 text-left">DS Division</th>
                  <th className="p-2 border border-gray-200 text-left">Date Commenced</th>
                  <th className="p-2 border border-gray-200 text-left">Status</th>
                  <th className="p-2 border border-gray-200 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCannotAttendDisasters.map((disaster) => (
                  <tr key={disaster.id}>
                    <td className="p-2 border border-gray-200">{disaster.disasterType}</td>
                    <td className="p-2 border border-gray-200">{disaster.district}</td>
                    <td className="p-2 border border-gray-200">{disaster.dsDivision}</td>
                    <td className="p-2 border border-gray-200">{new Date(disaster.dateCommenced).toLocaleString()}</td>
                    <td className="p-2 border border-gray-200">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {disaster.volunteerStatus}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-200">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        onClick={() => setSelectedDisaster(disaster)}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCannotAttendDisasters.length > itemsPerPage && (
              <div className="mt-6 flex justify-center">
                {Array.from({ length: Math.ceil(filteredCannotAttendDisasters.length / itemsPerPage) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-4 py-2 mx-1 rounded-lg ${
                      currentPageCannotAttend === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setCurrentPageCannotAttend(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            No "Cannot Attend" disaster volunteer requests found.
          </div>
        )}
      </div>

      {/* Popup for Advanced Details */}
      {selectedDisaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedDisaster.disasterType} in {selectedDisaster.district}</h2>
              {selectedDisaster.volunteerStatus && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedDisaster.volunteerStatus === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedDisaster.volunteerStatus}
                </span>
              )}
            </div>

            {/* Disaster Details Table */}
            <table className="w-full mb-6 border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border border-gray-200 text-left">Attribute</th>
                  <th className="p-2 border border-gray-200 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-gray-200">DS Division</td>
                  <td className="p-2 border border-gray-200">{selectedDisaster.dsDivision}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-200">Risk Level</td>
                  <td className="p-2 border border-gray-200">{selectedDisaster.riskLevel}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-200">Date Commenced</td>
                  <td className="p-2 border border-gray-200">{new Date(selectedDisaster.dateCommenced).toLocaleString()}</td>
                </tr>
                {selectedDisaster.disasterCategories && (
                  <tr>
                    <td className="p-2 border border-gray-200">Disaster Categories</td>
                    <td className="p-2 border border-gray-200">
                      {selectedDisaster.disasterCategories.join(", ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Volunteer Requests Table */}
            {selectedDisaster.volunteerRequests && Object.keys(selectedDisaster.volunteerRequests).length > 0 && (
              <>
                <h3 className="font-medium text-lg mb-4">Volunteer Requests</h3>
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border border-gray-200 text-left">Volunteer Type</th>
                      <th className="p-2 border border-gray-200 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedDisaster.volunteerRequests).map(([type, count]) => (
                      <tr key={type}>
                        <td className="p-2 border border-gray-200">{type}</td>
                        <td className="p-2 border border-gray-200">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Assigned Volunteers Section */}
            {selectedDisaster.volunteerStatus === 'Approved' && (
              <>
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Assigned Volunteers</h3>
                  <div className="border rounded-lg overflow-hidden">
                    {selectedDisaster.assignedVolunteers && selectedDisaster.assignedVolunteers.length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Assigned On</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDisaster.assignedVolunteers.map((volunteer) => (
                            <tr key={volunteer.userId} className="border-t">
                              <td className="p-2">
                                {volunteer.fullName}
                                {volunteer.isRedCrossVolunteer && 
                                  <span className="ml-2 text-red-600 font-bold">✚</span>
                                }
                              </td>
                              <td className="p-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  Active
                                </span>
                              </td>
                              <td className="p-2">
                                {volunteer.assignedAt ? new Date(volunteer.assignedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-2">
                                <button
                                  onClick={() => handleUnassignVolunteer(volunteer)}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                >
                                  Unassign
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No volunteers have been assigned to this disaster yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Volunteer Assignment Section */}
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Assign New Volunteers</h3>
                  <div className="relative mb-4">
                    <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                      <Search className="w-5 h-5 text-gray-500 mx-3" />
                      <input
                        type="text"
                        placeholder="Search volunteers by name..."
                        className="flex-1 p-2 outline-none"
                        value={searchQueryVolunteer}
                        onChange={(e) => handleSearchVolunteers(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Available Volunteers List */}
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {(searchQueryVolunteer ? volunteerSuggestions : defaultVolunteers).length > 0 ? (
                      (searchQueryVolunteer ? volunteerSuggestions : defaultVolunteers).map((volunteer) => (
                        <div
                          key={volunteer.userId}
                          className="p-3 border-b hover:bg-gray-50 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{volunteer.fullName}</span>
                            {volunteer.isRedCrossVolunteer && 
                              <span className="ml-2 text-red-600 font-bold">✚</span>
                            }
                            <div className="text-sm text-gray-500">
                              {volunteer.mobileNumber || "No contact number"}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignVolunteer(volunteer)}
                            disabled={volunteer.isVolunteering}
                            className={`px-3 py-1 rounded ${
                              volunteer.isVolunteering
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {volunteer.isVolunteering ? 'Assigned' : 'Assign'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No matching volunteers found in {selectedDisaster.district}, {selectedDisaster.dsDivision}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSelectedDisaster(null);
                  setSearchQueryVolunteer('');
                  setVolunteerSuggestions([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerAdminPage;