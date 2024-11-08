import React from 'react';

const LoadingPage = () => {
  const videoStyle = {
    width: '200px', // Adjust the size as needed
    height: 'auto',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0', // Adjust to match your theme
  };

  const textStyle = {
    marginTop: '20px',
    fontSize: '1.5rem',
    color: '#333', // Adjust color to fit your design
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <div style={containerStyle}>
      <video src="/animation.webm" autoPlay loop muted style={videoStyle} />
      <h2 style={textStyle}>Info Unity Response</h2>
      <h4 >Your Response safety haven</h4>
    </div>
  );
};

export default LoadingPage;
