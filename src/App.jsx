import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

import UpdateNotification from './components/UpdateNotification';
import Layout from './components/Layout';
import LoadingPage from './components/Loading';

// Role-based routing
import RespondantLanding from './views/respondant/RespondantLanding';
// import VolunteerDashboard from './views/volunteer/VolunteerDashboard';
// import ManagerDashboard from './views/manager/ManagerDashboard';
// import AdminDashboard from './views/admin/AdminDashboard';

// Common Pages
import RoleSelection from './auth/RoleSelection';
import DynamicLogin from './auth/DynamicLogin';
import RespondentRegister from './auth/Register/RespondantRegister';
import VolunteerRegister from './auth/Register/VolunteerRegister';
import HomePage from './views/deployment-landing/Homepage';

function App() {
  const [userRoles, setUserRoles] = useState([]); // Array of roles
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchRoles = () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const roles = userDoc.data().roles || [];
              setUserRoles(roles);
            } else {
              navigate('/role-selection');
            }
          } catch (error) {
            console.error('Error fetching user roles:', error);
            navigate('/role-selection');
          }
        } else {
          setUserRoles([]); // No user logged in
        }
        setLoading(false); // End loading regardless of auth state
      });
    };

    checkAuthAndFetchRoles();
  }, [navigate]);

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

          {/* Fallback route */}
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
        <UpdateNotification />
      </Layout>
    </NextUIProvider>
  );
}

export default App;
