import React, { useState, useEffect, useNavigate } from 'react';
import { MapPin, MessageCircle, Heart, Search, Users, DollarSign, AlertTriangle ,AlertOctagon,ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import backgroundImage from '../../assets/hero-background.jpg';
import NavigationBar from '../../utils/Navbar';
import { useTranslation } from 'react-i18next';
import LatestUpdates from '../../utils/LatestUpdates';
import { Link } from 'react-router-dom';

import mainLogo from '../../assets/Logo.png';
import redCrossLogo from '../../assets/RedCross.png';
import dmcLogo from '../../assets/DMC.png';
import Drought from '../../assets/Droughts.png';
import Flood from '../../assets/Flood.png';
import Landslide from '../../assets/Landslides.png';
import Tsunami from '../../assets/Tsunami.png';



const RespondantLanding = () => {
  const { t } = useTranslation();

  return (
    <div>
      <NavigationBar />
      <Hero t={t} />
      <InfoUnitySection />
      <LatestUpdates />
      <WhoAreWe />
      <EmergencyResponseGrid />
    </div>
  );
};

export default RespondantLanding;

const StatusIndicator = ({ label, status, type, t }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm inline-flex items-center justify-center min-w-[120px]";

  const getStatusStyles = () => {
    if (type === 'warning') {
      switch (status.toLowerCase()) {
        case 'high': return 'bg-red-600 text-white';
        case 'medium': return 'bg-yellow-500 text-white';
        case 'low': return 'bg-green-600 text-white';
        default: return 'bg-gray-600 text-white';
      }
    } 
    return type === 'safety' 
      ? status ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      : !status ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
  };

  const getStatusText = () => {
    if (type === 'warning') return `${status} ${t('risk')}`;
    if (type === 'safety') return status ? t('safe') : t('notSafe');
    return status ? t('required') : t('notRequired');
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-sm text-gray-200">{t(label)}</span>
      <div className={`${baseStyles} ${getStatusStyles()}`}>
        {type === 'warning' && <AlertTriangle className="w-4 h-4 mr-2" />}
        {getStatusText()}
      </div>
    </div>
  );
};

// Renders all status indicators
const StatusIndicators = ({ safetyStatus = true, volunteerNeed = false, warningStatus = 'Low', t }) => (
  <div className="flex items-center gap-6 p-4 flex-wrap justify-center">
    <StatusIndicator label="warningLevel" status={warningStatus} type="warning" t={t} />
    <StatusIndicator label="safetyStatus" status={safetyStatus} type="safety" t={t} />
    <StatusIndicator label="volunteerNeed" status={volunteerNeed} type="volunteer" t={t} />
  </div>
);

const divisionalSecretariats = [
  { id: 1, DivisionalSecretariats: "Negombo", district: "Gampaha", coordinates: { lat: 7.2083, lon: 79.8358 } },
  { id: 2, DivisionalSecretariats: "Colombo", district: "Colombo", coordinates: { lat: 6.9271, lon: 79.8612 } },
  { id: 3, DivisionalSecretariats: "Galle", district: "Galle", coordinates: { lat: 6.0535, lon: 80.2210 } }
];

const Hero = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchLocationStatus = async (divisionalSecretariat) => {
    try {
      const docRef = doc(db, "Location_Status", "divisionalSecretariats");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const trimmedName = divisionalSecretariat.trim(); // Trim any spaces

        if (data[trimmedName]) {
          const statusData = data[trimmedName];
          return {
            safetyStatus: statusData.Safety || false,
            volunteerStatus: statusData["Volunteer Need"] || false,
            warningStatus: statusData.WarningStatus || 'Low'
          };
        } else {
          console.log(`No data found for ${divisionalSecretariat}`);
          return {
            safetyStatus: true,
            volunteerStatus: false,
            warningStatus: 'Low'
          };
        }
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error('Error fetching location status:', error);
      return null;
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Weather data fetch failed');
      const data = await response.json();
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = divisionalSecretariats.filter(ds =>
        ds.DivisionalSecretariats.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleLocationSelect = async (location) => {
    setSearchQuery(location.DivisionalSecretariats);
    setShowSuggestions(false);
    setLoading(true);
    setSelectedLocation(location);

    try {
      const [weather, status] = await Promise.all([
        fetchWeatherData(location.coordinates.lat, location.coordinates.lon),
        fetchLocationStatus(location.DivisionalSecretariats)
      ]);

      setWeatherData(weather);
      setLocationStatus(status);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    const location = divisionalSecretariats.find(ds =>
      ds.DivisionalSecretariats.toLowerCase() === searchQuery.toLowerCase()
    );
    if (location) {
      handleLocationSelect(location);
    }
  };

  return (
    <div className="relative w-full min-h-fit overflow-hidden" style={{ maxWidth: '100%', maxHeight:'30rem'}}>
      <div className="absolute inset-0 w-full h-full" style={{ maxWidth: '100%', maxHeight:'30rem'}}>
        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" style={{ maxWidth: '100%', maxHeight:'30rem'}} />
        <div className="absolute inset-0 bg-black bg-opacity-60" style={{ maxWidth: '100%', maxHeight:'30rem'}} />
      </div>
      <div className="relative z-10 px-4 py-32 mx-auto max-w-screen-xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">{t("InfoUnity Response")}</h1>
        <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl">{t("Uniting Information, Empowering Response")}</p>
        
        <div className="w-full max-w-2xl mx-auto ">
          <div className="relative ">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search divisional secretariats...")}
              className="w-full px-4 py-3 pr-10 text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <button onClick={handleSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
              <Search size={20} />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full bg-gray-700 rounded-md shadow-lg z-20 mt-1">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="px-4 py-2 text-left text-white cursor-pointer hover:bg-gray-600"
                    onClick={() => handleLocationSelect(s)}
                  >
                    <MapPin size={16} className="inline-block mr-2 text-gray-400" />
                    {s.DivisionalSecretariats} ({t("District")}: {s.district})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className="w-full max-w-lg mx-auto mt-10">
            <Card className="bg-gray-800 border border-gray-700 text-white">
              <CardHeader className="border-b border-gray-700">
                <div className="text-lg font-medium">
                  {t("Weather and Response Status in")} {selectedLocation.DivisionalSecretariats}, {selectedLocation.district}
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <p className="text-gray-400">{t("Loading...")}</p>
                ) : (
                  <>
                    {weatherData && (
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xl font-semibold">{weatherData.temperature}°C</div>
                          <div className="text-sm text-gray-400 capitalize">{weatherData.description}</div>
                        </div>
                        <img
                          src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
                          alt={t("Weather Icon")}
                          className="w-12 h-12"
                        />
                      </div>
                    )}
                    <StatusIndicators
                      safetyStatus={locationStatus?.safetyStatus}
                      volunteerNeed={locationStatus?.volunteerStatus}
                      warningStatus={locationStatus?.warningStatus}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoUnitySection = () => {
  return (
    <div className="bg-gray-100 py-10 relative ">
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-10 px-4 -mt-20 ">
        <InfoUnityCard
          title="Information"
          description="Provide accurate, real-time information during disasters. Achieved through real-time mapping, AI chatbot, and disaster catalogue."
          icon={<MapPin size={28} />}
        />
        <InfoUnityCard
          title="Unity"
          description="Unite communities, volunteers, and authorities in disaster response efforts. Facilitated by volunteer management, missing person registry, and resource allocation features."
          icon={<Users size={28} />}
        />
        <InfoUnityCard
          title="Response"
          description="Enable swift, coordinated response to minimize disaster impact. Facilitated by volunteer management, missing person registry, and resource allocation features."
          icon={<AlertTriangle size={28} />}
        />
      </div>

  
      <ActionButtonsSection />
     

      <div className="flex justify-center px-4">
  <Button
    color="error"
    variant="outline"
    className="w-full max-w-md px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
  >
    <AlertOctagon size={24} />
    Report a Disaster
  </Button>
</div>
    </div>
  );
};

const InfoUnityCard = ({ title, description, icon }) => (
  <Card className="w-full md:w-80 p-4 text-center bg-white shadow-lg rounded-lg">
    <div className="flex justify-center mb-4 text-blue-500">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{description}</p>
  </Card>
);

const ActionButton = ({ label, icon, path }) => {
  const handleClick = () => {
    window.location.href = path;
  };

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col items-center w-40 p-4 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition cursor-pointer"
    >
      <div className="text-blue-500 mb-2">
        {icon}
      </div>
      <span className="text-gray-700 font-semibold">{label}</span>
    </div>
  );
};

const ActionButtonsSection = () => {
  const actions = [
    {
      label: "Realtime Maps",
      icon: <MapPin size={24} color="red" />,
      path: "/realtime-maps"
    },
    {
      label: "Support Chatbot",
      icon: <MessageCircle size={24} color="teal" />,
      path: "/support-chat"
    },
    {
      label: "Volunteer",
      icon: <Heart size={24} color="darkorange" />,
      path: "/volunteer"
    },
    {
      label: "Missing Person Registry",
      icon: <Search size={24} color="lightblue" />,
      path: "/missing-persons"
    },
    {
      label: "Resource Allocation",
      icon: <Users size={24} color="purple" />,
      path: "/resources"
    },
    {
      label: "Donate",
      icon: <DollarSign size={24} color="green" />,
      path: "/donate"
    }
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">WHAT ARE YOU HERE FOR?</h2>
      <div className="flex justify-center flex-wrap gap-6 mb-8 px-4">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            label={action.label}
            icon={action.icon}
            path={action.path}
          />
        ))}
      </div>
    </>
  );
};

const AccordionItem = ({ title, content, isOpen, onToggle, number }) => {
  return (
    <div className="border-b border-gray-700">
      <button
        className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{number}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-300">
          {content}
        </div>
      )}
    </div>
  );
};

