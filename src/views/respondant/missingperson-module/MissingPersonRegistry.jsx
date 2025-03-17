import React, { useState } from 'react';
import { db, auth, storage } from '../../../../firebase';

// Components
import Header from './components/Header';
import MissingPersonForm from './components/MissingPersonForm';
import MissingPersonsList from './components/MissingPersonsList';
import GroundReportForm from './components/GroundReportForm';
import MyReports from './components/MyReports';
import AlertBanner from './components/AlertBanner';
import NavigationBar from '../../../utils/Navbar';

function MissingPersonRegistry() {
  const [alert, setAlert] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); // State to manage active section

  // Function to render the active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return (
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
        );
      case 'ground-report':
        return (
          <GroundReportForm
            db={db}
            storage={storage}
            auth={auth}
            setAlert={setAlert}
          />
        );
      case 'my-reports':
        return (
          <MyReports
            db={db}
            auth={auth}
            setAlert={setAlert}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Alert Banner */}
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Add padding to account for fixed navigation bar */}
      <div className="pt-16">
        {/* Header */}
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Content */}
        <main className="container mx-auto p-4">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}

export default MissingPersonRegistry;