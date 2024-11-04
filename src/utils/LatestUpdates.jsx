import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertCircle, AlertTriangle, Droplets, Mountain } from 'lucide-react';

// Standardized interface for disaster updates
const DISASTER_TYPES = {
  EARTHQUAKE: 'earthquake',
  FLOOD: 'flood',
  LANDSLIDE: 'landslide'
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
  }
};

const LatestUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updatesQuery = query(
      collection(db, "updates"),
      orderBy("timeStamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(updatesQuery, (snapshot) => {
      const updatesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist with defaults
        type: doc.data().type?.toLowerCase() || 'other',
        title: doc.data().title || 'Untitled Update',
        description: doc.data().description || 'No description provided',
        location: doc.data().location || 'Location unknown',
        status: doc.data().status || 'Pending',
        createdBy: doc.data().createdBy || 'Anonymous',
        timeStamp: doc.data().timeStamp || new Date(),
        magnitude: doc.data().magnitude || null,
        casualties: doc.data().casualties || null,
        damageLevel: doc.data().damageLevel || null,
        evacuationStatus: doc.data().evacuationStatus || null,
      }));
      setUpdates(updatesList);
    });

    return () => unsubscribe();
  }, []);

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
    return date.toLocaleString('en-US', {
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
        <h2 className="text-xl font-bold mb-4">LATEST UPDATES</h2>
        
        <div className="relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={containerRef}
            className="flex overflow-x-auto gap-4 py-2 scroll-smooth hide-scrollbar"
          >
            {updates.map((update) => (
              <UpdateCard 
                key={update.id} 
                update={update} 
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateCard = ({ update, formatTimestamp }) => {
  const disasterConfig = DISASTER_CONFIG[update.type?.toLowerCase()] || {
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    iconColor: 'text-gray-500'
  };

  const IconComponent = disasterConfig.icon;

  return (
    <div className={`flex-shrink-0 w-80 p-4 rounded-lg border-l-4 ${disasterConfig.bgColor} ${disasterConfig.borderColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${disasterConfig.iconColor}`} />
          <span className={`px-2 py-1 text-xs rounded-full ${
            update.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {update.status}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatTimestamp(update.timeStamp)}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">{update.title}</h3>
        <p className="text-sm text-gray-600">{update.location}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{update.description}</p>
        
        {/* Conditional fields based on disaster type */}
        {update.magnitude && (
          <p className="text-sm text-gray-600">Magnitude: {update.magnitude}</p>
        )}
        {update.casualties && (
          <p className="text-sm text-gray-600">Casualties: {update.casualties}</p>
        )}
        {update.damageLevel && (
          <p className="text-sm text-gray-600">Damage Level: {update.damageLevel}</p>
        )}
        {update.evacuationStatus && (
          <p className="text-sm text-gray-600">Evacuation Status: {update.evacuationStatus}</p>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Created by: {update.createdBy}
      </div>
    </div>
  );
};

export default LatestUpdates;