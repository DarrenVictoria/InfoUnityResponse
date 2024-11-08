import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import logo from '../assets/logo-small.png';
import background from '../assets/hero-background.jpg';

const DynamicLogin = ({ title, path }) => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));

      if (userDoc.exists()) {
        const userRoles = userDoc.data().roles;
        const roleclean = role.charAt(0).toUpperCase() + role.slice(1);

        if (userRoles && userRoles.includes(roleclean)) {
          switch (roleclean) {
            case 'Respondent':
              navigate('/home');
              break;
            case 'Volunteer':
              navigate('/home/volunteer');
              break;
            case 'Red Cross Manager':
              navigate('/home/red-cross-manager');
              break;
            case 'DMC Admin':
              navigate('/home/dmc-admin');
              break;
            default:
              break;
          }
        } else {
          console.error('User does not have the required role');
        }
      } else {
        console.error('User document not found in Firestore');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const roleclean = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})`, opacity: 0.90 }}
    >
      <div className="relative bg-white shadow-lg rounded-lg p-8 max-w-md mx-auto z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold mb-4 text-center">
          Login as a {roleclean}
        </h3>

        {/* Input Fields */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
        >
          Login
        </button>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <a href={`/register/${role}`} className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicLogin;
