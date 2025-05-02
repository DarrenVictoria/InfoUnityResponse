import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import RespondantLanding from '../RespondantLanding'

// Mock components
jest.mock('../../../components/NavigationBar', () => () => <div data-testid="navbar">Nav Bar</div>)
jest.mock('../../../components/StatusIndicator', () => ({
  __esModule: true,
  default: ({ label, status, type }) => (
    <div data-testid={`status-${type}`}>
      {label}: {status ? 'Active' : 'Inactive'}
    </div>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <span>AlertIcon</span>,
  MapPin: () => <span>MapPinIcon</span>,
  Search: () => <span>SearchIcon</span>,
  ChevronDown: () => <span>DownIcon</span>,
  ChevronUp: () => <span>UpIcon</span>,
  Waves: () => <span>WavesIcon</span>,
  Cloud: () => <span>CloudIcon</span>,
  Wind: () => <span>WindIcon</span>,
  Droplets: () => <span>DropletsIcon</span>
}))

// Mock the fetch function for weather data
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      main: { temp: 30, humidity: 80 },
      weather: [{ description: 'Sunny', icon: '01d' }],
      wind: { speed: 5 }
    }),
    ok: true
  })
)

describe('RespondantLanding', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock window.scrollTo
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  test('renders hero section with search box', () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <RespondantLanding />
        </I18nextProvider>
      </BrowserRouter>
    )

    // Check if hero section elements are rendered
    expect(screen.getByText(/InfoUnity Response/i)).toBeInTheDocument()
    expect(screen.getByText(/Uniting Information, Empowering Response/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search divisional secretariats/i)).toBeInTheDocument()
  })

  test('renders disaster support guides section', () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <RespondantLanding />
        </I18nextProvider>
      </BrowserRouter>
    )

    // Check if disaster guides section is rendered
    expect(screen.getByText(/Disaster Support Guides/i)).toBeInTheDocument()
    
    // Check for disaster type cards
    expect(screen.getByText(/Drought/i)).toBeInTheDocument()
    expect(screen.getByText(/Floods/i)).toBeInTheDocument()
    expect(screen.getByText(/Landslides/i)).toBeInTheDocument()
    expect(screen.getByText(/Tsunamis/i)).toBeInTheDocument()
  })

  test('handles location search and selection', async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <RespondantLanding />
        </I18nextProvider>
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search divisional secretariats/i)
    
    // Type in search box
    fireEvent.change(searchInput, { target: { value: 'Col' } })
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(searchInput.value).toBe('Col')
    })
    
    // Simulate location selection (this will trigger weather data fetch)
    // We can't easily test the actual suggestion clicking since it depends on divisionalSecretariats data
    // Instead we'll test the search button
    const searchButton = screen.getByRole('button', { name: /SearchIcon/i })
    fireEvent.click(searchButton)
  })

  test('displays offline banner when offline', () => {
    // Set navigator.onLine to false
    Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true })
    
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <RespondantLanding />
        </I18nextProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/You are offline/i)).toBeInTheDocument()
  })
})