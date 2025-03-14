// components/MyReports.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { updateDoc, doc } from 'firebase/firestore';

const MyReports = ({ db, auth, setAlert }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('missing'); // 'missing' or 'ground'

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
    return () => unsubscribe();
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
        </nav>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't submitted any {activeTab === 'missing' ? 'missing person' : 'ground'} reports yet.
          </p>
        </div>
      ) : (
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
                      ? report.lastKnownLocation || 'Unknown'
                      : report.currentLocation || 'Unknown'
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
      )}
    </div>
  );
};

export default MyReports;