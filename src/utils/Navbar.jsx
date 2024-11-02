import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, 
  Globe, 
  BookOpen, 
  Bot, 
  Users, 
  Wrench, 
  Search,
  AlertTriangle,
  User,
  Menu,
  X
} from 'lucide-react';

// Reusable dropdown component
const NavDropdown = ({ translationKey, icon: Icon, items, isOpen, onToggle, isMobile }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`${isMobile ? 'px-3 py-2' : 'relative dropdown-container'}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`
          ${isMobile 
            ? 'flex items-center w-full text-gray-700' 
            : 'px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md flex items-center'
          }
        `}
      >
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {t(translationKey)}
        <ChevronDown className={`ml-1 h-4 w-4 transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`
          ${isMobile 
            ? 'mt-2 pl-4 space-y-2' 
            : 'absolute top-full left-0 w-56 bg-white border rounded-md shadow-lg py-1 mt-1'
          }
        `}>
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center
                ${isMobile 
                  ? 'px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md' 
                  : 'px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm'
                }
              `}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {t(item.translationKey)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const NavigationBar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  const navItems = {
    learn: {
      translationKey: 'nav.learn',
      items: [
        { translationKey: 'nav.disasterCatalogue', icon: BookOpen, href: '#' },
        { translationKey: 'nav.aiChatbot', icon: Bot, href: '#' }
      ]
    },
    tools: {
      translationKey: 'nav.tools',
      items: [
        { translationKey: 'nav.responseManagement', icon: Wrench, href: '#' },
        { translationKey: 'nav.missingPersonRegistry', icon: Search, href: '#' }
      ]
    }
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setOpenDropdown(null);
  };

  const renderNavItems = () => (
    <>
      <a href="#" className={`
        ${isMobile 
          ? 'block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left' 
          : 'px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md'
        }
      `}>
        {t('nav.realtime')}
      </a>

      {Object.entries(navItems).map(([key, { translationKey, items }]) => (
        <NavDropdown
          key={key}
          translationKey={translationKey}
          items={items}
          isOpen={openDropdown === key}
          onToggle={() => handleDropdownToggle(key)}
          isMobile={isMobile}
        />
      ))}

      <a href="#" className={`
        flex items-center
        ${isMobile 
          ? 'px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md' 
          : 'px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md'
        }
      `}>
        <Users className="h-4 w-4 mr-2" />
        {t('nav.volunteer')}
      </a>
    </>
  );


  const renderLanguageSelector = () => (
    <div className={`${isMobile ? 'px-3 py-2' : 'relative dropdown-container'}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDropdownToggle('language');
        }}
        className={`
          ${isMobile 
            ? 'flex items-center w-full text-gray-700' 
            : 'p-2 rounded-md hover:bg-gray-100 flex items-center'
          }
        `}
      >
        <Globe className="h-5 w-5 text-gray-600 mr-2" />
        <span className={isMobile ? '' : 'ml-1 text-sm hidden xl:inline text-gray-700'}>
          {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
        </span>
        <ChevronDown className={`ml-1 h-4 w-4 text-gray-700 transform ${openDropdown === 'language' ? 'rotate-180' : ''}`} />
      </button>
      {openDropdown === 'language' && (
        <div className={`
          ${isMobile 
            ? 'mt-2 pl-4 space-y-2' 
            : 'absolute top-full right-0 w-32 bg-white border rounded-md shadow-lg py-1 mt-1'
          }
        `}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full text-left
                ${isMobile 
                  ? 'px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md' 
                  : 'px-4 py-2 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center mr-10">
              <img 
                src="/favicon-32x32.png" 
                alt={t('logo.alt')} 
                className="h-10 w-10 rounded-lg"
              />
              <span className="ml-2 text-lg font-bold whitespace-nowrap text-black">
                {t('InfoUnity Response')}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {renderNavItems()}
            </div>
          </div>

          {/* Right section */}
          <div className="hidden lg:flex items-center space-x-4">
            {renderLanguageSelector()}

            {/* SOS Button */}
            <button className="px-1 py-1 text-red-600 font-medium rounded-md border-2 border-red-600 hover:bg-red-50 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t('nav.sos')}</span>
            </button>

            {/* Login Button / Avatar */}
            {isLoggedIn ? (
              <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </button>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="px-4 py-2 text-white font-medium rounded-md bg-blue-900 hover:bg-blue-800"
              >
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {renderNavItems()}
            {renderLanguageSelector()}

            <div className="px-3 pt-4 space-y-2">
              <button className="w-full px-4 py-2 text-red-600 font-medium rounded-md border-2 border-red-600 hover:bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t('nav.sos')}
              </button>
              
              {isLoggedIn ? (
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-center">
                  <User className="h-6 w-6" />
                  <span className="ml-2">{t('nav.profile')}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="w-full px-4 py-2 text-white font-medium rounded-md bg-blue-900 hover:bg-blue-800"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;