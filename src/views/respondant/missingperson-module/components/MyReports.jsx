// components/MyReports.js
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

const MyReports = ({ db, auth, setAlert }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('missing'); // 'missing', 'ground', or 'matches'

  useEffect(() => {
    // Ensure the user is authenticated
    if (!auth.currentUser) {
      setAlert({
        message: "You need to be logged in to view your reports",
        type: "error"
      });
      setLoading(false);
      return;
    }

    const userId = auth.currentUser.uid;
    const fetchReports = () => {
      let reportsRef;
      let q;

      // Don't fetch reports when on matches tab
      if (activeTab === 'matches') {
        setLoading(false);
        return () => {};
      }

      if (activeTab === 'missing') {
        reportsRef = collection(db, "missingPersons");
        q = query(
          reportsRef, 
          where("reporterUid", "==", userId),
          orderBy("reportedAt", "desc")
        );
      } else {
        reportsRef = collection(db, "groundReports");
        q = query(
          reportsRef, 
          where("reporterUid", "==", userId),
          orderBy("reportedAt", "desc")
        );
      }
      
      return onSnapshot(q, (querySnapshot) => {
        const fetchedReports = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({
            id: doc.id,
            ...doc.data(),
            reportedAt: doc.data().reportedAt?.toDate() || new Date()
          });
        });
        setReports(fetchedReports);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching reports:", error);
        setAlert({
          message: "Error loading your reports",
          type: "error"
        });
        setLoading(false);
      });
    };
    
    const unsubscribe = fetchReports();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [db, auth, activeTab, setAlert]);

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, activeTab === 'missing' ? "missingPersons" : "groundReports", reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setAlert({
        message: "Report status updated successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      setAlert({
        message: "Error updating report status",
        type: "error"
      });
    }
  };

  const renderReportsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't submitted any {activeTab === 'missing' ? 'missing person' : 'ground'} reports yet.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'missing' ? (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {report.photoURL ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={report.photoURL} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {activeTab === 'missing' ? report.missingPersonName : report.personName}
                      </div>
                      {activeTab === 'missing' && report.age && (
                        <div className="text-sm text-gray-500">
                          Age: {report.age}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activeTab === 'missing' 
                    ? report.location
                      ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` 
                      : 'Unknown'
                    : report.location
                      ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` 
                      : 'Unknown'
                  }
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(report.reportedAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {report.status === 'missing' && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Missing
                    </span>
                  )}
                  {report.status === 'found' && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Found
                    </span>
                  )}
                  {report.status === 'active' && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                  {report.status === 'closed' && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Closed
                    </span>
                  )}
                  {report.status === 'matched' && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Matched
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {activeTab === 'missing' && report.status === 'missing' && (
                      <button
                        onClick={() => updateReportStatus(report.id, 'found')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Found
                      </button>
                    )}
                    
                    {activeTab === 'missing' && report.status === 'found' && (
                      <button
                        onClick={() => updateReportStatus(report.id, 'closed')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Close Case
                      </button>
                    )}
                    
                    {activeTab === 'ground' && report.status === 'active' && (
                      <button
                        onClick={() => updateReportStatus(report.id, 'closed')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Close Report
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // MatcherSection Component
  const MatcherSection = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);

    useEffect(() => {
      if (!auth.currentUser) return;

      const fetchMatches = async () => {
        try {
          setLoading(true);
          
          // Get all missing person reports by this user
          const missingQuery = query(
            collection(db, "missingPersons"),
            where("reporterUid", "==", auth.currentUser.uid)
          );
          
          const missingSnapshot = await getDocs(missingQuery);
          const missingPersons = missingSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Get all ground reports
          const groundQuery = query(collection(db, "groundReports"));
          const groundSnapshot = await getDocs(groundQuery);
          const groundReports = groundSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Find matches
          const foundMatches = [];
          missingPersons.forEach(missing => {
            groundReports.forEach(ground => {
              if (ground.personName && missing.missingPersonName &&
                  ground.personName.toLowerCase().includes(missing.missingPersonName.toLowerCase())) {
                foundMatches.push({
                  missingPersonId: missing.id,
                  missingPersonName: missing.missingPersonName,
                  missingPersonPhoto: missing.photoURL,
                  missingPersonDetails: missing.description,
                  groundReportId: ground.id,
                  groundPersonName: ground.personName,
                  groundLocation: ground.location,
                  groundReportedAt: ground.reportedAt?.toDate(),
                  groundPhotos: ground.identificationDocs?.filter(doc => doc.fileType?.startsWith('image/')),
                  matchScore: calculateMatchScore(missing, ground)
                });
              }
            });
          });

          setMatches(foundMatches);
        } catch (error) {
          console.error("Error finding matches:", error);
          setAlert({
            message: "Error loading potential matches",
            type: "error"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchMatches();
    }, [db, auth, setAlert]);

    const calculateMatchScore = (missing, ground) => {
      let score = 0;
      
      // Name match
      if (ground.personName && missing.missingPersonName &&
          ground.personName.toLowerCase().includes(missing.missingPersonName.toLowerCase())) {
        score += 50;
      }
      
      // Age match if available
      if (ground.age && missing.age && Math.abs(ground.age - missing.age) <= 5) {
        score += 20;
      }
      
      // Location proximity if available
      if (ground.location && missing.location) {
        const distance = getDistance(
          { latitude: ground.location.latitude, longitude: ground.location.longitude },
          { latitude: missing.location.latitude, longitude: missing.location.longitude }
        );
        if (distance < 50000) { // Within 50km
          score += 30;
        }
      }
      
      return score;
    };

    const getDistance = (loc1, loc2) => {
      // Haversine formula to calculate distance between two coordinates
      const R = 6371e3; // meters
      const φ1 = loc1.latitude * Math.PI/180;
      const φ2 = loc2.latitude * Math.PI/180;
      const Δφ = (loc2.latitude-loc1.latitude) * Math.PI/180;
      const Δλ = (loc2.longitude-loc1.longitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in meters
    };

    const handleConfirmMatch = async (missingId, groundId) => {
      try {
        // Update missing person status
        await updateDoc(doc(db, "missingPersons", missingId), {
          status: "found",
          foundAt: serverTimestamp(),
          groundReportId: groundId
        });
        
        // Update ground report status
        await updateDoc(doc(db, "groundReports", groundId), {
          status: "matched",
          matchedMissingPersonId: missingId
        });
        
        setAlert({
          message: "Match confirmed successfully!",
          type: "success"
        });
        
        // Refresh matches
        setMatches(matches.filter(m => m.missingPersonId !== missingId || m.groundReportId !== groundId));
        setSelectedMatch(null);
      } catch (error) {
        console.error("Error confirming match:", error);
        setAlert({
          message: "Error confirming match",
          type: "error"
        });
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No potential matches found. The system will automatically show matches here when it finds ground reports that match your missing person reports.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {matches.map((match) => (
                <li 
                  key={`${match.missingPersonId}-${match.groundReportId}`}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedMatch?.missingPersonId === match.missingPersonId ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {match.missingPersonName} ↔ {match.groundPersonName}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Match Score: {match.matchScore}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {match.groundLocation ? 
                            `${match.groundLocation.latitude.toFixed(4)}, ${match.groundLocation.longitude.toFixed(4)}` : 
                            'Location not available'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          Reported on {match.groundReportedAt?.toLocaleDateString() || 'unknown date'}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {selectedMatch && (
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-bold text-lg mb-2">Match Details</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Missing Person:</h4>
                <p>{selectedMatch.missingPersonName}</p>
                {selectedMatch.missingPersonPhoto && (
                  <img 
                    src={selectedMatch.missingPersonPhoto} 
                    alt={selectedMatch.missingPersonName} 
                    className="w-full h-auto rounded mt-2"
                  />
                )}
                {selectedMatch.missingPersonDetails && (
                  <p className="text-sm text-gray-600 mt-2">{selectedMatch.missingPersonDetails}</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Ground Report:</h4>
                <p>{selectedMatch.groundPersonName}</p>
                {selectedMatch.groundPhotos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMatch.groundPhotos.map((photo, index) => (
                      <img 
                        key={index}
                        src={photo.fileURL} 
                        alt={`Ground report ${index + 1}`} 
                        className="w-full h-auto rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleConfirmMatch(selectedMatch.missingPersonId, selectedMatch.groundReportId)}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200"
                >
                  Confirm Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">My Reports</h2>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'missing'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('missing')}
          >
            Missing Person Reports
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'ground'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('ground')}
          >
            Ground Reports
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'matches'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('matches')}
          >
            Potential Matches
          </button>
        </nav>
      </div>
      
      {activeTab === 'matches' ? <MatcherSection /> : renderReportsList()}
    </div>
  );
};

export default MyReports;