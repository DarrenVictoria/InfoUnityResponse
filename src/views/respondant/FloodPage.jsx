import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckSquare, Home, Droplet, Package, Heart, Info, X, Car } from 'lucide-react';

const FloodDisasterSupportPage = () => {
  // Load saved checklists from localStorage or use defaults
  const loadSavedItems = (key, defaultItems) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultItems.map(item => ({ 
      text: item, 
      checked: false 
    }));
  };

  const [activeTab, setActiveTab] = useState('pre');
  
  const emergencyKitDefaults = [
    "Water (1 gallon per person per day for at least 3 days)",
    "Non-perishable food (at least a 3-day supply)",
    "Battery-powered or hand-crank radio",
    "Flashlight and extra batteries",
    "First aid kit",
    "Dust mask, plastic sheeting, and duct tape",
    "Moist towelettes, garbage bags, and plastic ties",
    "Wrench or pliers to turn off utilities",
    "Manual can opener",
    "Local maps",
    "Cell phone with chargers and backup battery",
    "Prescription medications and glasses",
    "Infant formula and diapers",
    "Important family documents in waterproof container"
  ];

  const homePreparationDefaults = [
    "Clear gutters and drains",
    "Install check valves in plumbing",
    "Waterproof basement",
    "Elevate electrical components",
    "Seal walls with waterproofing compounds",
    "Move furniture and valuables to higher floors",
    "Prepare an evacuation plan",
    "Review insurance coverage",
    "Identify emergency contacts",
    "Locate evacuation centers"
  ];

  const duringFloodDefaults = [
    "Monitor emergency broadcasts",
    "Follow evacuation orders immediately",
    "Avoid walking or driving through flood waters",
    "Stay off bridges over fast-moving water",
    "Disconnect utilities if instructed",
    "Move to higher ground",
    "Keep emergency kit accessible"
  ];

  const afterFloodDefaults = [
    "Listen to authorities for information",
    "Return home only when authorities say it's safe",
    "Document property damage with photographs",
    "Contact insurance company",
    "Clean and disinfect everything that got wet",
    "Remove wet items that cannot be cleaned",
    "Check for structural damage",
    "Check utilities before using them",
    "Watch for wildlife that may have entered home",
    "Avoid flood water (may be contaminated)"
  ];

  const [emergencyKitItems, setEmergencyKitItems] = useState(() => 
    loadSavedItems('emergencyKit', emergencyKitDefaults)
  );
  
  const [homePreparationItems, setHomePreparationItems] = useState(() => 
    loadSavedItems('homePreparation', homePreparationDefaults)
  );
  
  const [duringFloodItems, setDuringFloodItems] = useState(() => 
    loadSavedItems('duringFlood', duringFloodDefaults)
  );
  
  const [afterFloodItems, setAfterFloodItems] = useState(() => 
    loadSavedItems('afterFlood', afterFloodDefaults)
  );

  const [newItemText, setNewItemText] = useState('');
  const [selectedList, setSelectedList] = useState('emergencyKit');
  const [showAddItem, setShowAddItem] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyKit', JSON.stringify(emergencyKitItems));
    localStorage.setItem('homePreparation', JSON.stringify(homePreparationItems));
    localStorage.setItem('duringFlood', JSON.stringify(duringFloodItems));
    localStorage.setItem('afterFlood', JSON.stringify(afterFloodItems));
  }, [emergencyKitItems, homePreparationItems, duringFloodItems, afterFloodItems]);

  const handleCheckboxChange = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'duringFlood') {
      setDuringFloodItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'afterFlood') {
      setAfterFloodItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    }
  };

  const addItemToList = () => {
    if (!newItemText.trim()) return;
    
    const newItem = { text: newItemText, checked: false };
    
    if (selectedList === 'emergencyKit') {
      setEmergencyKitItems([...emergencyKitItems, newItem]);
    } else if (selectedList === 'homePreparation') {
      setHomePreparationItems([...homePreparationItems, newItem]);
    } else if (selectedList === 'duringFlood') {
      setDuringFloodItems([...duringFloodItems, newItem]);
    } else if (selectedList === 'afterFlood') {
      setAfterFloodItems([...afterFloodItems, newItem]);
    }
    
    setNewItemText('');
    setShowAddItem(false);
  };

  const removeItem = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'duringFlood') {
      setDuringFloodItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'afterFlood') {
      setAfterFloodItems(items => items.filter((_, i) => i !== index));
    }
  };

  const resetAllLists = () => {
    if (confirm("Are you sure you want to reset all checklists to default?")) {
      setEmergencyKitItems(emergencyKitDefaults.map(item => ({ text: item, checked: false })));
      setHomePreparationItems(homePreparationDefaults.map(item => ({ text: item, checked: false })));
      setDuringFloodItems(duringFloodDefaults.map(item => ({ text: item, checked: false })));
      setAfterFloodItems(afterFloodDefaults.map(item => ({ text: item, checked: false })));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Droplet className="mr-2" /> 
            Flood Disaster Support
          </h1>
          <button 
            onClick={resetAllLists}
            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
          >
            Reset All Lists
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-blue-200">
        <div className="container mx-auto flex">
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'pre' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('pre')}
          >
            Pre-Disaster
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'during' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('during')}
          >
            During Flood
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'post' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('post')}
          >
            Post-Disaster
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Alert Banner */}
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" />
            <p><strong>Important:</strong> This is an emergency resource. Always follow instructions from local authorities.</p>
          </div>
        </div>

        {/* Pre-Disaster Section */}
        {activeTab === 'pre' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Package className="mr-2" />
                Emergency Kit Checklist
              </h2>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Prepare these essential items in advance:</p>
                <div className="space-y-2">
                  {emergencyKitItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleCheckboxChange('emergencyKit', index)}
                          className="mt-1 h-4 w-4 text-blue-600 rounded"
                        />
                        <label 
                          className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                        >
                          {item.text}
                        </label>
                      </div>
                      <button 
                        onClick={() => removeItem('emergencyKit', index)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Home className="mr-2" />
                Home Preparation Checklist
              </h2>
              <p className="text-gray-600 mb-2">Steps to protect your property:</p>
              <div className="space-y-2">
                {homePreparationItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('homePreparation', index)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('homePreparation', index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Item Button */}
            {!showAddItem ? (
              <button 
                onClick={() => {
                  setSelectedList('emergencyKit');
                  setShowAddItem(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
              >
                <CheckSquare className="mr-2" size={18} /> Add Custom Item
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Add New Item</h3>
                <div className="flex flex-col space-y-2">
                  <select 
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="emergencyKit">Emergency Kit</option>
                    <option value="homePreparation">Home Preparation</option>
                    <option value="duringFlood">During Flood</option>
                    <option value="afterFlood">After Flood</option>
                  </select>
                  <input 
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Enter item description"
                    className="p-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <button 
                      onClick={addItemToList}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    >
                      Add Item
                    </button>
                    <button 
                      onClick={() => setShowAddItem(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-2 text-blue-800">Additional Resources</h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li><a href="#" className="hover:underline">Local Flood Maps</a></li>
                <li><a href="#" className="hover:underline">Community Evacuation Routes</a></li>
                <li><a href="#" className="hover:underline">FEMA Flood Preparedness Guide</a></li>
                <li><a href="#" className="hover:underline">Emergency Contact Information</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* During Flood Section */}
        {activeTab === 'during' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-700">
                <AlertTriangle className="mr-2" />
                Actions During Flood
              </h2>
              <p className="text-gray-600 mb-4">Critical steps to stay safe:</p>
              <div className="space-y-2">
                {duringFloodItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('duringFlood', index)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('duringFlood', index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-medium mb-2 text-red-800 flex items-center">
                <Info className="mr-2" />
                Emergency Alerts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border border-red-100">
                  <h4 className="font-medium">Emergency Broadcast Stations</h4>
                  <p className="text-sm text-gray-600">Tune to local radio: 97.1 FM, 103.5 FM, 750 AM</p>
                </div>
                <div className="p-3 bg-white rounded border border-red-100">
                  <h4 className="font-medium">Emergency Phone Numbers</h4>
                  <ul className="text-sm text-gray-600">
                    <li>Emergency Services: 911</li>
                    <li>Flood Hotline: 1-800-FLOOD-HELP</li>
                    <li>Coast Guard: 1-800-XXX-XXXX</li>
                  </ul>
                </div>
                <div className="p-3 bg-white rounded border border-red-100">
                  <h4 className="font-medium">Evacuation Centers</h4>
                  <ul className="text-sm text-gray-600">
                    <li>Central High School - 1200 Main St</li>
                    <li>Community Center - 500 Oak Ave</li>
                    <li>Eastern Elementary - 800 Pine Rd</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-medium mb-2 text-yellow-800">Flood Safety Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span> 
                  <span>6 inches of moving water can knock you down</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span> 
                  <span>12 inches of water can float a vehicle</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span> 
                  <span>Never drive through flooded roads (Turn Around, Don't Drown!)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span> 
                  <span>Avoid contact with flood water - it may be contaminated</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Post-Disaster Section */}
        {activeTab === 'post' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
                <Car className="mr-2" />
                Recovery Checklist
              </h2>
              <p className="text-gray-600 mb-4">Steps to take after a flood:</p>
              <div className="space-y-2">
                {afterFloodItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('afterFlood', index)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('afterFlood', index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Heart className="mr-2" />
                Health & Wellness
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium">Water Safety</h3>
                  <p className="text-sm text-gray-600">Boil all water until authorities declare it safe. Use bottled water for drinking and cooking when possible.</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium">Mold Prevention</h3>
                  <p className="text-sm text-gray-600">Clean and dry all wet items within 24-48 hours to prevent mold growth. Use fans and dehumidifiers if available.</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium">Emotional Support</h3>
                  <p className="text-sm text-gray-600">Disasters can cause emotional distress. Contact the Disaster Distress Helpline: 1-800-985-5990</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-medium mb-2 text-green-800">Assistance Resources</h3>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded">
                  <h4 className="font-medium">FEMA Assistance</h4>
                  <p className="text-sm text-gray-600">Apply for federal disaster assistance: 1-800-621-FEMA or DisasterAssistance.gov</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <h4 className="font-medium">Insurance Claims</h4>
                  <p className="text-sm text-gray-600">Document all damage with photos and contact your insurance provider immediately.</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <h4 className="font-medium">Local Recovery Centers</h4>
                  <p className="text-sm text-gray-600">Visit your local Disaster Recovery Center for in-person assistance with recovery needs.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © 2025 Flood Disaster Support | This information is provided for emergency preparedness. 
            Always follow instructions from local authorities in an emergency situation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FloodDisasterSupportPage;