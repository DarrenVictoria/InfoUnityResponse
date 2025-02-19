// src/components/WarningPopup.js

import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const WarningPopup = () => {
    const { currentWarning, clearWarning } = useNotification();

    useEffect(() => {
        if (currentWarning) {
            // Play warning sound
            const audio = new Audio('/sounds/warning_sound.mp3');
            audio.play();

            // Set timeout to clear warning after 10 seconds
            const timeout = setTimeout(() => {
                clearWarning();
            }, 10000);

            return () => clearTimeout(timeout);
        }
    }, [currentWarning, clearWarning]);

    if (!currentWarning) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            border: `10px solid ${currentWarning.borderColor}`,
            color: 'white',
            fontSize: '2rem',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div>
                <h1>{currentWarning.title}</h1>
                <p>{currentWarning.body}</p>
            </div>
        </div>
    );
};

export default WarningPopup;