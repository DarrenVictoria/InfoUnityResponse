import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PreLocationSelector from '../PreLocationSelector'

describe('PreLocationSelector', () => {
  const mockOnLocationChange = jest.fn()

  beforeEach(() => {
    mockOnLocationChange.mockClear()
  })

  test('renders with initial empty state', () => {
    render(<PreLocationSelector onLocationChange={mockOnLocationChange} />)

    expect(screen.getByText('-- Select District --')).toBeInTheDocument()
    expect(screen.queryByText('-- Select DS Division --')).not.toBeInTheDocument()
  })

  test('updates when district is selected', () => {
    render(<PreLocationSelector onLocationChange={mockOnLocationChange} />)

    // Find district dropdown and select a value
    const districtSelect = screen.getByRole('combobox')
    fireEvent.change(districtSelect, { target: { value: 'Colombo' } })

    // Division select should appear
    expect(screen.getByText('-- Select DS Division --')).toBeInTheDocument()
    
    // Check if onLocationChange was called with correct parameters
    expect(mockOnLocationChange).toHaveBeenCalledWith('Colombo', '')
  })

  test('handles both district and division selection', () => {
    render(<PreLocationSelector onLocationChange={mockOnLocationChange} />)

    // Select district
    const districtSelect = screen.getByRole('combobox')
    fireEvent.change(districtSelect, { target: { value: 'Colombo' } })

    // Then select division
    const divisionSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(divisionSelect, { target: { value: 'Colombo' } })

    // Check if onLocationChange was called with both values
    expect(mockOnLocationChange).toHaveBeenCalledWith('Colombo', 'Colombo')
  })

  test('initializes with provided district and division', () => {
    render(
      <PreLocationSelector 
        onLocationChange={mockOnLocationChange}
        initialDistrict="Gampaha"
        initialDivision="Negombo"
      />
    )

    // Both values should be preselected
    const selects = screen.getAllByRole('combobox')
    expect(selects[0].value).toBe('Gampaha')
    expect(selects[1].value).toBe('Negombo')

    // onLocationChange should be called on mount
    expect(mockOnLocationChange).toHaveBeenCalledWith('Gampaha', 'Negombo')
  })
})