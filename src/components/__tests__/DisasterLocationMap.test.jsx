
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisasterLocationMap from '../DisasterLocationMap';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, ...props }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: jest.fn().mockImplementation(() => ({}))
}));

// Mock CSS import
jest.mock('leaflet/dist/leaflet.css', () => {});

describe('DisasterLocationMap', () => {
  const mockProps = {
    latitude: 40.7128,
    longitude: -74.0060,
    disasterType: 'Earthquake',
    location: 'New York City',
    riskLevel: 'High'
  };

  test('renders map container when coordinates are provided', () => {
    render(<DisasterLocationMap {...mockProps} />);
    
    // Check if map container is rendered
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    
    // Check if marker is rendered
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    
    // Check if popup content is rendered
    expect(screen.getByText('Earthquake')).toBeInTheDocument();
    expect(screen.getByText('Location: New York City')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('renders fallback message when coordinates are missing', () => {
    render(<DisasterLocationMap latitude={null} longitude={null} />);
    
    // Check if fallback message is displayed
    expect(screen.getByText('Location coordinates not available')).toBeInTheDocument();
    
    // Check if map container is not rendered
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
  });
});