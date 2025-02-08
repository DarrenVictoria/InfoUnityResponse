import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function DisasterReportManagement() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [districtFilter, setDistrictFilter] = useState('');
  const [dsDivisionFilter, setDsDivisionFilter] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, 'publicDisasterReports'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
      setFilteredReports(reportsData);
    };

    fetchReports();
  }, []);

  const handleFilter = () => {
    const filtered = reports.filter(report => {
      const matchesDistrict = districtFilter ? report.district === districtFilter : true;
      const matchesDsDivision = dsDivisionFilter ? report.dsDivision === dsDivisionFilter : true;
      return matchesDistrict && matchesDsDivision;
    });
    setFilteredReports(filtered);
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'publicDisasterReports', id), { status: 'approved' });
    setReports(prev => prev.filter(report => report.id !== id));
    setFilteredReports(prev => prev.filter(report => report.id !== id));
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, 'publicDisasterReports', id), { status: 'rejected' });
    setReports(prev => prev.filter(report => report.id !== id));
    setFilteredReports(prev => prev.filter(report => report.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Disaster Report Management</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by District"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Filter by DS Division"
          value={dsDivisionFilter}
          onChange={(e) => setDsDivisionFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Apply Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          {filteredReports.map(report => (
            <div key={report.id} className="border rounded-lg p-4 mb-4">
              <h3 className="font-medium">{report.disasterType}</h3>
              <p className="text-sm text-gray-600">{report.district}, {report.dsDivision}</p>
              <p className="text-sm mt-2">{report.description}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(report.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(report.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Hotspots Map</h2>
          <MapContainer center={[7.8731, 80.7718]} zoom={7} className="h-96 rounded-lg">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map(report => (
              <Marker
                key={report.id}
                position={[report.location.latitude, report.location.longitude]}
              >
                <Popup>
                  <h3 className="font-medium">{report.disasterType}</h3>
                  <p className="text-sm text-gray-600">{report.district}, {report.dsDivision}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}