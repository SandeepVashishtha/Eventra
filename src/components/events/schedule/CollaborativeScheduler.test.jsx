/**
 * Tests for CollaborativeScheduler Component
 * Tests the collaborative schedule builder functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollaborativeScheduler from './CollaborativeScheduler';

describe('CollaborativeScheduler', () => {
  const mockSlots = [
    {
      id: 'slot-1',
      title: 'Keynote Speech',
      startTime: '2024-01-15T10:00:00',
      endTime: '2024-01-15T11:00:00',
      location: 'Main Stage',
      speaker: 'John Doe',
      description: 'Opening keynote address',
      color: '#6366f1'
    },
    {
      id: 'slot-2',
      title: 'Workshop',
      startTime: '2024-01-15T12:00:00',
      endTime: '2024-01-15T14:00:00',
      location: 'Room A',
      speaker: 'Jane Smith',
      description: 'Hands-on workshop',
      color: '#ec4899'
    }
  ];

  const mockOrganizers = [
    { id: 'org-1', name: 'Alice', email: 'alice@example.com' },
    { id: 'org-2', name: 'Bob', email: 'bob@example.com' }
  ];

  beforeEach(() => {
    // Mock Yjs imports
    jest.mock('../../../../utils/crdt/scheduleStore', () => ({
      ScheduleCRDTStore: jest.fn().mockImplementation(() => ({
        init: jest.fn().mockResolvedValue(true),
        isConnected: jest.fn().mockReturnValue(true),
        getSyncStatus: jest.fn().mockReturnValue('synced'),
        updateSlot: jest.fn().mockReturnValue(true),
        removeSlot: jest.fn().mockReturnValue(true),
        getAllSlots: jest.fn().mockReturnValue(mockSlots),
        updateOrganizer: jest.fn().mockReturnValue(true),
        getAllOrganizers: jest.fn().mockReturnValue(mockOrganizers),
        updateCursor: jest.fn().mockReturnValue(true),
        getAllCursors: jest.fn().mockReturnValue({}),
        bindToCanvas: jest.fn().mockReturnValue(true),
        getCanvasCoordinates: jest.fn().mockReturnValue(null),
        disconnect: jest.fn(),
        getDocument: jest.fn().mockReturnValue({})
      })),
      createScheduleStore: jest.fn().mockImplementation(() => new MockStore())
    }));
  });

  it('renders without crashing', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
        organizerName="Test User"
      />
    );
    
    expect(screen.getByText('Collaborative Schedule Builder')).toBeInTheDocument();
  });

  it('displays the add slot button', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
      />
    );
    
    expect(screen.getByText('Add Slot')).toBeInTheDocument();
  });

  it('shows sync status', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
      />
    );
    
    expect(screen.getByText(/Live/)).toBeInTheDocument();
  });

  it('displays grid toggle button', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
      />
    );
    
    const gridButton = screen.getByTitle(/grid/);
    expect(gridButton).toBeInTheDocument();
  });

  it('has zoom controls', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
      />
    );
    
    expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays initial slots', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
        initialSlots={mockSlots}
      />
    );
    
    // Should display the first slot title
    expect(screen.getByText('Keynote Speech')).toBeInTheDocument();
    expect(screen.getByText('Workshop')).toBeInTheDocument();
  });

  it('displays organizer information', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
        organizerName="Test User"
        initialOrganizers={mockOrganizers}
      />
    );
    
    // CoOrganizerPresenceBar should show organizer count
    expect(screen.getByText(/Organizers/)).toBeInTheDocument();
  });

  it('shows save button when onSave is provided', () => {
    const mockSave = jest.fn();
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
        onSave={mockSave}
      />
    );
    
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not show save button when onSave is not provided', () => {
    render(
      <CollaborativeScheduler
        eventId="test-event"
        organizerId="test-organizer"
      />
    );
    
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});

// Mock implementation for testing
class MockStore {
  constructor() {
    this.initialized = false;
    this.slots = [];
    this.organizers = [];
  }

  async init() {
    this.initialized = true;
    return Promise.resolve();
  }

  isConnected() {
    return this.initialized;
  }

  getSyncStatus() {
    return this.initialized ? 'synced' : 'disconnected';
  }

  updateSlot(id, data) {
    return true;
  }

  removeSlot(id) {
    return true;
  }

  getAllSlots() {
    return this.slots;
  }

  updateOrganizer(id, data) {
    return true;
  }

  getAllOrganizers() {
    return this.organizers;
  }

  updateCursor(id, position) {
    return true;
  }

  getAllCursors() {
    return {};
  }

  bindToCanvas(id, coords) {
    return true;
  }

  getCanvasCoordinates(id) {
    return null;
  }

  disconnect() {
    this.initialized = false;
  }

  getDocument() {
    return {};
  }
}
