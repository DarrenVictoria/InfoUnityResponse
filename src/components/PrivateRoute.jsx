import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const PrivateRoute = () => {
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Assuming the user's NIC number is stored in localStorage or session
        const nicNumber = localStorage.getItem('nicNumber');
        const userDoc = await getDoc(doc(db, 'users', nicNumber));

        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          // Redirect to the login page if the user is not found
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Handle error, e.g., redirect to an error page
      }
    };

    fetchUserRole();
  }, [navigate]);

  // Implement role-based access control logic here
  const isAllowed = (role) => {
    // Check the user's role and determine if they have access to the requested route
    return role === 'Respondent' || role === 'Volunteer' || role === 'Red Cross Manager' || role === 'DMC Admin';
  };

  return isAllowed(userRole) ? <Outlet /> : <div>Access Denied</div>;
};

export default PrivateRoute;