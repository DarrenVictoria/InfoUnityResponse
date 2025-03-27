import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '@firebase/auth';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import PreLocationSelector from '../../components/PreLocationSelector'; // Import the LocationSelector component


const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  
    const [profileData, setProfileData] = useState({
      // Common fields
      fullName: '',
      email: '',
      mobileNumber: '',
      district: '',
      division: '',
      
      // Additional vault data
      bloodType: '',
      allergies: [],
      medicalConditions: [],
      emergencyContacts: [],
      
      // Comprehensive personal vault information
      personalVaultData: {
        dateOfBirth: '',
        gender: '',
        nationality: '',
        nicNumber: '',
        permanentAddressLine1: '',
        permanentAddressLine2: '',
        parentDetails: {
          fatherName: '',
          fatherContactNumber: '',
          motherName: '',
          motherContactNumber: '',
        },
        occupation: '',
        workplaceAddress: '',
        languagesSpoken: [],
        specialSkills: [],
        documentReferences: {
          nationalID: '',
          passportNumber: '',
          drivingLicense: '',
        }
      }
    });
  
    const [passwordChange, setPasswordChange] = useState({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  
    // Fetch user profile data
    const fetchUserProfile = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserType(userData.userType || 'User');
              
              // Preserve the full structure while updating with user data
              setProfileData(prevData => ({
                ...prevData,
                ...userData,
                // Explicitly set district and division to ensure they're populated
                district: userData.district || '',
                division: userData.division || ''
              }));
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      };
  
    // Update profile handler
    const handleProfileUpdate = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Update Firestore document
          await updateDoc(doc(db, 'users', currentUser.uid), profileData);
          
          // Optionally update Firebase Auth profile
          await updateProfile(currentUser, {
            displayName: profileData.fullName
          });
  
          alert('Profile updated successfully!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    };
  
    // Vault unlock handler using Firebase authentication
    const handleVaultUnlock = async () => {
      try {
        const currentUser = auth.currentUser;
        // Reauthenticate to unlock vault
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          passwordChange.currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        
        // If reauthentication is successful, unlock vault
        setIsVaultUnlocked(true);
      } catch (error) {
        console.error('Vault unlock failed:', error);
        alert('Failed to unlock vault. Please check your current password.');
      }
    };
  
    // Location change handler
    const handleLocationChange = (district, division) => {
      setProfileData(prev => ({
        ...prev,
        district: district,
        division: division
      }));
    };
  
    // Render vault content
    const renderPersonalVault = () => {
      if (!isVaultUnlocked) {
        return (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Personal Vault Locked</h3>
            <div className="flex items-center space-x-4">
              <input 
                type="password"
                placeholder="Enter Current Password to Unlock"
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange(prev => ({
                  ...prev, 
                  currentPassword: e.target.value
                }))}
                className="flex-grow px-4 py-2 border rounded-lg"
              />
              <button 
                onClick={handleVaultUnlock}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Unlock Vault
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Enter your current account password to access sensitive information.
            </p>
          </div>
        );
      }
  
      return (
        <div className="space-y-6">
          {/* Detailed Personal Vault Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input 
                type="date"
                value={profileData.personalVaultData.dateOfBirth}
                onChange={(e) => setProfileData(prev => ({
                  ...prev, 
                  personalVaultData: {
                    ...prev.personalVaultData,
                    dateOfBirth: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={profileData.personalVaultData.gender}
                onChange={(e) => setProfileData(prev => ({
                  ...prev, 
                  personalVaultData: {
                    ...prev.personalVaultData,
                    gender: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer Not to Say">Prefer Not to Say</option>
              </select>
            </div>
          </div>
  
          {/* Emergency Contacts Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
            {profileData.emergencyContacts.map((contact, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 mb-4">
                <input 
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...profileData.emergencyContacts];
                    newContacts[index].name = e.target.value;
                    setProfileData(prev => ({
                      ...prev,
                      emergencyContacts: newContacts
                    }));
                  }}
                  className="rounded-md border-gray-300 shadow-sm"
                />
                <input 
                  type="text"
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) => {
                    const newContacts = [...profileData.emergencyContacts];
                    newContacts[index].relationship = e.target.value;
                    setProfileData(prev => ({
                      ...prev,
                      emergencyContacts: newContacts
                    }));
                  }}
                  className="rounded-md border-gray-300 shadow-sm"
                />
                <input 
                  type="tel"
                  placeholder="Contact Number"
                  value={contact.contactNumber}
                  onChange={(e) => {
                    const newContacts = [...profileData.emergencyContacts];
                    newContacts[index].contactNumber = e.target.value;
                    setProfileData(prev => ({
                      ...prev,
                      emergencyContacts: newContacts
                    }));
                  }}
                  className="rounded-md border-gray-300 shadow-sm"
                />
              </div>
            ))}
            <button 
              onClick={() => setProfileData(prev => ({
                ...prev,
                emergencyContacts: [
                  ...prev.emergencyContacts, 
                  { name: '', relationship: '', contactNumber: '' }
                ]
              }))}
              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              + Add Contact
            </button>
          </div>
  
          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                <select
                  value={profileData.bloodType}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev, 
                    bloodType: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    };
  
    useEffect(() => {
      fetchUserProfile();
    }, []);
  
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Tabs Navigation */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-4 ${
                activeTab === 'profile' 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-4 ${
                activeTab === 'password' 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
  
        {activeTab === 'profile' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Personal Profile - {userType}
            </h2>
  
            {/* Profile Fields with Location Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev, 
                    fullName: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input 
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev, 
                    mobileNumber: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <PreLocationSelector 
      onLocationChange={handleLocationChange} 
      initialDistrict={profileData.district}
      initialDivision={profileData.division}
    />
              </div>
            </div>
  
            {/* Personal Vault Section */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Vault</h3>
              {renderPersonalVault()}
            </div>
  
            {/* Update Profile Button */}
            <div className="mt-6">
              <button 
                onClick={handleProfileUpdate}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Update Profile
              </button>
            </div>
          </div>
        )}

      {/* Password Tab Content */}
      {activeTab === 'password' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input 
                type="password"
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange(prev => ({
                  ...prev, 
                  currentPassword: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange(prev => ({
                  ...prev, 
                  newPassword: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input 
                type="password"
                value={passwordChange.confirmNewPassword}
                onChange={(e) => setPasswordChange(prev => ({
                  ...prev, 
                  confirmNewPassword: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button 
              onClick={handlePasswordChange}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;