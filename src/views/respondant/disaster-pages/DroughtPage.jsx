import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckSquare, Home, Sun, Droplet, Package, Heart, Info, X, Cloud } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import NavigationBar from '../../../utils/Navbar';
import OfflineAwareContainer from '../../../components/OfflineAwareContainer';
import { useTranslation } from 'react-i18next';

const DroughtDisasterSupportPage = () => {
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
    loadSavedItems('emergencyKit', getDefaultItems('drought.emergencyKitItem', 13))
  );
  
  const [homePreparationItems, setHomePreparationItems] = useState(() => 
    loadSavedItems('homePreparation', getDefaultItems('drought.homePrepItem', 10))
  );
  
  const [duringDroughtItems, setDuringDroughtItems] = useState(() => 
    loadSavedItems('duringDrought', getDefaultItems('drought.duringItem', 7))
  );
  
  const [afterDroughtItems, setAfterDroughtItems] = useState(() => 
    loadSavedItems('afterDrought', getDefaultItems('drought.afterItem', 7))
  );

  const [newItemText, setNewItemText] = useState('');
  const [selectedList, setSelectedList] = useState('emergencyKit');
  const [showAddItem, setShowAddItem] = useState(false);

  // Update translations when language changes
  useEffect(() => {
    setEmergencyKitItems(prevItems => {
      const defaults = getDefaultItems('drought.emergencyKitItem', 13);
      // Preserve custom items and update translations for default items
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setHomePreparationItems(prevItems => {
      const defaults = getDefaultItems('drought.homePrepItem', 10);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setDuringDroughtItems(prevItems => {
      const defaults = getDefaultItems('drought.duringItem', 7);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
    
    setAfterDroughtItems(prevItems => {
      const defaults = getDefaultItems('drought.afterItem', 7);
      return prevItems.map((item, index) => 
        index < defaults.length ? {...item, text: defaults[index]} : item
      );
    });
  }, [t, i18n.language]);

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
    if (confirm(t("drought.resetConfirm"))) {
      setEmergencyKitItems(loadSavedItems('emergencyKit', getDefaultItems('drought.emergencyKitItem', 13)));
      setHomePreparationItems(loadSavedItems('homePreparation', getDefaultItems('drought.homePrepItem', 10)));
      setDuringDroughtItems(loadSavedItems('duringDrought', getDefaultItems('drought.duringItem', 7)));
      setAfterDroughtItems(loadSavedItems('afterDrought', getDefaultItems('drought.afterItem', 7)));
    }
  };

  // Render checklist items
  const renderChecklistItems = (items) => {
    return items.map((item, index) => (
      <div key={index} className="flex items-center justify-between group">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => handleCheckboxChange(list, index)}
            className="mt-1 h-4 w-4 text-orange-600 rounded"
          />
          <label 
            className={`ml-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
          >
            {item.text}
          </label>
        </div>
        <button 
          onClick={() => removeItem(list, index)}
          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <NavigationBar/>
      <OfflineAwareContainer pageName="drought" color="orange">
        {/* Header */}
        <header className="bg-orange-600 text-white p-4 shadow-md mt-16">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <Sun className="mr-2" /> 
              {t("drought.title")}
            </h1>
            <button 
              onClick={resetAllLists}
              className="bg-orange-500 hover:bg-orange-700 text-white py-1 px-3 rounded text-sm"
            >
              {t("drought.resetAll")}
            </button>
          </div>
        </header>

        {/* Tutorial Section */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-orange-800 mb-6">{t("drought.howToStaySafe")}</h2>

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
                  <h3 className="text-2xl font-semibold text-orange-700 mb-3">{t("drought.understandingTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("drought.understandingContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("drought.understandingPoint1")}</li>
                    <li>{t("drought.understandingPoint2")}</li>
                    <li>{t("drought.understandingPoint3")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 2: Pre-Drought Preparations */}
              <SwiperSlide>
                <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                  <h3 className="text-2xl font-semibold text-orange-700 mb-3">{t("drought.preDroughtTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("drought.preDroughtContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("drought.preDroughtPoint1")}</li>
                    <li>{t("drought.preDroughtPoint2")}</li>
                    <li>{t("drought.preDroughtPoint3")}</li>
                    <li>{t("drought.preDroughtPoint4")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 3: During a Drought */}
              <SwiperSlide>
                <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                  <h3 className="text-2xl font-semibold text-orange-700 mb-3">{t("drought.duringDroughtTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("drought.duringDroughtContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("drought.duringDroughtPoint1")}</li>
                    <li>{t("drought.duringDroughtPoint2")}</li>
                    <li>{t("drought.duringDroughtPoint3")}</li>
                    <li>{t("drought.duringDroughtPoint4")}</li>
                  </ul>
                </div>
              </SwiperSlide>

              {/* Step 4: Post-Drought Recovery */}
              <SwiperSlide>
                <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
                  <h3 className="text-2xl font-semibold text-orange-700 mb-3">{t("drought.postDroughtTitle")}</h3>
                  <p className="text-gray-700 mb-4 font-semibold">
                    {t("drought.postDroughtContent")}
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>{t("drought.postDroughtPoint1")}</li>
                    <li>{t("drought.postDroughtPoint2")}</li>
                    <li>{t("drought.postDroughtPoint3")}</li>
                    <li>{t("drought.postDroughtPoint4")}</li>
                  </ul>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-xl font-semibold text-orange-800 mb-4">{t("drought.takeActionTitle")}</h3>
          <p className="text-gray-700 mb-4">
            {t("drought.takeActionContent")}
          </p>
          <button 
            onClick={() => {
              setActiveTab('pre');
              document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
          >
            {t("drought.goToChecklists")}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-orange-200">
          <div className="container mx-auto flex">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'pre' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
              onClick={() => setActiveTab('pre')}
            >
              {t("drought.tabPre")}
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'during' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
              onClick={() => setActiveTab('during')}
            >
              {t("drought.tabDuring")}
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'post' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
              onClick={() => setActiveTab('post')}
            >
              {t("drought.tabPost")}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto p-4" id="main-content">
          {/* Alert Banner */}
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="mr-2" />
              <p><strong>{t("important")}:</strong> {t("drought.importantAlert")}</p>
            </div>
          </div>

          {/* Pre-Disaster Section */}
          {activeTab === 'pre' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
                  <Package className="mr-2" />
                  {t("drought.emergencyKitTitle")}
                </h2>
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">{t("drought.emergencyKitDesc")}</p>
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
                  {t("drought.homePrepTitle")}
                </h2>
                <p className="text-gray-600 mb-2">{t("drought.homePrepDesc")}</p>
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
                  <CheckSquare className="mr-2" size={18} /> {t("drought.addCustomItem")}
                </button>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-medium mb-2">{t("drought.addNewItem")}</h3>
                  <div className="flex flex-col space-y-2">
                    <select 
                      value={selectedList}
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="emergencyKit">{t("drought.emergencyKitTitle")}</option>
                      <option value="homePreparation">{t("drought.homePrepTitle")}</option>
                      <option value="duringDrought">{t("drought.duringActionsTitle")}</option>
                      <option value="afterDrought">{t("drought.recoveryTitle")}</option>
                    </select>
                    <input 
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder={t("drought.itemPlaceholder")}
                      className="p-2 border rounded"
                    />
                    <div className="flex space-x-2">
                      <button 
                        onClick={addItemToList}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      >
                        {t("drought.addItem")}
                      </button>
                      <button 
                        onClick={() => setShowAddItem(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded"
                      >
                        {t("drought.cancel")}
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
                  {t("drought.duringActionsTitle")}
                </h2>
                <p className="text-gray-600 mb-4">{t("drought.duringActionsDesc")}</p>
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
                  {t("drought.emergencyAlertsTitle")}
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border border-red-100">
                    <h4 className="font-medium">{t("drought.emergencyPhoneNumbers")}</h4>
                    <ul className="text-sm text-gray-600">
                      <li>Call Center: 711</li>
                      <li>General: +94 112 136 136</li>
                      <li>Emergency Operation Center: +94 112 136 222 / +94 112 670 002</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded border border-red-100">
                    <h4 className="font-medium">{t("drought.emergencyBroadcast")}</h4>
                    <p className="text-sm text-gray-600">Tune to local radio: 97.1 FM, 103.5 FM, 750 AM</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-lg font-medium mb-2 text-orange-800">{t("drought.safetyTipsTitle")}</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span> 
                    <span>{t("drought.safetyTip1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span> 
                    <span>{t("drought.safetyTip2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span> 
                    <span>{t("drought.safetyTip3")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span> 
                    <span>{t("drought.safetyTip4")}</span>
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
                  {t("drought.recoveryTitle")}
                </h2>
                <p className="text-gray-600 mb-4">{t("drought.recoveryDesc")}</p>
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
                  {t("drought.healthTitle")}
                </h2>
                <div className="space-y-3">
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h3 className="font-medium">{t("drought.waterSafety")}</h3>
                    <p className="text-sm text-gray-600">{t("drought.waterSafetyDesc")}</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h3 className="font-medium">{t("drought.structuralSafety")}</h3>
                    <p className="text-sm text-gray-600">{t("drought.structuralSafetyDesc")}</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h3 className="font-medium">{t("drought.emotionalSupport")}</h3>
                    <p className="text-sm text-gray-600">{t("drought.emotionalSupportDesc")}</p>
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
              {t("drought.footer")}
            </p>
          </div>
        </footer>
      </OfflineAwareContainer>
    </div>
  );
};

export default DroughtDisasterSupportPage;