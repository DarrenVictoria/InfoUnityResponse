import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { NotificationService } from './services/notificationService';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationWrapper } from './components/NotificationWrapper';
import { WarningService } from './services/warningService';

import UpdateNotification from './components/UpdateNotification';
import Layout from './components/Layout';
import LoadingPage from './components/Loading';
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
import DisasterAI from './views/respondant/DisasterAI';
import DisasterDetailView from './views/respondant/DisasterDetailView';
import FloodDisasterSupportPage from './views/respondant/disaster-pages/FloodPage';
import LandslideDisasterSupportPage from './views/respondant/disaster-pages/LandslidePage';
import WarningLocationMap from './components/WarningLocationMap';
import RealtimePage from './views/respondant/RealtimePage';
import ResourceLocator from './views/respondant/ResourceLocator';
import VolunteerAdminPage from './views/volunteer-admin/volunteeradmin-landing';
import MissingPersonRegistry from './views/respondant/missingperson-module/MissingPersonRegistry';
import DroughtDisasterSupportPage from './views/respondant/disaster-pages/DroughtPage';
import DisasterCatalouge from './views/respondant/disaster-catalouge/DisasterCatalouge';
import AdminBlogManagement from './views/respondant/disaster-catalouge/AdminBlogManagement';



function App() {
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  // const [notifications, setNotifications] = useState([]);
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const navigate = useNavigate();


  const notificationService = new NotificationService();
  const warningService = new WarningService();

// Update the useEffect hook that checks auth:

useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser({ ...user, ...userDoc.data() });
            setUserRoles(userDoc.data().roles || []);
          } else {
            setCurrentUser(user);
            setUserRoles([]);
          }
        } else {
          setCurrentUser(null);
          setUserRoles([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []); // Remove navigate from dependencies



  const setupNotifications = async (userId, division) => {
      try {
          await notificationService.requestPermission(userId);

          notificationService.setupMessageListener((payload) => {
              const { title, body, messageId } = payload.notification;
              if (!shownNotifications.has(messageId)) {
                  addNotification({ title, body, messageId });
                  setShownNotifications(prev => new Set(prev).add(messageId));
              }
          });

          const unsubscribe = warningService.subscribeToWarnings(
              userId,
              division,
              (warning) => {
                  if (!shownNotifications.has(warning.messageId)) {
                      addNotification({
                          title: `${warning.type} Warning`,
                          body: warning.warningMessage,
                          messageId: warning.messageId
                      });
                      setShownNotifications(prev => new Set(prev).add(warning.messageId));
                  }
              }
          );

          return () => unsubscribe();
      } catch (error) {
          console.error('Error setting up notifications:', error);
      }
  };



  const playNotificationSound = () => {
      const audio = new Audio('/sounds/warning_sound.mp3');
      audio.play();
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
                      <Route path="/" element={<RespondantLanding />} />
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
                          path="/realtime"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <RealtimePage/>
                              </ProtectedRoute>
                          }
                      />

                    <Route
                          path="/warningmap"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <WarningLocationMap />
                              </ProtectedRoute>
                          }
                      />

                      <Route
                          path="/support-chat"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <DisasterAI />
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/resources"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <ResourceLocator />
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/disastercatalogue"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <DisasterCatalouge/>
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/help/flood"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <FloodDisasterSupportPage/>
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/help/landslide"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <LandslideDisasterSupportPage/>
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/help/drought"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <DroughtDisasterSupportPage/>
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
                          path="/view-disaster/:id"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <DisasterDetailView/>
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

<Route
                          path="/dmc/blogedit"
                          element={
                              <ProtectedRoute allowedRoles={['Dmc system admin']}>
                                  <AdminBlogManagement />
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/voladm/home"
                          element={
                              <ProtectedRoute allowedRoles={['Red cross manager']}>
                                  <VolunteerAdminPage />
                              </ProtectedRoute>
                          }
                      />

<Route
                          path="/missingperson"
                          element={
                              <ProtectedRoute allowedRoles={['Respondent']}>
                                  <MissingPersonRegistry />
                              </ProtectedRoute>
                          }
                      />

                      {/* Fallback route */}
                      <Route path="*" element={<div>404 - Page not found</div>} />
                  </Routes>
                  <UpdateNotification />
                  <NotificationWrapper currentUser={currentUser} />
              </Layout>
          </NextUIProvider>
      </NotificationProvider>
  );
}

export default App;

