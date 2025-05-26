import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckSquare, Home, Droplet, Package, Heart, Info, X, Car } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import NavigationBar from '../../../utils/Navbar';
import OfflineAwareContainer from '../../../components/OfflineAwareContainer';
import { useTranslation } from 'react-i18next';

const FloodDisasterSupportPage = () => {
  const { t, i18n } = useTranslation();
  
  // Load saved checklists from localStorage or use defaults
  const loadSavedItems = (key, defaultItems) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultItems.map(item => ({ 
      text: item, 
      checked: false 
    }));
  };

  const [activeTab, setActiveTab] = useState('pre');
  
  // Initialize default items directly with translation keys
  const getDefaultItems = (prefix, count) => {
    return Array.from({length: count}, (_, i) => t(`${prefix}${i+1}`));
  };

  const [emergencyKitItems, setEmergencyKitItems] = useState(() => 
    loadSavedItems('emergencyKit', getDefaultItems('flood.emergencyKitItem', 14))
  );
  
  const [homePreparationItems, setHomePreparationItems] = useState(() => 
    loadSavedItems('homePreparation', getDefaultItems('flood.homePrepItem', 10))
  );
  
  const [duringFloodItems, setDuringFloodItems] = useState(() => 
    loadSavedItems('duringFlood', getDefaultItems('flood.duringItem', 7))
  );
  
  const [afterFloodItems, setAfterFloodItems] = useState(() => 
    loadSavedItems('afterFlood', getDefaultItems('flood.afterItem', 10))
  );

  const [newItemText, setNewItemText] = useState('');
  const [selectedList, setSelectedList] = useState('emergencyKit');
  const [showAddItem, setShowAddItem] = useState(false);

  // Update translations when language changes
  useEffect(() => {
    setEmergencyKitItems(prevItems => {
      const defaults = getDefaultItems('flood.emergencyKitItem', 14);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setHomePreparationItems(prevItems => {
      const defaults = getDefaultItems('flood.homePrepItem', 10);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setDuringFloodItems(prevItems => {
      const defaults = getDefaultItems('flood.duringItem', 7);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setAfterFloodItems(prevItems => {
      const defaults = getDefaultItems('flood.afterItem', 10);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
  }, [t, i18n.language]);

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
    if (confirm(t("flood.resetConfirm"))) {
      setEmergencyKitItems(loadSavedItems('emergencyKit', getDefaultItems('flood.emergencyKitItem', 14)));
      setHomePreparationItems(loadSavedItems('homePreparation', getDefaultItems('flood.homePrepItem', 10)));
      setDuringFloodItems(loadSavedItems('duringFlood', getDefaultItems('flood.duringItem', 7)));
      setAfterFloodItems(loadSavedItems('afterFlood', getDefaultItems('flood.afterItem', 10)));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <NavigationBar/>
      <OfflineAwareContainer pageName="flood" color="blue">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4 shadow-md mt-16">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <Droplet className="mr-2" /> 
              {t("flood.title")}
            </h1>
            <button 
              onClick={resetAllLists}
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            >
              {t("flood.resetAll")}
            </button>
          </div>
        </header>

        {/* Tutorial Section */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">{t("flood.howToStaySafe")}</h2>

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
              {/* Step 1: Understanding Floods */}
              <SwiperSlide>
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-3">{t("flood.understandingTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("flood.understandingContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("flood.understandingPoint1")}</li>
                    <li>{t("flood.understandingPoint2")}</li>
                    <li>{t("flood.understandingPoint3")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 2: Pre-Flood Preparations */}
              <SwiperSlide>
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-3">{t("flood.preFloodTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("flood.preFloodContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("flood.preFloodPoint1")}</li>
                    <li>{t("flood.preFloodPoint2")}</li>
                    <li>{t("flood.preFloodPoint3")}</li>
                    <li>{t("flood.preFloodPoint4")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 3: During a Flood */}
              <SwiperSlide>
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-3">{t("flood.duringFloodTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("flood.duringFloodContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("flood.duringFloodPoint1")}</li>
                    <li>{t("flood.duringFloodPoint2")}</li>
                    <li>{t("flood.duringFloodPoint3")}</li>
                    <li>{t("flood.duringFloodPoint4")}</li>
                    <li>{t("flood.duringFloodPoint5")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 4: Post-Flood Recovery */}
              <SwiperSlide>
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-3">{t("flood.postFloodTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("flood.postFloodContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("flood.postFloodPoint1")}</li>
                    <li>{t("flood.postFloodPoint2")}</li>
                    <li>{t("flood.postFloodPoint3")}</li>
                    <li>{t("flood.postFloodPoint4")}</li>
                    <li>{t("flood.postFloodPoint5")}</li>
                  </ul>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">{t("flood.takeActionTitle")}</h3>
          <p className="text-gray-700 mb-4">
            {t("flood.takeActionContent")}
          </p>
          <button 
            onClick={() => {
              setActiveTab('pre');
              document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {t("flood.goToChecklists")}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-blue-200">
          <div className="container mx-auto flex">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'pre' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('pre')}
            >
              {t("flood.tabPre")}
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'during' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('during')}
            >
              {t("flood.tabDuring")}
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'post' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('post')}
            >
              {t("flood.tabPost")}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto p-4" id="main-content">
          {/* Alert Banner */}
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="mr-2" />
              <p><strong>{t("important")}:</strong> {t("flood.importantAlert")}</p>
            </div>
          </div>

          {/* Pre-Disaster Section */}
          {activeTab === 'pre' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                  <Package className="mr-2" />
                  {t("flood.emergencyKitTitle")}
                </h2>
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">{t("flood.emergencyKitDesc")}</p>
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
                  {t("flood.homePrepTitle")}
                </h2>
                <p className="text-gray-600 mb-2">{t("flood.homePrepDesc")}</p>
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
                  <CheckSquare className="mr-2" size={18} /> {t("flood.addCustomItem")}
                </button>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-medium mb-2">{t("flood.addNewItem")}</h3>
                  <div className="flex flex-col space-y-2">
                    <select 
                      value={selectedList}
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="emergencyKit">{t("flood.emergencyKitTitle")}</option>
                      <option value="homePreparation">{t("flood.homePrepTitle")}</option>
                      <option value="duringFlood">{t("flood.duringActionsTitle")}</option>
                      <option value="afterFlood">{t("flood.recoveryTitle")}</option>
                    </select>
                    <input 
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder={t("flood.itemPlaceholder")}
                      className="p-2 border rounded"
                    />
                    <div className="flex space-x-2">
                      <button 
                        onClick={addItemToList}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      >
                        {t("flood.addItem")}
                      </button>
                      <button 
                        onClick={() => setShowAddItem(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded"
                      >
                        {t("flood.cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* During Flood Section */}
          {activeTab === 'during' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-red-700">
                  <AlertTriangle className="mr-2" />
                  {t("flood.duringActionsTitle")}
                </h2>
                <p className="text-gray-600 mb-4">{t("flood.duringActionsDesc")}</p>
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
                  {t("flood.emergencyAlertsTitle")}
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border border-red-100">
                    <h4 className="font-medium">{t("flood.emergencyPhoneNumbers")}</h4>
                    <ul className="text-sm text-gray-600">
                      <li>Call Center: 711</li>
                      <li>General: +94 112 136 136</li>
                      <li>Emergency Operation Center: +94 112 136 222 / +94 112 670 002</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded border border-red-100">
                    <h4 className="font-medium">{t("flood.emergencyBroadcast")}</h4>
                    <p className="text-sm text-gray-600">Tune to local radio: 97.1 FM, 103.5 FM, 750 AM</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-medium mb-2 text-yellow-800">{t("flood.safetyTipsTitle")}</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span> 
                    <span>{t("flood.safetyTip1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span> 
                    <span>{t("flood.safetyTip2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span> 
                    <span>{t("flood.safetyTip3")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span> 
                    <span>{t("flood.safetyTip4")}</span>
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
                  {t("flood.recoveryTitle")}
                </h2>
                <p className="text-gray-600 mb-4">{t("flood.recoveryDesc")}</p>
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
                  {t("flood.healthTitle")}
                </h2>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h3 className="font-medium">{t("flood.waterSafety")}</h3>
                    <p className="text-sm text-gray-600">{t("flood.waterSafetyDesc")}</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h3 className="font-medium">{t("flood.moldPrevention")}</h3>
                    <p className="text-sm text-gray-600">{t("flood.moldPreventionDesc")}</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h3 className="font-medium">{t("flood.emotionalSupport")}</h3>
                    <p className="text-sm text-gray-600">{t("flood.emotionalSupportDesc")}</p>
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
              {t("flood.footer")}
            </p>
          </div>
        </footer>
      </OfflineAwareContainer>
    </div>
  );
};

export default FloodDisasterSupportPage;