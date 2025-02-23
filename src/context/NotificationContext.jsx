import React, { createContext, useState } from 'react';

const NotificationContext = createContext();

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
        <NotificationContext.Provider value={{ currentWarning, showWarning, clearWarning, notifications, addNotification, dismissNotification, dismissAllNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => React.useContext(NotificationContext);