// src/context/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const NotificationContext = createContext();

// Create a custom hook for using the context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Create the provider component
export const NotificationProvider = ({ children }) => {
  const [currentWarning, setCurrentWarning] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const showWarning = (warning) => {
    setCurrentWarning(warning);
  };

  const clearWarning = () => {
    setCurrentWarning(null);
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 5)); // Limit to 5 recent notifications
  };

  const dismissNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        currentWarning,
        showWarning,
        clearWarning,
        notifications,
        addNotification,
        dismissNotification,
        dismissAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};