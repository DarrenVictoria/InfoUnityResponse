import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const VerifiedDisasterTable = ({ disasters, tableType }) => {
  const navigate = useNavigate();

  // Filter disasters based on status
  const filteredDisasters = disasters.filter(disaster => {
    if (tableType === 'ongoing') {
      return disaster.status !== 'Ended';
    } else {
      return disaster.status === 'Ended';
    }
  });

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
            {filteredDisasters.map((disaster) => (
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
                    onClick={() => navigate(`/view-disaster/${disaster.id}`)}
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

export default VerifiedDisasterTable;