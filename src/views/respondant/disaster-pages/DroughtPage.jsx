import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckSquare, Home, Sun, Droplet, Package, Heart, Info, X, Cloud } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import NavigationBar from '../../../utils/Navbar';

const DroughtDisasterSupportPage = () => {
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
    "Water (at least 1 gallon per person per day)",
    "Non-perishable food (at least a 3-day supply)",
    "Battery-powered or hand-crank radio",
    "Flashlight and extra batteries",
    "First aid kit",
    "Dust mask and sunglasses",
    "Moist towelettes and hand sanitizer",
    "Manual can opener",
    "Local maps",
    "Cell phone with chargers and backup battery",
    "Prescription medications and glasses",
    "Infant formula and diapers",
    "Important family documents in waterproof container"
  ];

  const homePreparationDefaults = [
    "Install water-efficient fixtures (e.g., low-flow faucets)",
    "Fix leaks in pipes and faucets",
    "Collect and store rainwater",
    "Use drought-resistant plants in landscaping",
    "Create a water conservation plan",
    "Prepare an emergency water supply",
    "Review insurance coverage",
    "Identify emergency contacts",
    "Locate water distribution centers",
    "Monitor drought warnings and updates"
  ];

  const duringDroughtDefaults = [
    "Limit water usage to essential needs",
    "Avoid watering lawns or washing cars",
    "Reuse water when possible (e.g., for plants)",
    "Follow local water restrictions",
    "Stay informed about drought conditions",
    "Keep emergency water supply accessible",
    "Avoid outdoor activities during extreme heat"
  ];

  const afterDroughtDefaults = [
    "Continue conserving water even after restrictions are lifted",
    "Inspect and repair water systems for leaks",
    "Replenish emergency water supply",
    "Replace landscaping with drought-resistant plants",
    "Review and update water conservation plan",
    "Check for damage to property caused by dry conditions",
    "Seek assistance if needed for water or food shortages"
  ];

  const [emergencyKitItems, setEmergencyKitItems] = useState(() => 
    loadSavedItems('emergencyKit', emergencyKitDefaults)
  );
  
  const [homePreparationItems, setHomePreparationItems] = useState(() => 
    loadSavedItems('homePreparation', homePreparationDefaults)
  );
  
  const [duringDroughtItems, setDuringDroughtItems] = useState(() => 
    loadSavedItems('duringDrought', duringDroughtDefaults)
  );
  
  const [afterDroughtItems, setAfterDroughtItems] = useState(() => 
    loadSavedItems('afterDrought', afterDroughtDefaults)
  );

  const [newItemText, setNewItemText] = useState('');
  const [selectedList, setSelectedList] = useState('emergencyKit');
  const [showAddItem, setShowAddItem] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyKit', JSON.stringify(emergencyKitItems));
    localStorage.setItem('homePreparation', JSON.stringify(homePreparationItems));
    localStorage.setItem('duringDrought', JSON.stringify(duringDroughtItems));
    localStorage.setItem('afterDrought', JSON.stringify(afterDroughtItems));
  }, [emergencyKitItems, homePreparationItems, duringDroughtItems, afterDroughtItems]);

  const handleCheckboxChange = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'duringDrought') {
      setDuringDroughtItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'afterDrought') {
      setAfterDroughtItems(items => 
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
    } else if (selectedList === 'duringDrought') {
      setDuringDroughtItems([...duringDroughtItems, newItem]);
    } else if (selectedList === 'afterDrought') {
      setAfterDroughtItems([...afterDroughtItems, newItem]);
    }
    
    setNewItemText('');
    setShowAddItem(false);
  };

  const removeItem = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'duringDrought') {
      setDuringDroughtItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'afterDrought') {
      setAfterDroughtItems(items => items.filter((_, i) => i !== index));
    }
  };

  const resetAllLists = () => {
    if (confirm("Are you sure you want to reset all checklists to default?")) {
      setEmergencyKitItems(emergencyKitDefaults.map(item => ({ text: item, checked: false })));
      setHomePreparationItems(homePreparationDefaults.map(item => ({ text: item, checked: false })));
      setDuringDroughtItems(duringDroughtDefaults.map(item => ({ text: item, checked: false })));
      setAfterDroughtItems(afterDroughtDefaults.map(item => ({ text: item, checked: false })));
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <NavigationBar/>
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 shadow-md mt-16">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Sun className="mr-2" /> 
            Drought Disaster Support
          </h1>
          <button 
            onClick={resetAllLists}
            className="bg-orange-500 hover:bg-orange-700 text-white py-1 px-3 rounded text-sm"
          >
            Reset All Lists
          </button>
        </div>
      </header>

      {/* Tutorial Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-orange-800 mb-6">How to Stay Safe During a Drought</h2>

          {/* Card Slider */}
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="mySwiper"
          >
            {/* Step 1: Understanding Droughts */}
            <SwiperSlide>
              <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                <h3 className="text-2xl font-semibold text-orange-700 mb-3">1. Understanding Droughts</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  Droughts are prolonged periods of water scarcity caused by below-average precipitation. They can lead to water shortages, crop failures, and increased wildfire risks.
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Droughts can last for months or even years.</li>
                  <li>Agriculture, ecosystems, and communities are heavily impacted.</li>
                  <li>Water conservation is critical during droughts.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 2: Pre-Drought Preparations */}
            <SwiperSlide>
              <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                <h3 className="text-2xl font-semibold text-orange-700 mb-3">2. Pre-Drought Preparations</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  Being prepared before a drought can help mitigate its impact. Here are some key steps to take:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Create an emergency kit with essential supplies (see checklist below).</li>
                  <li>Install water-efficient fixtures and fix leaks.</li>
                  <li>Develop a water conservation plan for your household.</li>
                  <li>Stay informed about local drought conditions and warnings.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 3: During a Drought */}
            <SwiperSlide>
              <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                <h3 className="text-2xl font-semibold text-orange-700 mb-3">3. During a Drought</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  If a drought is occurring, take immediate action to conserve water and stay safe:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Limit water usage to essential needs.</li>
                  <li>Follow local water restrictions and guidelines.</li>
                  <li>Avoid outdoor activities during extreme heat.</li>
                  <li>Keep emergency water supply accessible.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 4: Post-Drought Recovery */}
            <SwiperSlide>
              <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                <h3 className="text-2xl font-semibold text-orange-700 mb-3">4. Post-Drought Recovery</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  After a drought, it's important to take steps to recover and prepare for future droughts:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Continue conserving water even after restrictions are lifted.</li>
                  <li>Inspect and repair water systems for leaks.</li>
                  <li>Replenish emergency water supply.</li>
                  <li>Replace landscaping with drought-resistant plants.</li>
                </ul>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <h3 className="text-xl font-semibold text-orange-800 mb-4">Ready to Take Action?</h3>
        <p className="text-gray-700 mb-4">
          Use the interactive checklists below to ensure you're fully prepared before, during, and after a drought. These checklists will guide you through essential steps to conserve water and protect your family.
        </p>
        <button 
          onClick={() => {
            setActiveTab('pre');
            document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
        >
          Go to Checklists
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-orange-200">
        <div className="container mx-auto flex">
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'pre' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('pre')}
          >
            Pre-Disaster
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'during' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('during')}
          >
            During Drought
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'post' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('post')}
          >
            Post-Disaster
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4" id="main-content">
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
              <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
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
                          className="mt-1 h-4 w-4 text-orange-600 rounded"
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
              <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
                <Home className="mr-2" />
                Home Preparation Checklist
              </h2>
              <p className="text-gray-600 mb-2">Steps to conserve water and protect your property:</p>
              <div className="space-y-2">
                {homePreparationItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('homePreparation', index)}
                        className="mt-1 h-4 w-4 text-orange-600 rounded"
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
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded flex items-center"
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
                    <option value="duringDrought">During Drought</option>
                    <option value="afterDrought">After Drought</option>
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
          </div>
        )}

        {/* During Drought Section */}
        {activeTab === 'during' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-700">
                <AlertTriangle className="mr-2" />
                Actions During Drought
              </h2>
              <p className="text-gray-600 mb-4">Critical steps to conserve water and stay safe:</p>
              <div className="space-y-2">
                {duringDroughtItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('duringDrought', index)}
                        className="mt-1 h-4 w-4 text-orange-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('duringDrought', index)}
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
                  <h4 className="font-medium">Emergency Phone Numbers</h4>
                  <ul className="text-sm text-gray-600">
                    <li>Call Center: 711</li>
                    <li>General: +94 112 136 136</li>
                    <li>Emergency Operation Center: +94 112 136 222 / +94 112 670 002</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded border border-red-100">
                  <h4 className="font-medium">Emergency Broadcast Stations</h4>
                  <p className="text-sm text-gray-600">Tune to local radio: 97.1 FM, 103.5 FM, 750 AM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-medium mb-2 text-orange-800">Drought Safety Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span> 
                  <span>Limit water usage to essential needs.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span> 
                  <span>Reuse water for non-drinking purposes (e.g., watering plants).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span> 
                  <span>Avoid outdoor activities during extreme heat.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span> 
                  <span>Follow local water restrictions and guidelines.</span>
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
                <Cloud className="mr-2" />
                Recovery Checklist
              </h2>
              <p className="text-gray-600 mb-4">Steps to take after a drought:</p>
              <div className="space-y-2">
                {afterDroughtItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('afterDrought', index)}
                        className="mt-1 h-4 w-4 text-orange-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('afterDrought', index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
                <Heart className="mr-2" />
                Health & Wellness
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-3">
                  <h3 className="font-medium">Water Safety</h3>
                  <p className="text-sm text-gray-600">Continue conserving water even after restrictions are lifted.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h3 className="font-medium">Structural Safety</h3>
                  <p className="text-sm text-gray-600">Inspect and repair water systems for leaks.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h3 className="font-medium">Emotional Support</h3>
                  <p className="text-sm text-gray-600">Disasters can cause emotional distress. Contact the Disaster Distress Helpline: 1-800-985-5990</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-orange-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © 2025 InfoUnityResponse | This information is provided for emergency preparedness. 
            Always follow instructions from local authorities in an emergency situation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DroughtDisasterSupportPage;