const WhoAreWe = () => {
  const [openItem, setOpenItem] = useState(null);

  const accordionData = [
    {
      title: "What is the overarching vision of InfoUnity Response?",
      content: "InfoUnity Response envisions a future where communities are resilient in the face of disasters, empowered by seamless access to critical information and resources. We aim to revolutionize disaster management by creating a unified platform that bridges the gap between those affected by disasters and those responding to them. Our vision is to minimize the impact of disasters on human lives and livelihoods by leveraging cutting-edge technology to enable rapid, coordinated, and effective responses. Ultimately, we see InfoUnity Response as a catalyst for building more prepared, connected, and resilient communities worldwide."
    },
    {
      title: "How does InfoUnity Response's mission align with its technological operation?",
      content: "InfoUnity Response's mission is to provide a comprehensive, user-friendly platform that unifies disaster-related information, coordinates response efforts, and empowers communities to act swiftly and effectively during crises. This mission aligns perfectly with our technological approach of creating a Progressive Web Application (PWA) that's accessible across devices and network conditions. By leveraging technologies like React for a responsive interface, Firebase for real-time data synchronization and push notifications, and AI for predictive analysis and chatbot interactions, we ensure that our platform is not only technologically advanced but also highly practical and user-centric. Our use of multilingual support further reinforces our mission to make critical information accessible to all, regardless of language barriers."
    },
    {
      title: "What does the InfoUnity Response brand represent?",
      content: "The InfoUnity Response brand represents trust, innovation, and community empowerment in the face of adversity. Our brand embodies the idea that when information and people are united, we can respond more effectively to any challenge. This is reflected in our application through features like real-time disaster mapping, which showcases our commitment to providing trustworthy, up-to-date information. The volunteer management system exemplifies our focus on community empowerment, while the AI-powered chatbot demonstrates our innovative approach to problem-solving. The clean, intuitive interface of our app, combined with its robust functionality, reinforces our brand image as a reliable, cutting-edge solution for disaster management. Even our color scheme, predominantly using calming blues and energetic greens, is chosen to evoke a sense of trust and hope during challenging times."
    },
    {
      title: "What are the key responsibilities and duties?",
      content: "InfoUnity Response holds a significant responsibility towards its users and the communities it serves. Our primary duty is to ensure the accuracy and timeliness of the information we provide, as lives may depend on it during disasters. We have a responsibility to maintain the highest standards of data privacy and security, protecting sensitive information about affected individuals and responders. It's our duty to ensure the platform remains accessible and functional even under extreme conditions, which we achieve through offline capabilities and low-bandwidth optimizations. We are also responsible for fostering cooperation between various stakeholders - from individual volunteers to government agencies - to ensure a coordinated response. Additionally, we have a duty to continually improve our platform based on user feedback and evolving disaster management best practices, ensuring that InfoUnity Response remains an effective tool for saving lives and minimizing disaster impacts."
    },
    {
      title: "How does InfoUnity Response leverage technology?",
      content: "InfoUnity Response stays at the forefront of disaster management by strategically leveraging cutting-edge technologies. We utilize machine learning algorithms for disaster impact prediction and resource allocation, allowing for proactive rather than reactive responses. Our use of real-time data synchronization through Firebase ensures that all users have access to the most current information, critical in rapidly evolving disaster scenarios. The implementation of a Progressive Web App architecture allows our platform to function effectively even in low-connectivity areas often encountered during disasters. We incorporate AI-driven chatbots to provide immediate, contextual assistance to users, and employ geospatial technologies for accurate mapping and location-based services. By continuously exploring emerging technologies like improved natural language processing, advanced data analytics, and potentially augmented reality for on-ground assistance, we ensure that InfoUnity Response remains a technological leader in the disaster management field."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-800">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">WHO WE ARE AT INFO UNITY RESPONSE ?</h1>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Logo Section */}
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
            <img src={mainLogo} alt="Main Logo" className="w-full grayscale" />
            </div>
            <div className="flex justify-center gap-4 bg-gray-700 p-4 rounded-lg">
            <img src={redCrossLogo} alt="Partner Logo 1" className="w-24 h-auto" />
            <img src={dmcLogo} alt="Partner Logo 2" className="w-24 h-auto" />
              
            </div>
            
          </div>
          
          {/* Accordion */}
          <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            {accordionData.map((item, index) => (
              <AccordionItem
                key={index}
                number={`0${index + 1}`}
                title={item.title}
                content={item.content}
                isOpen={openItem === index}
                onToggle={() => setOpenItem(openItem === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Side: Images */}
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg p-20">
            <img src={mainLogo} alt="Main Logo" className="w-full grayscale" />
            </div>
            <div className="flex justify-center gap-4 bg-gray-700 p-4 rounded-lg">
              <p style={{color: 'white'}}>In Partnership With</p>
            <img src={redCrossLogo} alt="Partner Logo 1" className="w-24 h-auto" />
            <img src={dmcLogo} alt="Partner Logo 2" className="w-24 h-auto" />
            </div>
          </div>

          {/* Right Side: Accordion */}
          <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            {accordionData.map((item, index) => (
              <AccordionItem
                key={index}
                number={`0${index + 1}`}
                title={item.title}
                content={item.content}
                isOpen={openItem === index}
                onToggle={() => setOpenItem(openItem === index ? null : index)}
              />
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
};

const EmergencyCard = ({ title, image, path }) => {
  return (
    <Link 
      to={path}
      className="block w-64 h-72 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
      role="button"
      tabIndex={0}
    >
      {/* Image container with transparent background */}
      <div className="h-48 bg-transparent p-4">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Text container with solid background */}
      <div className="h-24 bg-gray-800 p-4">
        <h3 className="text-white text-center font-bold text-lg">{title}</h3>
      </div>
    </Link>
  );
};

const EmergencyResponseGrid = () => {
  const cards = [
    {
      title: "RESPONSE TO DROUGHTS",
      image: Drought,
      path: "/response/droughts"
    },
    {
      title: "RESPONSE TO TSUNAMIS",
      image: Tsunami,
      path: "/response/tsunamis"
    },
    {
      title: "RESPONSE TO RAIN / FLOOD",
      image: Flood,
      path: "/response/floods"
    },
    {
      title: "RESPONSE TO LANDSLIDES",
      image: Landslide,
      path: "/response/landslides"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-center mb-8">STAY INFORMED</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {cards.map((card, index) => (
          <EmergencyCard
            key={index}
            title={card.title}
            image={card.image}
            path={card.path}
          />
        ))}
      </div>
    </div>
  );
};



