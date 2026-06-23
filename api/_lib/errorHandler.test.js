/**
 * Tests for secure error handler
 * Verifies that internal error messages are not exposed to clients
 */

const { handleServerError } = require('./errorHandler.js');

// Mock the logger
jest.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
  isDevelopment: false, // Default to production mode
}));

describe('Error Handler Security Tests', () => {
  let mockRes;
  let mockLogger;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockLogger = require('../../src/utils/logger.js').logger;
    jest.clearAllMocks();
  });

  describe('Production Mode (default)', () => {
    beforeEach(() => {
      // Ensure production mode
      jest.doMock('../../src/utils/logger.js', () => ({
        logger: {
          error: jest.fn(),
        },
        isDevelopment: false,
      }));
    });

    test('Should return generic error message for internal exceptions', () => {
      const error = new Error('MongoError: Connection failed');
      handleServerError(mockRes, error, { endpoint: '/test' });

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });

    test('Should NOT expose database error details', () => {
      const error = new Error('MongoError: Authentication failed');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('MongoError');
      expect(response.error).not.toContain('Authentication');
    });

    test('Should NOT expose TypeError details', () => {
      const error = new TypeError('Cannot read property of undefined');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('TypeError');
      expect(response.error).not.toContain('undefined');
    });

    test('Should NOT expose ReferenceError details', () => {
      const error = new ReferenceError('x is not defined');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('ReferenceError');
      expect(response.error).not.toContain('x is not defined');
    });

    test('Should NOT expose Prisma error details', () => {
      const error = new Error('PrismaClientKnownRequestError: Invalid query');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('Prisma');
      expect(response.error).not.toContain('PrismaClientKnownRequestError');
    });

    test('Should NOT expose Redis error details', () => {
      const error = new Error('Redis connection lost');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('Redis');
    });

    test('Should NOT expose file paths', () => {
      const error = new Error('Error at /var/www/app/src/controllers/events.js:45');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('/var/www');
      expect(response.error).not.toContain('src/controllers');
    });

    test('Should NOT expose stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Object.<anonymous> (test.js:10:5)\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)';
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toContain('stack');
      expect(response.error).not.toContain('processTicksAndRejections');
    });

    test('Should log full error details server-side', () => {
      const error = new Error('Database connection failed');
      error.stack = 'Error: Database connection failed\n    at /app/db.js:45:10';
      handleServerError(mockRes, error, { endpoint: '/test', userId: '123' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Server error occurred',
        expect.objectContaining({
          message: 'Database connection failed',
          stack: expect.any(String),
          endpoint: '/test',
          userId: '123',
        })
      );
    });

    test('Should support custom status codes', () => {
      const error = new Error('Service unavailable');
      handleServerError(mockRes, error, { endpoint: '/test' }, 503);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      // Mock development mode
      jest.resetModules();
      jest.doMock('../../src/utils/logger.js', () => ({
        logger: {
          error: jest.fn(),
        },
        isDevelopment: true,
      }));
    });

    test('Should expose error message in development mode', () => {
      const { handleServerError: devHandler } = require('./errorHandler.js');
      const error = new Error('Database connection failed');
      
      devHandler(mockRes, error, { endpoint: '/test' });

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database connection failed'
      });
    });

    test('Should still log full error details in development', () => {
      const { handleServerError: devHandler } = require('./errorHandler.js');
      const mockLogger = require('../../src/utils/logger.js').logger;
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:10:5';
      
      devHandler(mockRes, error, { endpoint: '/test' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Server error occurred',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
          endpoint: '/test',
        })
      );
    });
  });

  describe('Response Structure', () => {
    test('Should always return JSON object with error key', () => {
      const error = new Error('Any error');
      handleServerError(mockRes, error, { endpoint: '/test' });

      const response = mockRes.json.mock.calls[0][0];
      expect(typeof response).toBe('object');
      expect(response).toHaveProperty('error');
      expect(typeof response.error).toBe('string');
    });

    test('Should not expose additional keys in production', () => {
      const error = new Error('Test error');
      handleServerError(mockRes, error, { endpoint: '/test', secret: 'hidden' });

      const response = mockRes.json.mock.calls[0][0];
      expect(Object.keys(response)).toEqual(['error']);
      expect(response).not.toHaveProperty('secret');
      expect(response).not.toHaveProperty('endpoint');
    });
  });
});
