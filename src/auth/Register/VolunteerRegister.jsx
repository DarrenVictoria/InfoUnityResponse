import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import background from '../../assets/hero-background.jpg';
import logo from '../../assets/logo-small.png';
import LocationSelector from '../../components/LocationSelector'; // Import LocationSelector

// Helper function for NIC validation (1 to 13 alphanumeric characters)
const validateNIC = (nic) => /^[A-Za-z0-9]{1,13}$/.test(nic);

// Helper function for email validation
const validateEmail = (email) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

// Helper function to validate mobile number (should have 9 digits after the +94 prefix)
const validateMobileNumber = (mobileNumber) => /^\d{9}$/.test(mobileNumber); // Only validate 9 digits

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const [nicNumber, setNicNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [password, setPassword] = useState('');
  const [isRedCrossVolunteer, setIsRedCrossVolunteer] = useState(false); // Checkbox state
  const [errors, setErrors] = useState({}); // To store validation errors

  // Handle registration
  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});

    // Validate inputs
    if (!validateNIC(nicNumber)) {
      setErrors((prev) => ({ ...prev, nic: 'NIC number must be alphanumeric and between 1 to 13 characters.' }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format.' }));
      return;
    }
    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      return;
    }
    if (!selectedDistrict || !selectedDivision) {
      setErrors((prev) => ({ ...prev, location: 'District and Division are required.' }));
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      setErrors((prev) => ({ ...prev, mobile: 'Mobile number must be exactly 9 digits.' }));
      return;
    }

    try {
      const db = getFirestore();
      const auth = getAuth();

      // Check if the NIC number or email is already registered
      const nicQuery = query(collection(db, 'users'), where('nicNumber', '==', nicNumber));
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));

      const nicSnapshot = await getDocs(nicQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!nicSnapshot.empty || !emailSnapshot.empty) {
        console.error('NIC number or Email already exists');
        
        // Get the existing user (if any)
        const existingUser = nicSnapshot.empty ? emailSnapshot.docs[0] : nicSnapshot.docs[0];
        const userRoles = existingUser.data().roles || [];

        // Check if 'Volunteer' role exists, if not, add it
        if (!userRoles.includes('Volunteer')) {
          await setDoc(doc(db, 'users', existingUser.id), {
            ...existingUser.data(),
            roles: [...userRoles, 'Volunteer'],
          });
          console.log('Volunteer role added to the user');
        }

        // Redirect to login page
        navigate('/login/volunteer');
      } else {
        // If NIC and email don't exist, create a new user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Add the +94 prefix to the mobile number
        const fullMobileNumber = `+94${mobileNumber}`;

        // Create a new user document in Firestore with 'Volunteer' role
        await setDoc(doc(db, 'users', userId), {
          nicNumber,
          fullName,
          mobileNumber: fullMobileNumber, // Store the full number with +94
          email,
          district: selectedDistrict, // Store the selected district
          division: selectedDivision, // Store the selected division
          roles: ['Volunteer'], // Initialize roles array with 'Volunteer'
          userId,
          isRedCrossVolunteer, // Store the checkbox value
        });

        // Redirect to login page
        navigate('/login/volunteer');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})`, opacity: 0.90 }}
    >
      <div className="max-w-md mx-auto p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-center mb-6">Register as a Volunteer</h3>

        <div className="space-y-4">
          {/* NIC Number */}
          <input
            type="text"
            placeholder="NIC Number"
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.nic && <p className="text-red-500 text-sm">{errors.nic}</p>}

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />

          {/* Mobile Number */}
          <div className="flex">
            <span className="flex items-center bg-gray-200 text-gray-500 p-3">+94</span>
            <input
              type="text"
              placeholder="Enter 9 digits"
              value={mobileNumber}
              onChange={(e) => {
                // Allow only 9 digits to be typed
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                setMobileNumber(value);
              }}
              maxLength={9} // Ensure only 9 digits are entered
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          {/* Location Selector */}
          <LocationSelector onLocationChange={(district, division) => {
            setSelectedDistrict(district);
            setSelectedDivision(division);
          }} />
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          {/* Red Cross Volunteer Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isRedCrossVolunteer}
              onChange={(e) => setIsRedCrossVolunteer(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm">Are you a Red Cross Volunteer?</label>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{' '}
            <a href="/login/volunteer" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegister;
