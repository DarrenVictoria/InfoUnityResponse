import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, HeartHandshake, Cross, Shield } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    { id: 'respondent', title: 'Respondent', icon: User },
    { id: 'volunteer', title: 'Volunteer', icon: HeartHandshake },
    { id: 'redcross', title: 'Red Cross Manager', icon: Cross },
    { id: 'dmc', title: 'DMC System Admin', icon: Shield },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/login/${selectedRole.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Select Your Role</h1>
      </div>
      
      <div className="w-full max-w-md space-y-3">
        {roles.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleRoleSelect(title)}
            className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${selectedRole === title 
                ? 'bg-blue-50 border-blue-500 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 mr-4">
              <Icon className={`w-5 h-5 ${selectedRole === title ? 'text-blue-500' : 'text-gray-600'}`} />
            </div>
            <span className={`text-lg font-medium ${selectedRole === title ? 'text-blue-500' : 'text-gray-700'}`}>
              {title}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium 
            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors
            shadow-sm hover:shadow-md"
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