import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  CheckCircle,
  BellRing,
  PlusCircle,
  Package,
  AlertTriangle,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Reusable dropdown component
const NavDropdown = ({
  translationKey,
  icon: Icon,
  items,
  isOpen,
  onToggle,
  isMobile,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${isMobile ? "px-3 py-2" : "relative dropdown-container"}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`
          ${
            isMobile
              ? "flex items-center w-full text-gray-200"
              : "px-3 py-2 text-gray-200 hover:text-white rounded-md flex items-center"
          }
        `}
      >
        {Icon && <Icon className="h-4 w-4 mr-1" />}
        {t(translationKey)}
        <ChevronDown
          className={`ml-1 h-4 w-4 transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className={`
          ${
            isMobile
              ? "mt-2 pl-4 space-y-2"
              : "absolute top-full left-0 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 mt-1"
          }
        `}
        >
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center
                ${
                  isMobile
                    ? "px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md"
                    : "px-4 py-2 text-gray-200 hover:bg-gray-700 text-sm"
                }
              `}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {t(item.translationKey)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminNavigationBar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user, roles, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "si", name: "සිංහල" },
    { code: "ta", name: "தமிழ்" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { translationKey: "nav.dashboard", icon: LayoutDashboard, href: "/dmc/home" },
    { translationKey: "nav.verifyDisaster", icon: CheckCircle, href: "/dmc/managedisasters" },
    { translationKey: "nav.sendWarning", icon: BellRing, href: "/dmc/WarningForm" },
    { translationKey: "nav.addDisaster", icon: PlusCircle, href: "/dmc/adddisaster" },
    { translationKey: "nav.manageResource", icon: Package, href: "/dmc/resourcemanage" }
  ];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLogout = async (e) => {
    e?.preventDefault();
    try {
      await logout();
      setIsMenuOpen(false);
      setOpenDropdown(null);
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setOpenDropdown(null);
  };

  const handleProfileToggle = (e) => {
    e?.stopPropagation(); // Prevent event bubbling
    if (isMobile) {
      setOpenDropdown(openDropdown === "profile" ? null : "profile");
    } else {
      setIsProfileOpen(!isProfileOpen);
    }
  };

  const renderMobileMenu = () => (
    <div className="lg:hidden bg-gray-900 border-t border-gray-700">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {renderNavItems()}
        {renderLanguageSelector()}

        <div className="px-3 pt-4 space-y-2">
          {/* SOS Button */}
          <button 
            onClick={() => window.location.assign("/sos")}
            className="w-full px-4 py-2 text-red-400 font-medium rounded-md border-2 border-red-400 hover:bg-red-900 hover:bg-opacity-30 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {t("nav.sos")}
          </button>

          {user ? (
            <>
              <button
                onClick={handleProfileToggle}
                className="w-full px-4 py-2 text-gray-200 hover:bg-gray-800 rounded-md flex items-center justify-between transition-colors"
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-300" />
                  <span className="ml-2">
                    {user.displayName || t("nav.profile")}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform duration-200 ${
                    openDropdown === "profile" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openDropdown === "profile" && renderMobileProfileMenu()}
            </>
          ) : (
            <button
              onClick={() => (window.location.href = "/role-selection")}
              className="w-full px-4 py-2 text-white font-medium rounded-md bg-indigo-700 hover:bg-indigo-600 transition-colors"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const RoleBasedNavigation = ({ roles, setIsMenuOpen }) => {
    // Function to get the correct dashboard path based on role
    const getDashboardPath = (role) => {
      const roleLower = role.toLowerCase();
      
      switch (roleLower) {
        case 'respondent':
          return '/home';
        case 'volunteer':
          return '/volunteer/home';
        case 'dmc system admin':
          return '/dmc/home';
        case 'red cross manager':
          return '/voladm/home';
        default:
          return '/home'; // Default fallback path
      }
    };
  
    return (
      <div className="space-y-1 py-2">
        {roles?.map((role, index) => (
          <a
            key={index}
            href={getDashboardPath(role)}
            className="block px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {role} Dashboard
          </a>
        ))}
      </div>
    );
  };

  const renderMobileProfileMenu = () => {
    if (!user) return null;

    return (
      <div className="px-3 py-2 space-y-2 bg-gray-800 rounded-md mx-2">
        {/* User Info */}
        <div className="px-2 py-3 border-b border-gray-700">
          <p className="font-semibold text-gray-100">
            {user?.displayName || "User"}
          </p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>

        <RoleBasedNavigation roles={roles} setIsMenuOpen={setIsMenuOpen} />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4 mr-1" />
          {t("nav.logout")}
        </button>
      </div>
    );
  };

  const renderNavItems = () => (
    <>
      {adminNavItems.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={`
            flex items-center
            ${
              isMobile
                ? "block px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md text-left"
                : "px-3 py-2 text-gray-200 hover:text-white rounded-md"
            }
          `}
        >
          {item.icon && <item.icon className="h-4 w-4 mr-1" />}
          {t(item.translationKey)}
        </a>
      ))}
    </>
  );

  const renderLanguageSelector = () => (
    <div
      className={`${isMobile ? "px-3 py-2" : "relative dropdown-container"}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDropdownToggle("language");
        }}
        className={`
          ${
            isMobile
              ? "flex items-center w-full text-gray-200"
              : "p-2 rounded-md hover:bg-gray-700 flex items-center"
          }
        `}
      >
        <Globe className="h-5 w-5 text-gray-300 mr-1" />
        <span
          className={
            isMobile ? "" : "ml-1 text-sm hidden xl:inline text-gray-200"
          }
        >
          {languages.find((lang) => lang.code === i18n.language)?.name ||
            "English"}
        </span>
        <ChevronDown
          className={`ml-1 h-4 w-4 text-gray-300 transform ${
            openDropdown === "language" ? "rotate-180" : ""
          }`}
        />
      </button>
      {openDropdown === "language" && (
        <div
          className={`
          ${
            isMobile
              ? "mt-2 pl-4 space-y-2"
              : "absolute top-full right-0 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 mt-1"
          }
        `}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full text-left
                ${
                  isMobile
                    ? "px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md"
                    : "px-4 py-2 text-gray-200 hover:bg-gray-700"
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

  const renderProfileDropdown = () => (
    <div className="relative dropdown-container">
      <button
        onClick={handleProfileToggle}
        className="flex items-center p-2 hover:bg-gray-700 rounded-md transition-colors"
      >
        <User className="h-5 w-5 text-gray-300" />
        <ChevronDown
          className={`h-4 w-4 ml-1 transform transition-transform duration-200 ${
            isProfileOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <p className="font-semibold text-gray-100">
              {user?.displayName || "User"}
            </p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>

          <RoleBasedNavigation roles={roles} setIsMenuOpen={setIsMenuOpen} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 transition-colors border-t border-gray-700"
          >
            <LogOut className="h-4 w-4 mr-1 inline" />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-md z-[9999]">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 flex items-center justify-between h-16">
          <div
            className="flex items-center flex-shrink-0 cursor-pointer"
            onClick={() => (window.location.href = "/dmc/home")}
          >
            <img src="/favicon-32x32.png" alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-lg font-bold text-white">
              {t("InfoUnity Response")} <span className="text-indigo-400">Admin</span>
            </span>
          </div>

          {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {renderNavItems()}
        </div>

        {/* Right Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {renderLanguageSelector()}

            <button 
              onClick={() => window.location.assign("/sos")}
              className="px-1 py-1 text-red-400 font-medium rounded-md border-2 border-red-400 hover:bg-red-900 hover:bg-opacity-30 flex items-center transition-colors">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t("nav.sos")}</span>
            </button>

            {user ? (
              renderProfileDropdown()
            ) : (
              <button
                onClick={() => (window.location.href = "/role-selection")}
                className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                {t("nav.login")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setOpenDropdown(null);
            }}
            className="p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && renderMobileMenu()}
    </nav>
  );
};

export default AdminNavigationBar;