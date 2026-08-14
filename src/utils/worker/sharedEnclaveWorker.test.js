/**
 * sharedEnclaveWorker.test.js
 * 
 * Tests for the SharedEnclaveWorker and related utilities
 */

// Mock the worker environment
const originalSelf = global.self;
const originalWindow = global.window;

describe('SharedEnclaveWorker', () => {
  let mockWorker;
  let mockPorts;
  let MessageChannel;
  let SharedWorker;

  beforeAll(() => {
    // Save original globals
    global.self = global.self || {};
    global.window = global.window || {};
  });

  afterAll(() => {
    // Restore original globals
    global.self = originalSelf;
    global.window = originalWindow;
  });

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Create mock MessageChannel
    MessageChannel = jest.fn().mockImplementation(() => ({
      port1: {
        postMessage: jest.fn(),
        onmessage: null,
        start: jest.fn(),
        close: jest.fn(),
      },
      port2: {
        postMessage: jest.fn(),
        onmessage: null,
        start: jest.fn(),
        close: jest.fn(),
      },
    }));

    // Create mock SharedWorker
    SharedWorker = jest.fn().mockImplementation((url, options) => {
      const mockPort = {
        postMessage: jest.fn(),
        onmessage: null,
        start: jest.fn(),
        close: jest.fn(),
      };
      
      const worker = {
        port: mockPort,
        terminate: jest.fn(),
      };
      
      // Simulate onconnect after creation
      setTimeout(() => {
        if (mockPort.onmessage) {
          mockPort.onmessage({
            data: { type: 'WORKER_INIT', payload: {} },
          });
        }
      }, 0);
      
      return worker;
    });

    global.MessageChannel = MessageChannel;
    global.SharedWorker = SharedWorker;
    global.WebSocket = jest.fn();
  });

  afterEach(() => {
    delete global.MessageChannel;
    delete global.SharedWorker;
    delete global.WebSocket;
  });

  describe('sharedWorkerManager', () => {
    let sharedWorkerManager;

    beforeEach(() => {
      // Import after mocks are set up
      jest.resetModules();
    });

    test('isSharedWorkerSupported returns true when SharedWorker is available', () => {
      global.SharedWorker = SharedWorker;
      global.window = {};
      
      const { isSharedWorkerSupported } = require('./sharedWorkerManager');
      expect(isSharedWorkerSupported()).toBe(true);
    });

    test('isSharedWorkerSupported returns false when SharedWorker is not available', () => {
      delete global.SharedWorker;
      global.window = {};
      
      const { isSharedWorkerSupported } = require('./sharedWorkerManager');
      expect(isSharedWorkerSupported()).toBe(false);
    });

    test('getWorkerStatus returns initial state', () => {
      const { getWorkerStatus } = require('./sharedWorkerManager');
      const status = getWorkerStatus();
      
      expect(status).toHaveProperty('isInitialized', false);
      expect(status).toHaveProperty('isSupported', false);
      expect(status).toHaveProperty('hasWorker', false);
    });

    test('subscribeToWorker adds and removes listeners', () => {
      const { subscribeToWorker, clearAllSubscribers, getWorkerStatus } = require('./sharedWorkerManager');
      
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const unsubscribe1 = subscribeToWorker(callback1);
      const unsubscribe2 = subscribeToWorker(callback2);
      
      // Check listeners were added
      let status = getWorkerStatus();
      expect(status.listenerCount).toBe(2);
      
      // Unsubscribe first callback
      unsubscribe1();
      status = getWorkerStatus();
      expect(status.listenerCount).toBe(1);
      
      // Unsubscribe second callback
      unsubscribe2();
      status = getWorkerStatus();
      expect(status.listenerCount).toBe(0);
    });

    test('clearAllSubscribers removes all listeners', () => {
      const { subscribeToWorker, clearAllSubscribers, getWorkerStatus } = require('./sharedWorkerManager');
      
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      subscribeToWorker(callback1);
      subscribeToWorker(callback2);
      
      let status = getWorkerStatus();
      expect(status.listenerCount).toBe(2);
      
      clearAllSubscribers();
      status = getWorkerStatus();
      expect(status.listenerCount).toBe(0);
    });
  });

  describe('sharedEnclaveWorker functions', () => {
    test('parseMessage handles JSON', () => {
      const { parseMessage } = require('./sharedEnclaveWorker');
      
      const jsonString = JSON.stringify({ type: 'TEST', data: { foo: 'bar' } });
      const result = parseMessage(jsonString);
      
      expect(result).toEqual({ type: 'TEST', data: { foo: 'bar' } });
    });

    test('parseMessage handles non-JSON', () => {
      const { parseMessage } = require('./sharedEnclaveWorker');
      
      const text = 'Plain text message';
      const result = parseMessage(text);
      
      expect(result).toEqual({ type: 'RAW', payload: 'Plain text message' });
    });

    test('getConnectionStatus returns expected structure', () => {
      const { getConnectionStatus } = require('./sharedEnclaveWorker');
      
      // Mock the internal state
      const status = getConnectionStatus();
      
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('isConnecting');
      expect(status).toHaveProperty('reconnectAttempts');
      expect(status).toHaveProperty('messageQueueLength');
      expect(status).toHaveProperty('clientCount');
      expect(status).toHaveProperty('subscriptionChannels');
      expect(status).toHaveProperty('lastPongTime');
    });
  });

  describe('getSharedWorkerUrl', () => {
    test('returns default URL when window is undefined', () => {
      const originalWindow = global.window;
      delete global.window;
      
      const { getSharedWorkerUrl } = require('./sharedEnclaveWorker');
      expect(getSharedWorkerUrl()).toBe('/sharedEnclaveWorker.js');
      
      global.window = originalWindow;
    });

    test('returns window.SHARED_WORKER_URL when available', () => {
      global.window = { SHARED_WORKER_URL: '/custom/worker.js' };
      
      const { getSharedWorkerUrl } = require('./sharedEnclaveWorker');
      expect(getSharedWorkerUrl()).toBe('/custom/worker.js');
    });
  });
});

