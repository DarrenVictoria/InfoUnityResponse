import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageToggle from '../LanguageToggle';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('LanguageToggle', () => {
  test('renders all language buttons', () => {
    render(<LanguageToggle />);
    
    // Check if all three language buttons are rendered
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('සිංහල')).toBeInTheDocument();
    expect(screen.getByText('தமிழ்')).toBeInTheDocument();
  });

  test('calls changeLanguage when buttons are clicked', () => {
    const mockChangeLanguage = jest.fn();

    // Spy on useTranslation and mock its return value for this test
    jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
      i18n: {
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageToggle />);
    
    // Click each button and verify changeLanguage is called with correct language code
    fireEvent.click(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');

    fireEvent.click(screen.getByText('සිංහල'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('si');

    fireEvent.click(screen.getByText('தமிழ்'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('ta');
  });
});