// src/context/NotificationContext.js

import React, { createContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [currentWarning, setCurrentWarning] = useState(null);

    const showWarning = (warning) => {
        setCurrentWarning(warning);
    };

    const clearWarning = () => {
        setCurrentWarning(null);
    };

    return (
        <NotificationContext.Provider value={{ currentWarning, showWarning, clearWarning }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => React.useContext(NotificationContext);