describe('useSharedWorker hook', () => {
  const mockReact = require('react');
  
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Mock React hooks
    mockReact.useState = jest.fn((initial) => [initial, jest.fn()]);
    mockReact.useEffect = jest.fn((cb) => cb());
    mockReact.useCallback = jest.fn((cb) => cb);
    mockReact.useRef = jest.fn((initial) => ({ current: initial }));
    
    global.SharedWorker = jest.fn();
    global.WebSocket = jest.fn();
  });

  test('hook returns expected API', () => {
    // This is a basic structure test
    const hookExports = require('./sharedWorkerManager');
    
    expect(hookExports).toHaveProperty('isSharedWorkerSupported');
    expect(hookExports).toHaveProperty('startSharedWorker');
    expect(hookExports).toHaveProperty('sendToWorker');
    expect(hookExports).toHaveProperty('subscribeToWorker');
    expect(hookExports).toHaveProperty('getWorkerStatus');
    expect(hookExports).toHaveProperty('disconnectWorker');
  });
});

// Integration-style tests
// Note: These would need proper setup with JSDOM and mocking
describe('Integration tests (mocked)', () => {
  test('worker can be initialized and cleaned up', async () => {
    const mockPort = {
      postMessage: jest.fn(),
      onmessage: null,
      start: jest.fn(),
      close: jest.fn(),
    };
    
    global.SharedWorker = jest.fn().mockImplementation(() => ({
      port: mockPort,
      terminate: jest.fn(),
    }));
    
    const { startSharedWorker, disconnectWorker, getWorkerStatus } = require('./sharedWorkerManager');
    
    // Start worker
    await startSharedWorker('wss://test.com');
    
    const status1 = getWorkerStatus();
    expect(status1.isInitialized).toBe(true);
    expect(status1.hasWorker).toBe(true);
    
    // Cleanup
    await disconnectWorker();
    
    const status2 = getWorkerStatus();
    expect(status2.isInitialized).toBe(false);
    expect(status2.hasWorker).toBe(false);
  });

  test('messages can be sent through worker', async () => {
    const mockPort = {
      postMessage: jest.fn(),
      onmessage: null,
      start: jest.fn(),
      close: jest.fn(),
    };
    
    global.SharedWorker = jest.fn().mockImplementation(() => ({
      port: mockPort,
      terminate: jest.fn(),
    }));
    
    const { startSharedWorker, sendToWorker } = require('./sharedWorkerManager');
    
    await startSharedWorker('wss://test.com');
    
    const result = await sendToWorker({ type: 'TEST' });
    
    expect(mockPort.postMessage).toHaveBeenCalledWith({ type: 'TEST' });
    expect(result).toBe(true);
  });
});
