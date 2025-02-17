import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { MapPin, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Save, Trash2 } from 'lucide-react';
import SriLankaMap from '../../maps/SriLankaMap';

export default function DMCAdminPage() {
  const [reports, setReports] = useState([]); // All crowd-sourced reports
  const [clusters, setClusters] = useState({}); // Clustered reports by district and DS division
  const [selectedCluster, setSelectedCluster] = useState(null); // Selected cluster key (e.g., "District/DS Division")
  const [selectedReports, setSelectedReports] = useState([]); // Reports selected for verification
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all crowd-sourced reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'crowdsourcedReports'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(reportsData);
        clusterReports(reportsData);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Cluster reports by district and DS division
  const clusterReports = (reports) => {
    const clusters = {};

    reports.forEach(report => {
      const key = `${report.district}/${report.dsDivision}`;
      if (!clusters[key]) {
        clusters[key] = [];
      }
      clusters[key].push(report);
    });

    setClusters(clusters);
  };

  // Handle selection of a cluster
  const handleClusterSelect = (key) => {
    setSelectedCluster(key);
    setSelectedReports([]); // Reset selected reports when a new cluster is selected
  };

  // Handle selection of individual reports
  const handleReportSelect = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    } else {
      setSelectedReports(prev => [...prev, reportId]);
    }
  };

  // Create a verified disaster from selected reports
  const createVerifiedDisaster = async () => {
    if (selectedReports.length === 0) {
      setError('Please select at least one report to verify.');
      return;
    }

    try {
      // Get the selected reports' data
      const selectedReportsData = reports.filter(report => selectedReports.includes(report.id));

      // Create a verified disaster entry
      const verifiedDisaster = {
        district: selectedReportsData[0].district,
        dsDivision: selectedReportsData[0].dsDivision,
        disasterType: selectedReportsData[0].disasterType,
        latitude: selectedReportsData[0].latitude,
        longitude: selectedReportsData[0].longitude,
        locationName: selectedReportsData[0].locationName,
        timestamp: new Date(),
        status: 'verified',
        crowdSourcedReportIds: selectedReportsData.map(report => report.id), // Reference to original reports
        humanEffect: {
          affectedFamilies: selectedReportsData.reduce((sum, report) => sum + (report.humanEffect?.affectedFamilies || 0), 0),
          affectedPeople: selectedReportsData.reduce((sum, report) => sum + (report.humanEffect?.affectedPeople || 0), 0),
          deaths: selectedReportsData.reduce((sum, report) => sum + (report.humanEffect?.deaths || 0), 0),
          injured: selectedReportsData.reduce((sum, report) => sum + (report.humanEffect?.injured || 0), 0),
          missing: selectedReportsData.reduce((sum, report) => sum + (report.humanEffect?.missing || 0), 0)
        },
        infrastructure: {
          housesFullyDamaged: selectedReportsData.reduce((sum, report) => sum + (report.infrastructure?.housesFullyDamaged || 0), 0),
          housesPartiallyDamaged: selectedReportsData.reduce((sum, report) => sum + (report.infrastructure?.housesPartiallyDamaged || 0), 0),
          smallInfrastructureDamages: selectedReportsData.reduce((sum, report) => sum + (report.infrastructure?.smallInfrastructureDamages || 0), 0),
          criticalInfrastructureDamages: [...new Set(selectedReportsData.flatMap(report => report.infrastructure?.criticalInfrastructureDamages || []))]
        }
      };

      // Add the verified disaster to Firestore
      const verifiedDisasterRef = await addDoc(collection(db, 'verifiedDisasters'), verifiedDisaster);

      // Update the status of the selected crowd-sourced reports to "verified"
      const updatePromises = selectedReportsData.map(report =>
        updateDoc(doc(db, 'crowdsourcedReports', report.id), {
          status: 'verified',
          verifiedDisasterId: verifiedDisasterRef.id
        })
      );

      await Promise.all(updatePromises);

      alert('Verified disaster created successfully!');
      setSelectedCluster(null);
      setSelectedReports([]);
    } catch (err) {
      console.error('Error creating verified disaster:', err);
      setError('Failed to create verified disaster. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cluster and Verify Disaster Reports</h1>

      {/* Map Component */}
      <div className="mt-6">
        <SriLankaMap 
          selectedCluster={selectedCluster ? clusters[selectedCluster] : []}
          selectedReports={selectedReports}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cluster List */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Clusters</h2>
            <ul className="space-y-2">
              {Object.keys(clusters).map(key => (
                <li key={key}>
                  <button
                    className={`w-full text-left p-2 rounded-lg ${
                      selectedCluster === key ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleClusterSelect(key)}
                  >
                    {key} ({clusters[key].length} reports)
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Reports in Selected Cluster */}
          {selectedCluster && (
            <div className="col-span-2 border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Reports in {selectedCluster}</h2>
              <ul className="space-y-2">
                {clusters[selectedCluster].map(report => (
                  <li key={report.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleReportSelect(report.id)}
                    />
                    <div>
                      <p className="font-medium">{report.disasterType}</p>
                      <p className="text-sm text-gray-600">{report.locationName}</p>
                      <p className="text-sm text-gray-600">{new Date(report.timestamp?.toDate()).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {selectedReports.length > 0 && (
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                  onClick={createVerifiedDisaster}
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify Selected Reports ({selectedReports.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}