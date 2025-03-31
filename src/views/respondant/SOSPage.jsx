import React, { useState } from 'react';
import { AlertTriangle, Flame, Cross, ShieldAlert, Waves, Tornado } from 'lucide-react';
import NavigationBar from '../../utils/Navbar';

const SOSPage = () => {
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const emergencyTypes = [
    { 
      icon: <ShieldAlert className="w-12 h-12 text-yellow-600" />, 
      name: "General Emergency", 
      contacts: [
        { name: "National Emergency Hotline", number: "119" },
        { name: "Police Emergency", number: "112" }
      ]
    },
    { 
      icon: <Tornado className="w-12 h-12 text-purple-600" />, 
      name: "Disaster Management", 
      contacts: [
        { name: "DMC Emergency Center", number: "011-2136136" },
        { name: "Disaster Management Call Center", number: "117" }
      ]
    },
    { 
      icon: <Cross className="w-12 h-12 text-green-600" />, 
      name: "Medical Emergency", 
      contacts: [
        { name: "Ambulance Services", number: "110" },
        { name: "Lanka Hospitals", number: "1566" }
      ]
    },
    { 
      icon: <Flame className="w-12 h-12 text-red-600" />, 
      name: "Fire", 
      contacts: [
        { name: "Fire & Rescue Services", number: "110" },
        { name: "Colombo Fire Service", number: "0112422222" }
      ]
    },
    { 
      icon: <Waves className="w-12 h-12 text-blue-600" />, 
      name: "Flood", 
      contacts: [
        { name: "SLAF Flood Rescue", number: "011 2 343 970" },
        { name: "National Disaster Management Centre", number: "011-2136136" }
      ]
    },
    
    
    
  ];

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency);
  };

  const resetSelection = () => {
    setSelectedEmergency(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <NavigationBar />
      <div className="container mx-auto max-w-xl mt-16">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Emergency SOS
        </h1>

        {!selectedEmergency ? (
          <div className="grid grid-cols-2 gap-4">
            {emergencyTypes.map((emergency) => (
              <button
                key={emergency.name}
                onClick={() => handleEmergencySelect(emergency)}
                className="bg-white shadow-md rounded-lg p-6 text-center hover:bg-gray-50 transition-colors flex flex-col items-center space-y-4"
              >
                {emergency.icon}
                <span className="font-semibold">{emergency.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <button 
              onClick={resetSelection} 
              className="mb-4 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Emergency Types
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              {selectedEmergency.icon}
              <span className="ml-3">{selectedEmergency.name} Contacts</span>
            </h2>
            <div className="space-y-4">
              {selectedEmergency.contacts.map((contact, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 rounded-lg p-4 flex justify-between items-center"
                >
                  <span className="font-medium">{contact.name}</span>
                  <a 
                    href={`tel:${contact.number.replace(/\s/g, '')}`} 
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    Call {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            In case of any emergency, stay calm and provide clear information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOSPage;