// components/MissingPersonsList.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import MissingPersonsMap from '../../../../maps/MissingPersonsMap';

const MissingPersonsList = ({ db, setAlert }) => {
  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    // Create a query against the collection
    const missingPersonsRef = collection(db, "missingPersons");
    let q = query(missingPersonsRef, orderBy("reportedAt", "desc"));
    
    if (filter === 'active') {
      q = query(missingPersonsRef, where("status", "==", "missing"), orderBy("reportedAt", "desc"));
    } else if (filter === 'found') {
      q = query(missingPersonsRef, where("status", "==", "found"), orderBy("reportedAt", "desc"));
    }
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const persons = [];
      querySnapshot.forEach((doc) => {
        persons.push({
          id: doc.id,
          ...doc.data(),
          reportedAt: doc.data().reportedAt?.toDate() || new Date()
        });
      });
      setMissingPersons(persons);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching missing persons:", error);
      setAlert({
        message: "Error loading missing persons data",
        type: "error"
      });
      setLoading(false);
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [db, filter, setAlert]);

  // Filter persons based on search term
  // Filter persons based on search term
  const filteredPersons = missingPersons.filter(person => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      person.missingPersonName?.toLowerCase().includes(searchLower) ||
      person.location?.toLowerCase().includes(searchLower) // Changed from lastKnownLocation to location
    );
  });

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

   // Helper function to format location data based on its structure
   const formatLocation = (location) => {
    if (!location) return 'Unknown';
    
    // If location is a string, return it directly
    if (typeof location === 'string') {
      return location;
    }
    
    // If location has a name property, return that
    if (location.name) {
      return location.name;
    }
    
    // If location has latitude and longitude, return them formatted
    if (location.latitude !== undefined && location.longitude !== undefined) {
      return `${location.latitude}, ${location.longitude}`;
    }
    
    return 'Unknown';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Find Missing Persons</h2>
      
      <div className="mb-4">
        <div className="relative">
          {/* <input
            type="text"
            placeholder="Search by name, location, or case ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          /> */}
          {/* <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg> */}
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            onClick={() => setViewMode('list')}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'map' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            onClick={() => setViewMode('map')}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
            </svg>
            Map
          </button>
        </div>
        
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Cases</option>
            <option value="active">Active Cases</option>
            <option value="found">Found Persons</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPersons.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No missing persons found
                  </td>
                </tr>
              ) : (
                filteredPersons.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {person.photoURL ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={person.photoURL} alt="" />
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
                            {person.missingPersonName}
                          </div>
                          {person.status === 'found' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Found
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.age || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.lastSeenDate ? formatDate(new Date(person.lastSeenDate)) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLocation(person.location)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        
          <MissingPersonsMap filteredPersons={filteredPersons} />
        
      )}
    </div>
  );
};

export default MissingPersonsList;