import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { MapPin, AlertCircle, CheckCircle, ChevronsUpDown, Filter, Tally5, Users, Map, X, Search } from 'lucide-react';
import SriLankaMapReportMan from '../../maps/SriLankaMapReportMan';
import { useDebounce } from 'use-debounce';
import Supercluster from 'supercluster';

export default function DMCAdminPage() {
  const [rawReports, setRawReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [clusters, setClusters] = useState({ spatial: [], administrative: {} });
  const [filters, setFilters] = useState({
    district: 'all',
    dsDivision: 'all',
    disasterType: 'all',
    searchQuery: ''
  });
  const [mapView, setMapView] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [zoomLevel, setZoomLevel] = useState(8);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get unique values for filters
  const uniqueDistricts = useMemo(() => [...new Set(rawReports.map(r => r.district).filter(Boolean))], [rawReports]);
  const uniqueDsDivisions = useMemo(() => {
    if (filters.district === 'all') return [];
    return [...new Set(rawReports
      .filter(r => r.district === filters.district)
      .map(r => r.dsDivision)
      .filter(Boolean))];
  }, [rawReports, filters.district]);
  const uniqueDisasterTypes = useMemo(() => [...new Set(rawReports.map(r => r.disasterType).filter(Boolean))], [rawReports]);

  // Supercluster instance for spatial clustering
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 60,
      maxZoom: 16,
      map: props => ({ ...props.report }),
      reduce: (accumulated, props) => {
        // Custom reduce function if needed
      },
    });
    
    const points = filteredReports.map(report => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.longitude, report.latitude],
      },
      properties: { report }
    }));
    
    sc.load(points);
    return sc;
  }, [filteredReports]);

  // Real-time updates for reports
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'crowdsourcedReports'), where('status', '==', 'pending')),
      (snapshot) => {
        const reports = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            district: data.district || 'Unknown',
            dsDivision: data.dsDivision || 'Unknown',
            disasterType: data.disasterType || 'Unknown',
            ...data
          };
        }).filter(report => report.latitude && report.longitude);
        
        setRawReports(reports);
        setFilteredReports(reports); // Initially show all reports
      },
      (error) => {
        console.error('Error loading reports:', error);
        setError('Failed to load reports. Please try again.');
      }
    );

    return () => unsubscribe();
  }, []);

  // Apply filters whenever filters or rawReports change
  useEffect(() => {
    const filtered = rawReports.filter(report => {
      if (!report) return false;
      
      // Search filter
      const searchLower = filters.searchQuery.toLowerCase();
      const locationMatch = report.locationName?.toLowerCase()?.includes(searchLower) ?? false;
      const descriptionMatch = report.description?.toLowerCase()?.includes(searchLower) ?? false;
      const matchesSearch = filters.searchQuery === '' || locationMatch || descriptionMatch;
      
      // District filter
      const matchesDistrict = filters.district === 'all' || report.district === filters.district;
      
      // DS Division filter
      const matchesDsDivision = filters.dsDivision === 'all' || report.dsDivision === filters.dsDivision;
      
      // Disaster type filter
      const matchesDisasterType = filters.disasterType === 'all' || report.disasterType === filters.disasterType;
      
      return matchesSearch && matchesDistrict && matchesDsDivision && matchesDisasterType;
    });
    
    setFilteredReports(filtered);
  }, [filters, rawReports]);

  // Process clusters when filtered reports change
  useEffect(() => {
    const processClusters = () => {
      // Administrative clustering by district, then DS division, then disaster type
      const administrative = filteredReports.reduce((acc, report) => {
        const districtKey = report.district || 'Unknown';
        const dsDivisionKey = report.dsDivision || 'Unknown';
        const disasterTypeKey = report.disasterType || 'Unknown';
        
        if (!acc[districtKey]) acc[districtKey] = {};
        if (!acc[districtKey][dsDivisionKey]) acc[districtKey][dsDivisionKey] = {};
        if (!acc[districtKey][dsDivisionKey][disasterTypeKey]) {
          acc[districtKey][dsDivisionKey][disasterTypeKey] = [];
        }
        
        acc[districtKey][dsDivisionKey][disasterTypeKey].push(report);
        return acc;
      }, {});

      // Spatial clustering
      const spatialClusters = supercluster.getClusters([-180, -90, 180, 90], zoomLevel);

      setClusters({
        administrative,
        spatial: spatialClusters
      });
    };

    processClusters();
  }, [filteredReports, zoomLevel, supercluster]);

  const handleClusterSelect = useCallback(async (cluster) => {
    setIsLoadingReports(true);
    try {
      const reports = [];
      
      if (cluster.properties.cluster) {
        try {
          const clusterPoints = supercluster.getLeaves(cluster.properties.cluster_id, Infinity);
          reports.push(...clusterPoints.map(point => point.properties.report));
        } catch (error) {
          console.error('Error expanding cluster:', error);
          if (cluster.properties.report) {
            reports.push(cluster.properties.report);
          }
        }
      } else {
        reports.push(cluster.properties.report);
      }
      
      setSelectedCluster({
        ...cluster,
        allReports: reports
      });
      setSelectedReports(new Set());
    } finally {
      setIsLoadingReports(false);
    }
  }, [supercluster]);

  const createVerifiedDisaster = async (reportIds) => {
    if (!reportIds || reportIds.length === 0) {
      setError('Please select at least one report to verify.');
      return;
    }

    try {
      const selectedReportsData = rawReports.filter(report => reportIds.includes(report.id));

      const verifiedDisaster = {
        dateCommenced: selectedReportsData[0].timestamp || new Date(),
        dateEnded: null,
        disasterLocation: {
          latitude: selectedReportsData[0].latitude,
          longitude: selectedReportsData[0].longitude,
          name: `${selectedReportsData[0].district}, ${selectedReportsData[0].dsDivision}, Sri Lanka`
        },
        disasterType: selectedReportsData[0].disasterType,
        district: selectedReportsData[0].district,
        dsDivision: selectedReportsData[0].dsDivision,
        foodType: "dryRations",
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
        },
        predictedResources: {
          biscuits: 0,
          cannedFish: 0,
          dhal: 0,
          foodPortions: 0,
          milkPowder: 0,
          rice: 0,
          soap: 0,
          sugar: 0,
          tea: 0,
          toothpaste: 0,
          water: 0
        },
        province: "",
        reportDateTime: new Date(),
        resourceRequests: [],
        riskLevel: "Medium",
        safeLocations: [],
        status: "verified",
        volunteerRequests: {},
        crowdSourcedReportIds: selectedReportsData.map(report => report.id)
      };

      const verifiedDisasterRef = await addDoc(collection(db, 'verifiedDisasters'), verifiedDisaster);

      const updatePromises = selectedReportsData.map(report =>
        updateDoc(doc(db, 'crowdsourcedReports', report.id), {
          status: 'verified',
          verifiedDisasterId: verifiedDisasterRef.id
        })
      );

      await Promise.all(updatePromises);

      setSuccess('Verified disaster created successfully!');
      setSelectedCluster(null);
      setSelectedReports(new Set());
    } catch (err) {
      console.error('Error creating verified disaster:', err);
      setError('Failed to create verified disaster. Please try again.');
    }
  };

  const renderClusterSummary = (cluster) => {
    if (!cluster?.properties) return null;

    const sampleReport = cluster.properties.report || 
      (cluster.properties.reports?.length ? cluster.properties.reports[0] : null);
    
    if (!sampleReport) return null;

    return (
      <div className="cluster-card p-4 bg-white rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{sampleReport.disasterType || 'Unknown Disaster'}</h3>
            <p className="text-sm text-gray-600">
              <MapPin className="inline mr-1" size={14} />
              {sampleReport.district || 'Unknown district'} / {sampleReport.dsDivision || 'Unknown division'}
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {cluster.properties.point_count ? `${cluster.properties.point_count} reports` : 'Single report'}
          </span>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <Tally5 className="inline mr-1" size={14} />
            Last report: {sampleReport.timestamp?.toDate()?.toLocaleDateString() || 'Unknown date'}
          </div>
        </div>
        
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => handleClusterSelect(cluster)}
            className="text-blue-600 hover:underline text-sm"
          >
            View details
          </button>
          <button
            onClick={() => createVerifiedDisaster(
              cluster.properties.cluster ? 
                supercluster.getLeaves(cluster.properties.cluster_id, Infinity).map(p => p.properties.report.id) : 
                [cluster.properties.report.id]
            )}
            className="text-green-600 hover:underline text-sm"
          >
            Verify all
          </button>
        </div>
      </div>
    );
  };

  const clusterReports = useMemo(() => {
    return selectedCluster?.allReports || [];
  }, [selectedCluster]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4">Disaster Reports</h1>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full p-2 border rounded-lg pl-8"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))}
            />
            <Filter className="absolute left-2 top-3 text-gray-400" size={16} />
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.district}
            onChange={(e) => setFilters(prev => ({...prev, district: e.target.value, dsDivision: 'all'}))}
          >
            <option value="all">All Districts</option>
            {uniqueDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.dsDivision}
            onChange={(e) => setFilters(prev => ({...prev, dsDivision: e.target.value}))}
            disabled={filters.district === 'all'}
          >
            <option value="all">All Divisions</option>
            {uniqueDsDivisions.map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>

          <select
            className="w-full p-2 border rounded-lg"
            value={filters.disasterType}
            onChange={(e) => setFilters(prev => ({...prev, disasterType: e.target.value}))}
          >
            <option value="all">All Disaster Types</option>
            {uniqueDisasterTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMapView(true)}
            className={`flex-1 p-2 rounded-lg ${mapView ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            <Map size={16} className="inline mr-1" /> Map
          </button>
          <button
            onClick={() => setMapView(false)}
            className={`flex-1 p-2 rounded-lg ${!mapView ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            <ChevronsUpDown size={16} className="inline mr-1" /> List
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {mapView ? (
            clusters.spatial.map(cluster => (
              <div key={cluster.properties.cluster_id || cluster.id}>
                {renderClusterSummary(cluster)}
              </div>
            ))
          ) : (
            Object.entries(clusters.administrative).map(([district, dsDivisions]) => (
              <div key={district} className="mb-4">
                <h3 className="font-semibold mb-2">{district}</h3>
                {Object.entries(dsDivisions).map(([dsDivision, disasterTypes]) => (
                  <div key={dsDivision} className="ml-2 pl-2 border-l-2 border-blue-100 mb-2">
                    <h4 className="font-medium">{dsDivision}</h4>
                    {Object.entries(disasterTypes).map(([disasterType, reports]) => (
                      <div key={disasterType} className="ml-2 pl-2 border-l-2 border-green-100 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{disasterType} ({reports.length})</span>
                          <button 
                            onClick={() => createVerifiedDisaster(reports.map(r => r.id))}
                            className="text-green-600 text-xs hover:underline"
                          >
                            Verify All
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-100 text-red-600 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-100 text-green-600 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="h-full rounded-lg overflow-hidden shadow-lg bg-white">
          <SriLankaMapReportMan 
            clusters={clusters.spatial}
            selectedCluster={selectedCluster}
            onClusterClick={handleClusterSelect}
            onZoomChange={setZoomLevel}
          />
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedCluster && (
        <div className="w-96 bg-white border-l p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Cluster Details</h2>
            <button 
              onClick={() => setSelectedCluster(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {isLoadingReports ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <span className="text-gray-600">Disaster Type:</span>
                    <span>{clusterReports[0]?.disasterType || 'Unknown'}</span>
                    
                    <span className="text-gray-600">Affected People:</span>
                    <span>
                      {clusterReports.reduce((sum, r) => sum + (r?.humanEffect?.affectedPeople || 0), 0)}
                    </span>
                    
                    <span className="text-gray-600">Reports Count:</span>
                    <span>{clusterReports.length}</span>
                    
                    <span className="text-gray-600">First Reported:</span>
                    <span>
                      {clusterReports[0]?.timestamp?.toDate()?.toLocaleDateString() || 'Unknown'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => createVerifiedDisaster(clusterReports.map(r => r.id))}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Verify Entire Cluster ({clusterReports.length} reports)
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Individual Reports ({clusterReports.length})</h3>
                  {selectedReports.size > 0 && (
                    <button
                      onClick={() => createVerifiedDisaster([...selectedReports])}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Verify Selected ({selectedReports.size})
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {clusterReports.map((report, index) => (
                    <div key={report.id || index} className={`p-3 border rounded-lg ${selectedReports.has(report.id) ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedReports.has(report.id)}
                          onChange={() => setSelectedReports(prev => {
                            const next = new Set(prev);
                            next.has(report.id) ? next.delete(report.id) : next.add(report.id);
                            return next;
                          })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {report.description || 'No description available'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-1">
                            <span>Type: {report.disasterType || 'Unknown'}</span>
                            <span>Date: {report.timestamp?.toDate()?.toLocaleString() || 'Unknown'}</span>
                            <span>District: {report.district || 'Unknown'}</span>
                            <span>Division: {report.dsDivision || 'Unknown'}</span>
                          </div>
                          {report.images?.[0] && (
                            <button 
                              onClick={() => window.open(report.images[0], '_blank')}
                              className="text-blue-600 text-xs hover:underline mt-1"
                            >
                              View Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}