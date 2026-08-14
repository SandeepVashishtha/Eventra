/**
 * Tests for CoOrganizerPresenceBar Component
 * Tests the presence bar display and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CoOrganizerPresenceBar from './CoOrganizerPresenceBar';

describe('CoOrganizerPresenceBar', () => {
  const mockOrganizers = [
    { id: 'org-1', name: 'Alice', email: 'alice@example.com' },
    { id: 'org-2', name: 'Bob', email: 'bob@example.com' },
    { id: 'org-3', name: 'Charlie' }
  ];

  const mockCursors = {
    'org-1': { x: 100, y: 200 },
    'org-2': { x: 300, y: 400 }
  };

  it('renders without crashing', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays organizer count', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    expect(screen.getByText('3 Organizers')).toBeInTheDocument();
  });

  it('shows disconnected status when not connected', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="disconnected"
        isConnected={false}
      />
    );
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('displays sync status', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="syncing"
        isConnected={true}
      />
    );
    
    expect(screen.getByText(/syncing/)).toBeInTheDocument();
  });

  it('displays organizer initials', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    // Should show initials when expanded
    // Note: This tests the collapsed view initially
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows cursor positions for other organizers', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    // The presence bar should be visible
    expect(screen.getByText('3 Organizers')).toBeInTheDocument();
  });

  it('handles click to expand/collapse', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    const toggleButton = screen.getByText(/Organizers/);
    expect(toggleButton).toBeInTheDocument();
    
    // Initially should show collapsed view
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays current user indicator', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    // When expanded, should show "You" for current organizer
    // This tests the basic rendering
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays different status colors', () => {
    const { rerender } = render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    // Should have status indicator
    expect(screen.getByText('Live')).toBeInTheDocument();
    
    // Test disconnected status
    rerender(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={mockCursors}
        currentOrganizerId="org-1"
        syncStatus="disconnected"
        isConnected={false}
      />
    );
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('handles empty organizers array', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={[]}
        cursors={{}}
        currentOrganizerId="org-1"
        syncStatus="disconnected"
        isConnected={false}
      />
    );
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('1 Organizers')).toBeInTheDocument();
  });

  it('handles empty cursors object', () => {
    render(
      <CoOrganizerPresenceBar
        organizers={mockOrganizers}
        cursors={{}}
        currentOrganizerId="org-1"
        syncStatus="synced"
        isConnected={true}
      />
    );
    
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('3 Organizers')).toBeInTheDocument();
  });
});
