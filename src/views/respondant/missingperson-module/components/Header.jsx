import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Header = ({ activeSection, setActiveSection }) => {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Home Link */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveSection('home')}>
          <img
            src="/logo.png" // Replace with your logo path
            alt="Missing Person Registry Logo"
            className="h-10 w-10"
          />
          <span className="text-xl font-bold text-blue-600">Missing Person Registry</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <button
            onClick={() => setActiveSection('home')}
            className={`text-gray-700 hover:text-blue-600 transition duration-200 ${
              activeSection === 'home' ? 'font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveSection('ground-report')}
            className={`text-gray-700 hover:text-blue-600 transition duration-200 ${
              activeSection === 'ground-report' ? 'font-bold' : ''
            }`}
          >
            Ground Report
          </button>
          <button
            onClick={() => setActiveSection('my-reports')}
            className={`text-gray-700 hover:text-blue-600 transition duration-200 ${
              activeSection === 'my-reports' ? 'font-bold' : ''
            }`}
          >
            My Reports
          </button>
        </nav>

        {/* User Authentication Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">Welcome, {user.displayName || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;