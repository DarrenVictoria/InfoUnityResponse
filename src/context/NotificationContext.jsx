import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        // Load persisted notifications on initialization
        const saved = localStorage.getItem('activeNotifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [initialized, setInitialized] = useState(false);

    const addNotification = (notification) => {
        setNotifications(prev => {
            if (prev.some(n => n.messageId === notification.messageId)) {
                return prev;
            }
            const newNotifications = [notification, ...prev].slice(0, 5);
            // Persist notifications
            localStorage.setItem('activeNotifications', JSON.stringify(newNotifications));
            return newNotifications;
        });
    };

    const dismissNotification = (messageId) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.messageId !== messageId);
            // Persist notifications
            localStorage.setItem('activeNotifications', JSON.stringify(updated));
            return updated;
        });
    };
    const dismissAllNotifications = () => {
        setNotifications([]);
        localStorage.setItem('activeNotifications', '[]');
    };

    const value = {
        notifications,
        addNotification,
        dismissNotification,
        dismissAllNotifications,
        initialized,
        setInitialized
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};