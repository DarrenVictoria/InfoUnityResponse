import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { NotificationService } from './services/notificationService';
import { WarningService } from './services/warningService';

import UpdateNotification from './components/UpdateNotification';
import Layout from './components/Layout';
import LoadingPage from './components/Loading';
import { NotificationProvider } from './context/NotificationContext';
import WarningPopup from './components/WarningPopup';
import NotificationPanel from './components/NotificationPanel';

// Role-based routing
import RespondantLanding from './views/respondant/RespondantLanding';
import DMCLanding from './views/dmc-official/DMCLanding';
import DisasterDetails from './views/dmc-official/DisasterDetails'; 
// import VolunteerDashboard from './views/volunteer/VolunteerDashboard';
// import ManagerDashboard from './views/manager/ManagerDashboard';
// import AdminDashboard from './views/admin/AdminDashboard';

// Common Pages
import RoleSelection from './auth/RoleSelection';
import DynamicLogin from './auth/DynamicLogin';
import RespondentRegister from './auth/Register/RespondantRegister';
import VolunteerRegister from './auth/Register/VolunteerRegister';
import HomePage from './views/deployment-landing/Homepage';
import DisasterAddStepper from './views/dmc-official/AddDisaster';
import PublicDisasterReport from './views/respondant/PublicDisasterReport';
import DisasterReportManagement from './views/dmc-official/DisasterReportManagement';
import WarningForm from './views/dmc-official/WarningForm';

function App() {
  const [userRoles, setUserRoles] = useState([]); // Array of roles
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const notificationService = new NotificationService();
  const warningService = new WarningService();



  useEffect(() => {
    const checkAuthAndFetchRoles = () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const roles = userData.roles || [];
              setUserRoles(roles);
              setCurrentUser({ ...userData, uid: userId });

              if (userData.division) {
                setupNotifications(userId, userData.division);
              }
            } else {
              navigate('/role-selection');
            }
          } catch (error) {
            console.error('Error fetching user roles:', error);
            navigate('/role-selection');
          }
        } else {
          setUserRoles([]);
          setCurrentUser(null);
        }
        setLoading(false);
      });
    };

    checkAuthAndFetchRoles();
  }, [navigate]);

  


  const setupNotifications = async (userId, division) => {
    try {
      await notificationService.requestPermission(userId);

      notificationService.setupMessageListener((payload) => {
        const { title, body } = payload.notification;
        addNotification({ title, body });
      });

      const unsubscribe = warningService.subscribeToWarnings(
        userId,
        division,
        (warning) => {
          addNotification({
            title: `${warning.type} Warning`,
            body: warning.warningMessage
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    playNotificationSound();
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/warning_sound.mp3');
    audio.play();
  };

  const dismissNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };


  if (loading) {
    return <LoadingPage />;
  }

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!auth.currentUser) {
      return <Navigate to="/role-selection" replace />;
    }
    if (allowedRoles && !userRoles.some(role => allowedRoles.includes(role))) {
      return <div>403 - You do not have permission to access this page.</div>;
    }
    return children;
  };

  return (
    <NotificationProvider>
    <NextUIProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login/:role" element={<DynamicLogin />} />
          <Route path="/register/respondent" element={<RespondentRegister />} />
          <Route path="/register/volunteer" element={<VolunteerRegister />} />
          

          {/* Protected Route */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['Respondent']}>
                <RespondantLanding />
              </ProtectedRoute>
            }
          />

            <Route
            path="/addreport"
            element={
              <ProtectedRoute allowedRoles={['Respondent']}>
                <PublicDisasterReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dmc/home"
            element={
              <ProtectedRoute allowedRoles={['Dmc system admin']}>
                <DMCLanding />
              </ProtectedRoute>
            }
          />

        <Route
          path="/dmc/adddisaster"
          element={
            <ProtectedRoute allowedRoles={['Dmc system admin']}>
              <DisasterAddStepper />
            </ProtectedRoute>
          }
        />

        <Route
            path="/disaster/:id"
            element={
              <ProtectedRoute allowedRoles={['Dmc system admin']}>
                <DisasterDetails />
              </ProtectedRoute>
            }
          />

        <Route
          path="/dmc/managedisasters"
          element={
            <ProtectedRoute allowedRoles={['Dmc system admin']}>
              <DisasterReportManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dmc/warningform"
          element={
            <ProtectedRoute allowedRoles={['Dmc system admin']}>
              <WarningForm />
            </ProtectedRoute>
          }
        />



          {/* Fallback route */}
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
        <UpdateNotification />
        <WarningPopup />
        <NotificationPanel notifications={notifications} onDismiss={dismissNotification} />
      </Layout>
    </NextUIProvider>
    </NotificationProvider>
  );
}

export default App;

