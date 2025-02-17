// components/WarningPopup.jsx
import React, { useEffect } from 'react';
import { Modal, Button, Spacer } from '@nextui-org/react';
import warningSound from '../assets/warning-sound.mp3'; // Add a warning sound file in the assets folder

const WarningPopup = ({ warning, onClose }) => {
  const { type, severity, warningMessage, validFrom, validUntil, district, dsDivision } = warning;

  // Determine the theme color based on the warning type
  const getThemeColor = () => {
    switch (type) {
      case 'Flood':
        return 'blue';
      case 'Landslide':
        return 'orange';
      case 'Marine':
        return 'teal';
      default:
        return 'red';
    }
  };

  // Play warning sound when the popup is displayed
  useEffect(() => {
    const audio = new Audio(warningSound);
    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      fullScreen
      css={{
        backgroundColor: getThemeColor(),
        color: 'white',
        borderRadius: '0',
        border: `4px solid ${getThemeColor()}`,
      }}
    >
      <Modal.Header>
        <h3 style={{ color: 'white' }}>
          {type} Warning - {severity}
        </h3>
      </Modal.Header>
      <Modal.Body>
        <h4 style={{ color: 'white' }}>{warningMessage}</h4>
        <Spacer y={1} />
        <p style={{ color: 'white' }}>
          <strong>Location:</strong> {district} - {dsDivision}
        </p>
        <p style={{ color: 'white' }}>
          <strong>Valid From:</strong> {new Date(validFrom).toLocaleString()}
        </p>
        <p style={{ color: 'white' }}>
          <strong>Valid Until:</strong> {new Date(validUntil).toLocaleString()}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onClick={onClose}>
          Acknowledge
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WarningPopup;