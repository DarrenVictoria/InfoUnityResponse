import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Firebase services from your initialization file
import { db, auth, storage } from '../../../../firebase';

// Components
import MissingPersonForm from './components/MissingPersonForm';
import MissingPersonsList from './components/MissingPersonsList';
import GroundReportForm from './components/GroundReportForm';
import MyReports from './components/MyReports';
import AlertBanner from './components/AlertBanner';
import NavigationBar from '../../../utils/Navbar';

function MissingPersonRegistry() {
  const [alert, setAlert] = useState(null);
  
  return (
    <Router>
      <div className="app-container">
        {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        <NavigationBar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MissingPersonForm 
                  db={db} 
                  storage={storage} 
                  auth={auth} 
                  setAlert={setAlert} 
                />
                <MissingPersonsList 
                  db={db} 
                  setAlert={setAlert} 
                />
              </div>
            } />
            <Route path="/ground-report" element={
              <GroundReportForm 
                db={db} 
                storage={storage} 
                auth={auth} 
                setAlert={setAlert} 
              />
            } />
            <Route path="/my-reports" element={
              <MyReports 
                db={db} 
                auth={auth} 
                setAlert={setAlert} 
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default MissingPersonRegistry;