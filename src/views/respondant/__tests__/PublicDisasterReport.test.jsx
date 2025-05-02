import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PublicDisasterReport from '../PublicDisasterReport'
import { addDoc, collection } from 'firebase/firestore'
import { saveReportOffline, synchronizePendingReports } from '../../../utils/offlineStorage'

// Mock components
jest.mock('../../../components/NavigationBar', () => () => <div data-testid="navbar">Nav Bar</div>)
jest.mock('../../../components/PreLocationSelector', () => ({
  __esModule: true,
  default: ({ onLocationChange }) => (
    <div data-testid="location-selector">
      <button onClick={() => onLocationChange('Colombo', 'Colombo')}>Select Location</button>
    </div>
  )
}))

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'user123' }
  }))
}))

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve())
}))

// Mock offlineStorage
jest.mock('../../../utils/offlineStorage', () => ({
  saveReportOffline: jest.fn(() => Promise.resolve()),
  synchronizePendingReports: jest.fn(() => Promise.resolve({ success: true, message: 'Synchronized successfully' }))
}))

// Mock useConnectivity hook
jest.mock('../../../hooks/useConnectivity', () => ({
  useConnectivity: () => ({
    isOnline: true,
    isSyncing: false,
    synchronizePendingReports: jest.fn(() => Promise.resolve({ success: true, message: 'Synchronized successfully' }))
  })
}))

describe('PublicDisasterReport', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  test('renders form elements', () => {
    render(
      <BrowserRouter>
        <PublicDisasterReport />
      </BrowserRouter>
    )

    // Check for form title
    expect(screen.getByText(/Report a Disaster/i)).toBeInTheDocument()
    
    // Check for form fields
    expect(screen.getByLabelText(/Disaster Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByTestId('location-selector')).toBeInTheDocument()
  })

  test('submits form with data when online', async () => {
    render(
      <BrowserRouter>
        <PublicDisasterReport />
      </BrowserRouter>
    )

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Disaster Type/i), { 
      target: { value: 'Flood' } 
    })
    
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: 'Test flood report' } 
    })
    
    // Select location
    fireEvent.click(screen.getByText(/Select Location/i))
    
    // Submit the form
    fireEvent.click(screen.getByText(/Submit Report/i))
    
    // Check if addDoc was called
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled()
    })
    
    // Check for success message
    expect(screen.getByText(/Report submitted successfully/i)).toBeInTheDocument()
  })

  test('handles form submission when offline', async () => {
    // Mock offline status
    jest.mock('../../../hooks/useConnectivity', () => ({
      useConnectivity: () => ({
        isOnline: false,
        isSyncing: false,
        synchronizePendingReports: jest.fn()
      })
    }))
    
    render(
      <BrowserRouter>
        <PublicDisasterReport />
      </BrowserRouter>
    )

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Disaster Type/i), { 
      target: { value: 'Flood' } 
    })
    
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: 'Test flood report' } 
    })
    
    // Select location
    fireEvent.click(screen.getByText(/Select Location/i))
    
    // Submit the form
    fireEvent.click(screen.getByText(/Submit Report/i))
    
    // Check if saveReportOffline was called instead of addDoc
    await waitFor(() => {
      expect(saveReportOffline).toHaveBeenCalled()
    })
    
    // Check for success message
    expect(screen.getByText(/Report submitted successfully/i)).toBeInTheDocument()
  })

  test('handles synchronization button click', async () => {
    render(
      <BrowserRouter>
        <PublicDisasterReport />
      </BrowserRouter>
    )

    // Click sync button
    fireEvent.click(screen.getByText(/Synchronize Offline Reports/i))
    
    // Check if synchronizePendingReports was called
    await waitFor(() => {
      expect(synchronizePendingReports).toHaveBeenCalled()
    })
    
    // Check for success message
    expect(screen.getByText(/Synchronized successfully/i)).toBeInTheDocument()
  })
})