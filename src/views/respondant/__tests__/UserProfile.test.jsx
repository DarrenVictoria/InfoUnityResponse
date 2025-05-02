import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserProfile from '../UserProfile'
import { getAuth } from 'firebase/auth'
import { getDoc, doc, updateDoc, getFirestore } from 'firebase/firestore'

// Mock components
jest.mock('../../../components/NavigationBar', () => () => <div data-testid="navbar">Nav Bar</div>)

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'user123' }
  }))
}))

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({ id: 'user123' })),
  getDoc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve())
}))

describe('UserProfile', () => {
  beforeEach(() => {
    // Setup default mock implementation
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        fullName: 'John Doe',
        email: 'john@example.com',
        nicNumber: '123456789012',
        mobileNumber: '+94777123456',
        district: 'Colombo',
        division: 'Colombo',
        bloodType: 'O+',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+94777987654'
        }
      })
    })
  })

  test('renders profile sections', async () => {
    render(<UserProfile />)
    
    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText(/Personal Information/i)).toBeInTheDocument()
    })
    
    // Check if all sections are rendered
    expect(screen.getByText(/Emergency Contact/i)).toBeInTheDocument()
    expect(screen.getByText(/Medical Information/i)).toBeInTheDocument()
    
    // Check if data is displayed
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument()
  })

  test('handles form input changes', async () => {
    render(<UserProfile />)
    
    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText(/Personal Information/i)).toBeInTheDocument()
    })
    
    // Change some input values
    const nameInput = screen.getByLabelText(/Full Name/i)
    fireEvent.change(nameInput, { target: { value: 'John Smith' } })
    
    // Check if input value was updated
    expect(nameInput.value).toBe('John Smith')
  })

  test('submits updated profile', async () => {
    render(<UserProfile />)
    
    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText(/Personal Information/i)).toBeInTheDocument()
    })
    
    // Change an input value
    const nameInput = screen.getByLabelText(/Full Name/i)
    fireEvent.change(nameInput, { target: { value: 'John Smith' } })
    
    // Find and click the save button
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)
    
    // Check if updateDoc was called
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled()
    })
    
    // Check that we display the success message
    expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
  })

  test('handles profile loading error', async () => {
    // Setup error case
    getDoc.mockRejectedValue(new Error('Failed to load profile'))
    
    render(<UserProfile />)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument()
    })
  })
})