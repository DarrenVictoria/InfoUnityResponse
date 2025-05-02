import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import VerifiedDisasterTable from '../VerifiedDisasterTable';

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock Lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: jest.fn(() => <svg data-testid="alert-circle-icon" />),
}));

describe('VerifiedDisasterTable', () => {
  const mockNavigate = jest.fn();
  const mockDisasters = [
    {
      id: '1',
      status: 'Ongoing',
      datetime: { seconds: 1672531200 }, // Jan 1, 2023
      district: 'Colombo',
      division: 'Colombo',
      dsDivision: 'Colombo 1',
      Location: { latitude: 6.9271, longitude: 79.8612 },
      disasterType: 'Flood',
      deaths: 5,
      resources: ['Water', 'Food', 'Shelter'],
    },
    {
      id: '2',
      status: 'Ended',
      datetime: '2023-01-15T12:00:00',
      district: 'Gampaha',
      division: 'Gampaha',
      dsDivision: 'Gampaha 1',
      disasterType: 'Earthquake',
      deaths: 0,
      resources: 'Medical supplies,Generators',
    },
    {
      id: '3',
      status: 'Ongoing',
      datetime: new Date('2023-02-01T08:30:00'),
      district: 'Kandy',
      division: 'Kandy',
      dsDivision: 'Kandy 1',
      disasterType: 'Landslide',
      deaths: 2,
      resources: null,
    },
  ];

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ongoing disasters table correctly', () => {
    render(<VerifiedDisasterTable disasters={mockDisasters} tableType="ongoing" />);
    
    // Check table header
    expect(screen.getByText('Ongoing Verified Disasters')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    
    // Check column headers
    expect(screen.getByText('Date and Time')).toBeInTheDocument();
    expect(screen.getByText('Location Details')).toBeInTheDocument();
    expect(screen.getByText('Disaster Info')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check ongoing disasters are displayed (IDs 1 and 3)
    expect(screen.getByText('Colombo')).toBeInTheDocument();
    expect(screen.getByText('Kandy')).toBeInTheDocument();
    expect(screen.queryByText('Gampaha')).not.toBeInTheDocument();
    
    // Check formatted dates
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Feb 1, 2023/)).toBeInTheDocument();
    
    // Check disaster info
    expect(screen.getByText('Flood')).toBeInTheDocument();
    expect(screen.getByText('Landslide')).toBeInTheDocument();
    expect(screen.getByText('Deaths: 5')).toBeInTheDocument();
    expect(screen.getByText('Deaths: 2')).toBeInTheDocument();
    
    // Check view buttons
    const viewButtons = screen.getAllByText('View Details');
    expect(viewButtons).toHaveLength(2);
  });

  it('renders closed disasters table correctly', () => {
    render(<VerifiedDisasterTable disasters={mockDisasters} tableType="closed" />);
    
    expect(screen.getByText('Closed Verified Disasters')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    
    // Only the ended disaster should be shown (ID 2)
    expect(screen.getByText('Gampaha')).toBeInTheDocument();
    expect(screen.queryByText('Colombo')).not.toBeInTheDocument();
    expect(screen.queryByText('Kandy')).not.toBeInTheDocument();
    
    expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
    expect(screen.getByText('Earthquake')).toBeInTheDocument();
    expect(screen.queryByText('Deaths: 0')).not.toBeInTheDocument();
    
    const viewButtons = screen.getAllByText('View Details');
    expect(viewButtons).toHaveLength(1);
  });

  it('shows "No ongoing disasters found" when there are none', () => {
    const noOngoingDisasters = mockDisasters.filter(d => d.status === 'Ended');
    render(<VerifiedDisasterTable disasters={noOngoingDisasters} tableType="ongoing" />);
    
    expect(screen.getByText('No ongoing disasters found')).toBeInTheDocument();
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });

  it('shows "No closed disasters found" when there are none', () => {
    const noClosedDisasters = mockDisasters.filter(d => d.status !== 'Ended');
    render(<VerifiedDisasterTable disasters={noClosedDisasters} tableType="closed" />);
    
    expect(screen.getByText('No closed disasters found')).toBeInTheDocument();
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });

  it('navigates to disaster details when View Details is clicked', () => {
    render(<VerifiedDisasterTable disasters={mockDisasters} tableType="ongoing" />);
    
    const firstViewButton = screen.getAllByText('View Details')[0];
    fireEvent.click(firstViewButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/view-disaster/1');
  });

  it('handles invalid date formats gracefully', () => {
    const invalidDateDisasters = [
      {
        id: '4',
        status: 'Ongoing',
        datetime: 'invalid-date',
        district: 'Badulla',
        disasterType: 'Flood',
        deaths: 0,
      }
    ];
    
    render(<VerifiedDisasterTable disasters={invalidDateDisasters} tableType="ongoing" />);
    
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

 
});