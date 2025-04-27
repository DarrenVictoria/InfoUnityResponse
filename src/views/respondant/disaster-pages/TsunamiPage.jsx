import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckSquare, Home, Waves, Package, Heart, Info, X, Shield } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import NavigationBar from '../../../utils/Navbar';
import OfflineAwareContainer from '../../../components/OfflineAwareContainer';

const TsunamiDisasterSupportPage = () => {
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
    "Whistle to signal for help",
    "Dust mask and plastic sheeting",
    "Moist towelettes, garbage bags, and plastic ties",
    "Local maps",
    "Cell phone with chargers and backup battery",
    "Prescription medications and glasses",
    "Infant formula and diapers",
    "Important family documents in waterproof container"
  ];

  const homePreparationDefaults = [
    "Identify evacuation routes and safe zones",
    "Secure heavy furniture and appliances to walls",
    "Elevate utilities and electrical systems",
    "Install check valves in plumbing",
    "Prepare an emergency evacuation plan",
    "Review insurance coverage",
    "Identify emergency contacts",
    "Locate tsunami evacuation centers",
    "Practice evacuation drills with your family",
    "Stay informed about tsunami warnings"
  ];

  const duringTsunamiDefaults = [
    "Move immediately to higher ground or inland",
    "Follow evacuation routes and signs",
    "Avoid coastal areas and river valleys",
    "Do not wait for official warnings if you feel a strong earthquake",
    "Stay tuned to emergency broadcasts",
    "Keep emergency kit accessible",
    "Avoid walking or driving through flood waters"
  ];

  const afterTsunamiDefaults = [
    "Listen to authorities for information",
    "Return home only when authorities say it's safe",
    "Document property damage with photographs",
    "Contact insurance company",
    "Avoid flood water (may be contaminated)",
    "Check for structural damage before entering buildings",
    "Clean and disinfect everything that got wet",
    "Watch for wildlife that may have entered home",
    "Seek medical attention if injured",
    "Contact loved ones to let them know you're safe"
  ];

  const [emergencyKitItems, setEmergencyKitItems] = useState(() => 
    loadSavedItems('emergencyKit', emergencyKitDefaults)
  );
  
  const [homePreparationItems, setHomePreparationItems] = useState(() => 
    loadSavedItems('homePreparation', homePreparationDefaults)
  );
  
  const [duringTsunamiItems, setDuringTsunamiItems] = useState(() => 
    loadSavedItems('duringTsunami', duringTsunamiDefaults)
  );
  
  const [afterTsunamiItems, setAfterTsunamiItems] = useState(() => 
    loadSavedItems('afterTsunami', afterTsunamiDefaults)
  );

  const [newItemText, setNewItemText] = useState('');
  const [selectedList, setSelectedList] = useState('emergencyKit');
  const [showAddItem, setShowAddItem] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyKit', JSON.stringify(emergencyKitItems));
    localStorage.setItem('homePreparation', JSON.stringify(homePreparationItems));
    localStorage.setItem('duringTsunami', JSON.stringify(duringTsunamiItems));
    localStorage.setItem('afterTsunami', JSON.stringify(afterTsunamiItems));
  }, [emergencyKitItems, homePreparationItems, duringTsunamiItems, afterTsunamiItems]);

  const handleCheckboxChange = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'duringTsunami') {
      setDuringTsunamiItems(items => 
        items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
      );
    } else if (list === 'afterTsunami') {
      setAfterTsunamiItems(items => 
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
    } else if (selectedList === 'duringTsunami') {
      setDuringTsunamiItems([...duringTsunamiItems, newItem]);
    } else if (selectedList === 'afterTsunami') {
      setAfterTsunamiItems([...afterTsunamiItems, newItem]);
    }
    
    setNewItemText('');
    setShowAddItem(false);
  };

  const removeItem = (list, index) => {
    if (list === 'emergencyKit') {
      setEmergencyKitItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'homePreparation') {
      setHomePreparationItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'duringTsunami') {
      setDuringTsunamiItems(items => items.filter((_, i) => i !== index));
    } else if (list === 'afterTsunami') {
      setAfterTsunamiItems(items => items.filter((_, i) => i !== index));
    }
  };

  const resetAllLists = () => {
    if (confirm("Are you sure you want to reset all checklists to default?")) {
      setEmergencyKitItems(emergencyKitDefaults.map(item => ({ text: item, checked: false })));
      setHomePreparationItems(homePreparationDefaults.map(item => ({ text: item, checked: false })));
      setDuringTsunamiItems(duringTsunamiDefaults.map(item => ({ text: item, checked: false })));
      setAfterTsunamiItems(afterTsunamiDefaults.map(item => ({ text: item, checked: false })));
    }
  };

  return (
    <div className="min-h-screen bg-teal-50">
      <NavigationBar/>
      <OfflineAwareContainer pageName="tsunami" color="teal">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md mt-16">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Waves className="mr-2" /> 
            Tsunami Disaster Support
          </h1>
          <button 
            onClick={resetAllLists}
            className="bg-teal-500 hover:bg-teal-700 text-white py-1 px-3 rounded text-sm"
          >
            Reset All Lists
          </button>
        </div>
      </header>

      {/* Tutorial Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-teal-800 mb-6">How to Stay Safe During a Tsunami</h2>

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
            {/* Step 1: Understanding Tsunamis */}
            <SwiperSlide>
              <div className="bg-teal-50 p-6 rounded-lg shadow-md border border-teal-200">
                <h3 className="text-2xl font-semibold text-teal-700 mb-3">1. Understanding Tsunamis</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  Tsunamis are large ocean waves caused by underwater earthquakes, volcanic eruptions, or landslides. They can cause massive destruction to coastal areas.
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Tsunamis can travel at speeds of up to 500 mph.</li>
                  <li>Coastal areas are most at risk.</li>
                  <li>Warning signs include strong earthquakes and sudden ocean retreat.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 2: Pre-Tsunami Preparations */}
            <SwiperSlide>
              <div className="bg-teal-50 p-6 rounded-lg shadow-md border border-teal-200">
                <h3 className="text-2xl font-semibold text-teal-700 mb-3">2. Pre-Tsunami Preparations</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  Being prepared before a tsunami can save lives. Here are some key steps to take:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Create an emergency kit with essential supplies (see checklist below).</li>
                  <li>Identify evacuation routes and safe zones.</li>
                  <li>Secure heavy furniture and appliances to walls.</li>
                  <li>Stay informed about tsunami warnings and alerts.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 3: During a Tsunami */}
            <SwiperSlide>
              <div className="bg-teal-50 p-6 rounded-lg shadow-md border border-teal-200">
                <h3 className="text-2xl font-semibold text-teal-700 mb-3">3. During a Tsunami</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  If a tsunami is imminent or occurring, take immediate action to ensure your safety:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Move immediately to higher ground or inland.</li>
                  <li>Follow evacuation routes and signs.</li>
                  <li>Avoid coastal areas and river valleys.</li>
                  <li>Stay tuned to emergency broadcasts.</li>
                </ul>
              </div>
            </SwiperSlide>

            {/* Step 4: Post-Tsunami Recovery */}
            <SwiperSlide>
              <div className="bg-teal-50 p-6 rounded-lg shadow-md border border-teal-200">
                <h3 className="text-2xl font-semibold text-teal-700 mb-3">4. Post-Tsunami Recovery</h3>
                <p className="text-gray-700 mb-4 font-semibold">
                  After a tsunami, it's important to take steps to ensure your safety and begin the recovery process:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Return home only when authorities declare it safe.</li>
                  <li>Document property damage for insurance claims.</li>
                  <li>Avoid flood water (may be contaminated).</li>
                  <li>Seek medical attention if injured.</li>
                </ul>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
        <h3 className="text-xl font-semibold text-teal-800 mb-4">Ready to Take Action?</h3>
        <p className="text-gray-700 mb-4">
          Use the interactive checklists below to ensure you're fully prepared before, during, and after a tsunami. These checklists will guide you through essential steps to protect yourself, your family, and your property.
        </p>
        <button 
          onClick={() => {
            setActiveTab('pre');
            document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded"
        >
          Go to Checklists
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-teal-200">
        <div className="container mx-auto flex">
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'pre' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-teal-500'}`}
            onClick={() => setActiveTab('pre')}
          >
            Pre-Disaster
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'during' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-teal-500'}`}
            onClick={() => setActiveTab('during')}
          >
            During Tsunami
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'post' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-teal-500'}`}
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
              <h2 className="text-xl font-semibold mb-4 flex items-center text-teal-800">
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
                          className="mt-1 h-4 w-4 text-teal-600 rounded"
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
              <h2 className="text-xl font-semibold mb-4 flex items-center text-teal-800">
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
                        className="mt-1 h-4 w-4 text-teal-600 rounded"
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
                className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded flex items-center"
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
                    <option value="duringTsunami">During Tsunami</option>
                    <option value="afterTsunami">After Tsunami</option>
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

        {/* During Tsunami Section */}
        {activeTab === 'during' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-700">
                <AlertTriangle className="mr-2" />
                Actions During Tsunami
              </h2>
              <p className="text-gray-600 mb-4">Critical steps to stay safe:</p>
              <div className="space-y-2">
                {duringTsunamiItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('duringTsunami', index)}
                        className="mt-1 h-4 w-4 text-teal-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('duringTsunami', index)}
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
            
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <h3 className="text-lg font-medium mb-2 text-teal-800">Tsunami Safety Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span> 
                  <span>Move immediately to higher ground or inland.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span> 
                  <span>Follow evacuation routes and signs.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span> 
                  <span>Avoid coastal areas and river valleys.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span> 
                  <span>Stay tuned to emergency broadcasts.</span>
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
                <Shield className="mr-2" />
                Recovery Checklist
              </h2>
              <p className="text-gray-600 mb-4">Steps to take after a tsunami:</p>
              <div className="space-y-2">
                {afterTsunamiItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange('afterTsunami', index)}
                        className="mt-1 h-4 w-4 text-teal-600 rounded"
                      />
                      <label 
                        className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <button 
                      onClick={() => removeItem('afterTsunami', index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-teal-800">
                <Heart className="mr-2" />
                Health & Wellness
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-teal-500 pl-3">
                  <h3 className="font-medium">Water Safety</h3>
                  <p className="text-sm text-gray-600">Avoid flood water (may be contaminated). Use bottled water for drinking and cooking.</p>
                </div>
                <div className="border-l-4 border-teal-500 pl-3">
                  <h3 className="font-medium">Structural Safety</h3>
                  <p className="text-sm text-gray-600">Check for structural damage before entering buildings.</p>
                </div>
                <div className="border-l-4 border-teal-500 pl-3">
                  <h3 className="font-medium">Emotional Support</h3>
                  <p className="text-sm text-gray-600">Disasters can cause emotional distress. Contact the Disaster Distress Helpline: 1-800-985-5990</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-teal-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © 2025 InfoUnityResponse | This information is provided for emergency preparedness. 
            Always follow instructions from local authorities in an emergency situation.
          </p>
        </div>
      </footer>
      </OfflineAwareContainer>
    </div>
  );
};

export default TsunamiDisasterSupportPage;