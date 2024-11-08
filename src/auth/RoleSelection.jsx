import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/login/${selectedRole.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Select Your Role</h1>
      </div>
      <div className="flex gap-3">
        <button
          className={`px-4 py-2 rounded ${
            selectedRole === 'Respondent' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => handleRoleSelect('Respondent')}
        >
          Respondent
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedRole === 'Volunteer' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => handleRoleSelect('Volunteer')}
        >
          Volunteer
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedRole === 'Red Cross Manager' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => handleRoleSelect('Red Cross Manager')}
        >
          Red Cross Manager
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedRole === 'DMC Admin' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => handleRoleSelect('DMC Admin')}
        >
          DMC Admin
        </button>
      </div>
      <div className="mt-5">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
