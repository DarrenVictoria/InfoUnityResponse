import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { NotificationService } from '../services/notificationService';
import { WarningService } from '../services/warningService';

const notificationService = new NotificationService();
const warningService = new WarningService();

// Create audio instance outside component to prevent recreation
const warningSound = new Audio('/sounds/warning_sound.mp3');

const playNotificationSound = () => {
    warningSound.currentTime = 0; // Reset sound to start
    warningSound.play().catch(error => {
        console.error('Error playing notification sound:', error);
    });
};

export const NotificationWrapper = ({ currentUser }) => {
    const {
        notifications,
        addNotification,
        dismissNotification,
        dismissAllNotifications,
        initialized,
        setInitialized
    } = useNotification();

    const handleNewNotification = (notification) => {
        addNotification(notification);
        playNotificationSound();
        notificationService.markAsSeen(notification.messageId);
    };

    useEffect(() => {
        const setupNotifications = async (userId, division) => {
            try {
                if (initialized) return;

                await notificationService.requestPermission(userId);

                notificationService.setupMessageListener((payload) => {
                    const { title, body, messageId, validFrom, validUntil } = payload.notification;
                    
                    if (notificationService.hasBeenSeen(messageId)) return;
                    
                    const warning = { title, body, messageId, validFrom, validUntil };
                    if (notificationService.isNotificationValid(warning)) {
                        handleNewNotification(warning);
                    }
                });

                const unsubscribe = warningService.subscribeToWarnings(
                    userId,
                    division,
                    (warning) => {
                        if (notificationService.hasBeenSeen(warning.messageId)) return;
                        
                        if (notificationService.isNotificationValid(warning)) {
                            handleNewNotification({
                                title: `${warning.type} Warning`,
                                body: warning.warningMessage,
                                messageId: warning.messageId,
                                validFrom: warning.validFrom,
                                validUntil: warning.validUntil
                            });
                        }
                    }
                );

                setInitialized(true);
                return () => unsubscribe();
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        };

        if (currentUser?.division && !initialized) {
            setupNotifications(currentUser.uid, currentUser.division);
        }
    }, [currentUser, initialized, addNotification, setInitialized]);

    // Preload sound on component mount
    useEffect(() => {
        warningSound.load();
    }, []);

    return (
        <NotificationPanel
            notifications={notifications}
            onDismiss={dismissNotification}
            onDismissAll={dismissAllNotifications}
        />
    );
};
