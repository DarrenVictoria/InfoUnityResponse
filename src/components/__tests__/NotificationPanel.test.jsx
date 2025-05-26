import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationPanel from '../NotificationPanel';

// Mock the CSS import
jest.mock('./NotificationPanel.css', () => ({}));

// Mock the history object
const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('NotificationPanel', () => {
  const mockOnDismiss = jest.fn();
  const mockOnDismissAll = jest.fn();

  const sampleNotifications = [
    {
      title: 'Test Notification 1',
      body: 'This is the first test notification',
      data: { type: 'general' }
    },
    {
      title: 'Missing Person Match',
      body: 'A match has been found for a missing person',
      data: { type: 'missingPersonMatch', missingPersonId: '123' }
    }
  ];

  beforeEach(() => {
    mockOnDismiss.mockClear();
    mockOnDismissAll.mockClear();
    mockHistoryPush.mockClear();
  });

  test('renders notifications correctly', () => {
    render(
      <NotificationPanel
        notifications={sampleNotifications}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.getByText('This is the first test notification')).toBeInTheDocument();
    expect(screen.getByText('Missing Person Match')).toBeInTheDocument();
    expect(screen.getByText('A match has been found for a missing person')).toBeInTheDocument();
  });

  test('renders close all button when notifications exist', () => {
    render(
      <NotificationPanel
        notifications={sampleNotifications}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    expect(screen.getByText('Close All')).toBeInTheDocument();
  });

  test('does not render close all button when no notifications', () => {
    render(
      <NotificationPanel
        notifications={[]}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    expect(screen.queryByText('Close All')).not.toBeInTheDocument();
  });

  test('calls onDismiss when X button is clicked', () => {
    render(
      <NotificationPanel
        notifications={sampleNotifications}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    const dismissButtons = screen.getAllByTestId('x-icon');
    fireEvent.click(dismissButtons[0]);

    expect(mockOnDismiss).toHaveBeenCalledWith(0);
  });

  test('calls onDismissAll when Close All button is clicked', () => {
    render(
      <NotificationPanel
        notifications={sampleNotifications}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    const closeAllButton = screen.getByText('Close All');
    fireEvent.click(closeAllButton);

    expect(mockOnDismissAll).toHaveBeenCalled();
  });

  test('renders alert circle icons for each notification', () => {
    render(
      <NotificationPanel
        notifications={sampleNotifications}
        onDismiss={mockOnDismiss}
        onDismissAll={mockOnDismissAll}
      />
    );

    const alertIcons = screen.getAllByTestId('alert-circle-icon');
    expect(alertIcons).toHaveLength(2);
  });
});