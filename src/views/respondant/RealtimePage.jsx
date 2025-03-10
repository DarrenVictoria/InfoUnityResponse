import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import WarningLocationMap from '../../components/WarningLocationMap';
import VerifiedDisasterTable from '../../components/VerifiedDisasterTable';
import SriLankaMap from '../../maps/SriLankaMap';
import NavigationBar from '../../utils/Navbar';

const RealtimePage = () => {
  const [warnings, setWarnings] = useState([]);
  const [verifiedDisasters, setVerifiedDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch warnings
        const warningsRef = collection(db, 'warnings');
        const warningsSnapshot = await getDocs(warningsRef);
        const warningsData = warningsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setWarnings(warningsData);

        // Fetch verified disasters
        const verifiedRef = query(collection(db, 'verifiedDisasters'));
        const verifiedSnapshot = await getDocs(verifiedRef);
        const verifiedData = verifiedSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            datetime: data.datetime || data.dateCommenced,
            district: data.district || '',
            province: data.province || '',
            disasterType: data.disasterType || 'Unknown',
            deaths: data.deaths || 0,
            status: data.status || 'Ongoing',
            // Ensure all properties needed by SriLankaMap exist
            location: data.location || null,
            coordinates: data.coordinates || null,
            // If needed, transform location data to the format expected by SriLankaMap
            formattedLocation: {
              lat: data.coordinates?.latitude || data.location?.latitude || 0,
              lng: data.coordinates?.longitude || data.location?.longitude || 0
            }
          };
        })
        .sort((a, b) => (b.datetime?.seconds || 0) - (a.datetime?.seconds || 0));
        
        setVerifiedDisasters(verifiedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(verifiedDisasters.length / itemsPerPage));
  const currentDisasters = verifiedDisasters.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Generate pagination controls
  const renderPaginationControls = () => {
    const pageNumbers = [];
    
    // Always show first page, last page, current page, and 1 page before and after current
    const pagesToShow = new Set([
      1, 
      totalPages, 
      currentPage, 
      currentPage - 1, 
      currentPage + 1
    ].filter(page => page >= 1 && page <= totalPages));
    
    let lastRenderedPage = 0;
    
    Array.from(pagesToShow).sort((a, b) => a - b).forEach(page => {
      // Add ellipsis if there's a gap
      if (page - lastRenderedPage > 1) {
        pageNumbers.push(
          <span key={`ellipsis-${page}`} className="mx-1 px-3 py-1">...</span>
        );
      }
      
      pageNumbers.push(
        <button
          key={page}
          onClick={() => paginate(page)}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === page
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      );
      
      lastRenderedPage = page;
    });
    
    return pageNumbers;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
    <NavigationBar />
      <h1 className="text-2xl font-bold mb-6">Realtime Updates</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Sri Lanka Map (Disaster Overview) */}
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Disaster Overview</h2>
              <div className="h-[550px] sm:h-[600px] w-full">
                {/* Add error boundary around SriLankaMap */}
                {verifiedDisasters && verifiedDisasters.length > 0 ? (
                  <SriLankaMap 
                    disasters={verifiedDisasters} 
                    // Add fallback props that the component might expect
                    disasterColors={{
                      Flood: "#3B82F6",
                      Landslide: "#F97316", 
                      Drought: "#EAB308",
                      "Industrial Accident": "#EF4444",
                      "Lightning Strike": "#8B5CF6",
                      default: "#6B7280"
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No disaster data available</p>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm">
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                  <span>Verified Disasters</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="inline-block w-4 h-4 bg-gray-700 rounded-full mr-2"></span>
                  <span>Crowdsourced Reports</span>
                </div>
              </div>
            </div>

            {/* Warning Location Map */}
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Active Warnings</h2>
              <div className="h-[550px] sm:h-[600px] w-full">
                {warnings && warnings.length > 0 ? (
                  <WarningLocationMap warnings={warnings} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No active warnings</p>
                  </div>
                )}
              </div>
              
            </div>
          </div>

          {/* Verified Disaster Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              <h2 className="text-lg font-semibold">Ongoing Verified Disasters</h2>
            </div>
            
            {verifiedDisasters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No ongoing disasters reported at this time
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <VerifiedDisasterTable
                    disasters={currentDisasters}
                    tableType="ongoing"
                  />
                </div>
                
                {/* Improved Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 space-x-1">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &laquo;
                    </button>
                    
                    {renderPaginationControls()}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      {/* Offline indicator */}
      <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-lg p-3 flex items-center space-x-2 text-sm z-50">
        <div className={`w-3 h-3 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>App {navigator.onLine ? 'ready to work offline' : 'offline'}</span>
        <button 
          className="ml-2 text-gray-500 hover:text-gray-700" 
          onClick={(e) => e.currentTarget.parentNode.remove()}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RealtimePage;