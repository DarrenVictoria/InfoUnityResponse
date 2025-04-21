import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Droplets, Mountain, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

// Standardized interface for disaster updates
const DISASTER_TYPES = {
  EARTHQUAKE: 'earthquake',
  FLOOD: 'flood',
  LANDSLIDE: 'landslide',
  EPIDEMIC: 'epidemic',
  WARNING: 'warning',
  OTHER: 'other'
};

const DISASTER_CONFIG = {
  [DISASTER_TYPES.EARTHQUAKE]: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    iconColor: 'text-orange-500'
  },
  [DISASTER_TYPES.FLOOD]: {
    icon: Droplets,
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-500'
  },
  [DISASTER_TYPES.LANDSLIDE]: {
    icon: Mountain,
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    iconColor: 'text-yellow-500'
  },
  [DISASTER_TYPES.EPIDEMIC]: {
    icon: AlertCircle,
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    iconColor: 'text-red-500'
  },
  [DISASTER_TYPES.WARNING]: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    iconColor: 'text-yellow-600'
  },
  [DISASTER_TYPES.OTHER]: {
    icon: Info,
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    iconColor: 'text-gray-500'
  }
};

const DisasterUpdatesComponent = () => {
  const { t } = useTranslation();
  const [disasterReports, setDisasterReports] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'reports', 'warnings'
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch disaster reports from the disasters collection
    const disastersQuery = query(
      collection(db, "disasters"),
      orderBy("dateCommenced", "desc"),
      limit(10)
    );

    const disastersUnsubscribe = onSnapshot(disastersQuery, (snapshot) => {
      const reportsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isReport: true,
        type: doc.data().disasterType?.toLowerCase() || DISASTER_TYPES.OTHER,
        title: doc.data().name || t('updates.untitledDisaster'),
        description: doc.data().description || t('updates.noDescription'),
        location: `${doc.data().district || ''}, ${doc.data().division || ''}` || t('updates.unknownLocation'),
        status: 'Approved', // Most disaster reports should be approved
        createdBy: doc.data().reporterName || t('updates.anonymous'),
        timeStamp: doc.data().dateCommenced || new Date(),
        deaths: doc.data().deaths || 0,
        injured: doc.data().injured || 0,
        missing: doc.data().missing || 0,
        affectedPeople: doc.data().affectedPeople || 0,
        foodType: doc.data().foodType || null,
        infrastructure: doc.data().criticalInfrastructureDamages || []
      }));
      setDisasterReports(reportsList);
    });

    // Fetch warnings from the warnings collection
    const warningsQuery = query(
      collection(db, "warnings"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const warningsUnsubscribe = onSnapshot(warningsQuery, (snapshot) => {
      const warningsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isWarning: true,
        type: DISASTER_TYPES.WARNING,
        title: doc.data().warningMessage || t('updates.untitledWarning'),
        description: doc.data().description || t('updates.noDescription'),
        location: `${doc.data().district || ''}, ${doc.data().dsDivision || ''}` || t('updates.unknownLocation'),
        status: 'Approved', // Warnings are pre-approved by DMC
        createdBy: 'DMC', // Disaster Management Center
        timeStamp: doc.data().createdAt || new Date(),
        validFrom: doc.data().validFrom || null,
        validUntil: doc.data().validUntil || null,
        severity: doc.data().severity || 'medium',
        windSpeed: doc.data().windSpeed || null
      }));
      setWarnings(warningsList);
    });

    // Also fetch from original updates collection for backward compatibility
    const updatesQuery = query(
      collection(db, "updates"),
      orderBy("timeStamp", "desc"),
      limit(10)
    );

    const updatesUnsubscribe = onSnapshot(updatesQuery, (snapshot) => {
      const updatesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Determine if this is a warning or report based on type
        isWarning: doc.data().type?.toLowerCase() === 'warning',
        isReport: doc.data().type?.toLowerCase() !== 'warning',
        type: doc.data().type?.toLowerCase() || DISASTER_TYPES.OTHER,
        title: doc.data().title || t('updates.untitledUpdate'),
        description: doc.data().description || t('updates.noDescription'),
        location: doc.data().location || t('updates.unknownLocation'),
        status: doc.data().status || 'Pending',
        createdBy: doc.data().createdBy || t('updates.anonymous'),
        timeStamp: doc.data().timeStamp || new Date(),
        magnitude: doc.data().magnitude || null,
        casualties: doc.data().casualties || null,
        damageLevel: doc.data().damageLevel || null,
        evacuationStatus: doc.data().evacuationStatus || null,
      }));
      
      // Add these to our current lists but avoid duplicates
      const newDisasterReports = updatesList.filter(update => !update.isWarning);
      const newWarnings = updatesList.filter(update => update.isWarning);
      
      setDisasterReports(current => {
        const existingIds = new Set(current.map(item => item.id));
        return [...current, ...newDisasterReports.filter(item => !existingIds.has(item.id))];
      });
      
      setWarnings(current => {
        const existingIds = new Set(current.map(item => item.id));
        return [...current, ...newWarnings.filter(item => !existingIds.has(item.id))];
      });
    });

    return () => {
      disastersUnsubscribe();
      warningsUnsubscribe();
      updatesUnsubscribe();
    };
  }, [t]);

  // Combine and filter updates based on active tab
  const getVisibleUpdates = () => {
    if (activeTab === 'reports') return disasterReports;
    if (activeTab === 'warnings') return warnings;
    
    // Return all updates sorted by timestamp
    return [...disasterReports, ...warnings].sort((a, b) => {
      const dateA = a.timeStamp?.seconds ? new Date(a.timeStamp.seconds * 1000) : new Date(a.timeStamp);
      const dateB = b.timeStamp?.seconds ? new Date(b.timeStamp.seconds * 1000) : new Date(b.timeStamp);
      return dateB - dateA;
    });
  };

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setScrollPosition(newPosition);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative bg-gray-100 py-6">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('updates.latestUpdates')}</h2>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm rounded-full transition ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('updates.all')}
            </button>
            <button 
              onClick={() => setActiveTab('warnings')}
              className={`px-3 py-1 text-sm rounded-full transition ${
                activeTab === 'warnings' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('updates.warnings')}
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1 text-sm rounded-full transition ${
                activeTab === 'reports' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('updates.reports')}
            </button>
          </div>
        </div>
        
        <div className="relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={t('updates.scrollLeft')}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={t('updates.scrollRight')}
          >
            <ChevronRight size={24} />
          </button>

          {getVisibleUpdates().length > 0 ? (
            <div 
              ref={containerRef}
              className="flex overflow-x-auto gap-4 py-2 scroll-smooth hide-scrollbar"
            >
              {getVisibleUpdates().map((update) => (
                update.isWarning ? (
                  <WarningCard 
                    key={update.id} 
                    warning={update} 
                    formatTimestamp={formatTimestamp}
                    t={t}
                  />
                ) : (
                  <DisasterReportCard 
                    key={update.id} 
                    report={update} 
                    formatTimestamp={formatTimestamp}
                    t={t}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              {t('updates.noUpdatesAvailable')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Card for disaster reports
const DisasterReportCard = ({ report, formatTimestamp, t }) => {
  const disasterConfig = DISASTER_CONFIG[report.type?.toLowerCase()] || DISASTER_CONFIG[DISASTER_TYPES.OTHER];
  const IconComponent = disasterConfig.icon;

  // Helper function to map status to display text
  const getStatusText = (status) => {
    const statusMap = {
      'Approved': t('updates.status.approved'),
      'Pending': t('updates.status.pending'),
      'Rejected': t('updates.status.rejected')
    };
    
    return statusMap[status] || t('updates.status.pending');
  };

  // Helper function to map damage level
  const getDamageLevelText = (level) => {
    if (!level) return '';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('severe')) return t('updates.damageLevels.severe');
    if (levelLower.includes('moderate')) return t('updates.damageLevels.moderate');
    if (levelLower.includes('minor')) return t('updates.damageLevels.minor');
    return level;
  };

  // Helper function to map evacuation status
  const getEvacuationStatusText = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('required')) return t('updates.evacuationStatuses.required');
    if (statusLower.includes('recommended')) return t('updates.evacuationStatuses.recommended');
    if (statusLower.includes('not required')) return t('updates.evacuationStatuses.notRequired');
    return status;
  };

  return (
    <div className={`flex-shrink-0 w-80 p-4 rounded-lg border-l-4 ${disasterConfig.bgColor} ${disasterConfig.borderColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${disasterConfig.iconColor}`} />
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            {t('updates.disasterReport')}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatTimestamp(report.timeStamp)}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">{report.title}</h3>
        <p className="text-sm text-gray-600">{report.location}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
        
        {/* Show magnitude for earthquakes */}
        {report.magnitude && (
          <p className="text-sm text-gray-600">
            {t('updates.magnitude')}: {report.magnitude}
          </p>
        )}

        {/* Show casualties if any field is present */}
        {(report.deaths > 0 || report.injured > 0 || report.missing > 0 || report.affectedPeople > 0 || report.casualties) && (
          <div className="mt-2 p-2 bg-white rounded-md">
            <p className="text-xs font-semibold text-gray-700 mb-1">{t('updates.casualties')}:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {report.deaths > 0 && (
                <p className="text-xs text-gray-600">{t('updates.deaths')}: {report.deaths}</p>
              )}
              {report.injured > 0 && (
                <p className="text-xs text-gray-600">{t('updates.injured')}: {report.injured}</p>
              )}
              {report.missing > 0 && (
                <p className="text-xs text-gray-600">{t('updates.missing')}: {report.missing}</p>
              )}
              {report.affectedPeople > 0 && (
                <p className="text-xs text-gray-600">{t('updates.affected')}: {report.affectedPeople}</p>
              )}
              {report.casualties && (
                <p className="text-xs text-gray-600 col-span-2">{t('updates.casualties')}: {report.casualties}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Show damage level if present */}
        {report.damageLevel && (
          <p className="text-sm text-gray-600">
            {t('updates.damageLevel')}: {getDamageLevelText(report.damageLevel)}
          </p>
        )}
        
        {/* Show evacuation status if present */}
        {report.evacuationStatus && (
          <p className="text-sm text-gray-600">
            {t('updates.evacuationStatus')}: {getEvacuationStatusText(report.evacuationStatus)}
          </p>
        )}
        
        {/* Infrastructure damage */}
        {report.infrastructure && report.infrastructure.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-700">{t('updates.infrastructure')}:</p>
            <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
              {report.infrastructure.slice(0, 2).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {report.infrastructure.length > 2 && (
                <li className="italic">{report.infrastructure.length - 2} {t('common.more')}...</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Food type if present */}
        {report.foodType && (
          <p className="text-sm text-gray-600">{t('updates.foodType')}: {report.foodType}</p>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {t('updates.createdBy')}: {report.createdBy}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${
          report.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusText(report.status)}
        </span>
      </div>
    </div>
  );
};

// Card for warning updates
const WarningCard = ({ warning, formatTimestamp, t }) => {
  const warningConfig = DISASTER_CONFIG[DISASTER_TYPES.WARNING];
  const IconComponent = warningConfig.icon;
  const { i18n } = useTranslation(); // Get i18n instance to access current language

  // Map severity to colors and translated text
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    red: 'bg-red-100 text-red-900 font-bold'
  };

  const getSeverityText = (severity) => {
    if (!severity) return t('warnings.severity.medium');
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('low')) return t('warnings.severity.low');
    if (severityLower.includes('medium')) return t('warnings.severity.medium');
    if (severityLower.includes('high')) return t('warnings.severity.high');
    if (severityLower.includes('red')) return t('warnings.severity.red');
    return severity;
  };

  // Function to get the translated warning message based on current language
  const getTranslatedWarningMessage = () => {
    // Check if warning has _warningmessage object (as shown in Firestore)
    if (warning._warningmessage) {
      // Get current language
      const currentLang = i18n.language;
      // Return translation for current language, fallback to English, then to default warningMessage
      return warning._warningmessage[currentLang] || 
             warning._warningmessage.en || 
             warning.warningMessage || 
             t('updates.untitledWarning');
    }
    // If no translations object exists, use the warningMessage or fallback
    return warning.warningMessage || t('updates.untitledWarning');
  };

  const severityColor = severityColors[warning.severity?.toLowerCase()] || severityColors.medium;

  return (
    <div className={`flex-shrink-0 w-80 p-4 rounded-lg border-l-4 ${warningConfig.bgColor} ${warningConfig.borderColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${warningConfig.iconColor}`} />
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            {t('warnings.warning')}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatTimestamp(warning.timeStamp || warning.createdAt)}
        </span>
      </div>

      <div className="space-y-2">
        {/* Use the translated warning message */}
        <h3 className="font-semibold">{getTranslatedWarningMessage()}</h3>
        <p className="text-sm text-gray-600">{warning.location || `${warning.dsDivision}, ${warning.district}`}</p>
        
        {warning.description && warning.description.trim() !== "" && (
          <p className="text-sm text-gray-600 line-clamp-2">{warning.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-1">
          {warning.alertLevel && (
            <span className={`px-2 py-1 text-xs rounded-full ${severityColor}`}>
              {t('warnings.severity.severity')}: {getSeverityText(warning.alertLevel || warning.currentLevel)}
            </span>
          )}
        </div>
        
        {(warning.validFrom || warning.validUntil) && (
          <div className="mt-2 p-2 bg-white rounded-md">
            <p className="text-xs font-semibold text-gray-700 mb-1">{t('warnings.validity')}:</p>
            <div className="text-xs text-gray-600">
              {warning.validFrom && (
                <p>{t('warnings.from')}: {formatTimestamp(warning.validFrom)}</p>
              )}
              {warning.validUntil && (
                <p>{t('warnings.until')}: {formatTimestamp(warning.validUntil)}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {warning.windSpeed && (
            <p className="text-gray-600">{t('warnings.windSpeed')}: {warning.windSpeed}</p>
          )}
          {warning.incidentType && (
            <p className="text-gray-600">{t('warnings.type')}: {warning.incidentType}</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          {t('updates.issuedBy')}: {warning.createdBy || 'DMC'}
        </span>
      </div>
    </div>
  );
};



export default DisasterUpdatesComponent;