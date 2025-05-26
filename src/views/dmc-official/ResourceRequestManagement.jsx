import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, updateDoc, doc ,getDoc} from 'firebase/firestore';
import { Check, X, ChevronDown, ChevronUp, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,HomeIcon } from 'lucide-react';
import NavigationBar from '../../utils/Navbar';

const RESOURCE_TYPES = ["Food", "Shelter", "Clothing"];
const RESOURCE_STATUSES = ["Request Received", "Pending Approval", "Approved", "Dispatched", "Rejected"];

const ResourceRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    district: '',
    disasterType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch all resource requests from all disasters
  useEffect(() => {
    const fetchResourceRequests = async () => {
      try {
        setLoading(true);
        const disastersRef = collection(db, 'verifiedDisasters');
        const disastersSnapshot = await getDocs(disastersRef);
        
        let allRequests = [];
        
        for (const disasterDoc of disastersSnapshot.docs) {
          const disasterData = disasterDoc.data();
          if (disasterData.resourceRequests && disasterData.resourceRequests.length > 0) {
            const requestsWithDisasterInfo = disasterData.resourceRequests.map(request => ({
              ...request,
              disasterId: disasterDoc.id,
              disasterName: disasterData.disasterType,
              district: disasterData.district,
              dsDivision: disasterData.dsDivision,
              dateCommenced: disasterData.dateCommenced
            }));
            allRequests = [...allRequests, ...requestsWithDisasterInfo];
          }
        }
        
        setRequests(allRequests);
      } catch (error) {
        console.error('Error fetching resource requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResourceRequests();
  }, []);

  // Apply filters and search
  const filteredRequests = requests.filter(request => {
    // Apply status filter
    if (filters.status && request.status !== filters.status) return false;
    
    // Apply type filter
    if (filters.type && request.type !== filters.type) return false;
    
    // Apply district filter
    if (filters.district && request.district !== filters.district) return false;
    
    // Apply disaster type filter
    if (filters.disasterType && request.disasterName !== filters.disasterType) return false;
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.contactDetails.contactPersonName.toLowerCase().includes(searchLower) ||
        request.contactDetails.contactMobileNumber.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.disasterName.toLowerCase().includes(searchLower) ||
        request.district.toLowerCase().includes(searchLower) ||
        request.dsDivision.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Get unique values for filters
  const uniqueDistricts = [...new Set(requests.map(request => request.district))];
  const uniqueDisasterTypes = [...new Set(requests.map(request => request.disasterName))];

  // Update request status
  const updateRequestStatus = async (requestId, disasterId, newStatus) => {
    try {
      setUpdatingStatus(requestId);
      // Find the disaster document
      const disasterRef = doc(db, 'verifiedDisasters', disasterId);
      const disasterDoc = await getDoc(disasterRef);
      
      if (disasterDoc.exists()) {
        const disasterData = disasterDoc.data();
        const updatedRequests = disasterData.resourceRequests.map(request => {
          if (request.requestedTimestamp === requestId) {
            return { ...request, status: newStatus };
          }
          return request;
        });
        
        // Update the document
        await updateDoc(disasterRef, {
          resourceRequests: updatedRequests
        });
        
        // Update local state
        setRequests(prevRequests =>
          prevRequests.map(request => {
            if (request.requestedTimestamp === requestId && request.disasterId === disasterId) {
              return { ...request, status: newStatus };
            }
            return request;
          })
        );
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }finally {
    setUpdatingStatus(null);
  }
  };

  // Toggle request expansion
  const toggleExpandRequest = (requestId) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(requestId);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      district: '',
      disasterType: ''
    });
    setSearchTerm('');
  };

  return (

    <div className="container mx-auto px-4 py-8">
        <NavigationBar/>
      <h1 className="text-3xl font-bold mb-6 mt-12">Resource Request Management</h1>

      
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {RESOURCE_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            >
              <option value="">All Districts</option>
              {uniqueDistricts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          
          {/* Disaster Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Disaster Type</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filters.disasterType}
              onChange={(e) => setFilters({ ...filters, disasterType: e.target.value })}
            >
              <option value="">All Disasters</option>
              {uniqueDisasterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full px-3 py-2 border rounded-lg pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
          
          <div className="text-sm text-gray-600">
            Showing {filteredRequests.length} requests
          </div>
        </div>
      </div>
      
      {/* Requests Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disaster
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((request) => (
                    <React.Fragment key={`${request.disasterId}-${request.requestedTimestamp}`}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpandRequest(request.requestedTimestamp)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.type}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(request.requestedTimestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'Request Received' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.contactDetails.contactPersonName}</div>
                          <div className="text-sm text-gray-500">{request.contactDetails.contactMobileNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.disasterName}</div>
                          {/* <div className="text-sm text-gray-500">
                            {request.dateCommenced ? new Date(request.dateCommenced).toLocaleDateString() : 'N/A'}
                          </div> */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.district}</div>
                          <div className="text-sm text-gray-500">{request.dsDivision}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {expandedRequest === request.requestedTimestamp ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </td>
                      </tr>
                      {expandedRequest === request.requestedTimestamp && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-medium mb-2">Request Details</h3>
                                <div className="space-y-2">
                                  <p><span className="font-medium">Description:</span> {request.description || 'No description provided'}</p>
                                  <p><span className="font-medium">Requested At:</span> {new Date(request.requestedTimestamp).toLocaleString()}</p>
                                  <p><span className="font-medium">Disaster ID:</span> {request.disasterId}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium mb-2">Update Status</h3>
                                <div className="flex flex-wrap gap-2">
                                  {RESOURCE_STATUSES.map(status => (
                                    <button
                                        onClick={() => updateRequestStatus(request.requestedTimestamp, request.disasterId, status)}
                                        disabled={updatingStatus === request.requestedTimestamp}
                                        className={`px-3 py-1 rounded-full text-sm 
                                          ${request.status === status ? 
                                            status === 'Approved' ? 'bg-green-200 text-green-800 border border-green-300' :
                                            status === 'Request Received' ? 'bg-blue-200 text-blue-800 border border-blue-300' :
                                            status === 'Pending Approval' ? 'bg-yellow-200 text-yellow-800 border border-yellow-300' :
                                            status === 'Dispatched' ? 'bg-purple-200 text-purple-800 border border-purple-300' :
                                            'bg-red-200 text-red-800 border border-red-300' :
                                            'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}
                                          ${updatingStatus === request.requestedTimestamp ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                      >
                                        {status}
                                      </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No resource requests found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredRequests.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredRequests.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">First</span>
                      <ChevronLeft className="h-5 w-5" />
                      <ChevronLeft className="h-5 w-5 -ml-2" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium 
                            ${currentPage === pageNum ? 
                              'z-10 bg-blue-50 border-blue-500 text-blue-600' : 
                              'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Last</span>
                      <ChevronRight className="h-5 w-5" />
                      <ChevronRight className="h-5 w-5 -ml-2" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceRequestManagement;