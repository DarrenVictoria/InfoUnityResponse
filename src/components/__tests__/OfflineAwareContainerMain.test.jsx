import React from 'react'
import { render, screen } from '@testing-library/react'
import OfflineAwareContainerMain from '../OfflineAwareContainerMain'

// Mock window.caches
global.caches = {
  keys: jest.fn(() => Promise.resolve([])),
  open: jest.fn(() => Promise.resolve({
    keys: jest.fn(() => Promise.resolve([]))
  }))
}

describe('OfflineAwareContainerMain', () => {
  test('renders children when online', () => {
    // Set navigator.onLine to true
    Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true })

    render(
      <OfflineAwareContainerMain pageName="test-page">
        <div data-testid="child-content">Test Content</div>
      </OfflineAwareContainerMain>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  test('shows offline message when offline and page not cached', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true })

    render(
      <OfflineAwareContainerMain pageName="test-page" showFullPage={true}>
        <div data-testid="child-content">Test Content</div>
      </OfflineAwareContainerMain>
    )

    // Wait for async cache check
    await screen.findByText(/You're Offline/i)
    
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    expect(screen.getByText(/You're Offline/i)).toBeInTheDocument()
  })

  test('renders children with offline banner when not showing full page', () => {
    // Set navigator.onLine to false
    Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true })

    render(
      <OfflineAwareContainerMain pageName="test-page" showFullPage={false}>
        <div data-testid="child-content">Test Content</div>
      </OfflineAwareContainerMain>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText(/Currently offline/i)).toBeInTheDocument()
  })
})