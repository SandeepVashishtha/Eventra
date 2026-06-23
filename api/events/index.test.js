const request = require('supertest');
const app = require('../../app');

describe('Event Filtering & Sorting API', () => {
  test('Should return events matching the category filter', async () => {
    const response = await request(app).get('/api/events/filter').query({ category: 'AI/ML' });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(event => {
      expect(event.category).toBe('AI/ML');
    });
  });

  test('Should return events matching the isVirtual filter', async () => {
    const response = await request(app).get('/api/events/filter').query({ isVirtual: 'true' });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(event => {
      expect(event.isVirtual).toBe(true);
    });
  });

  test('Should handle date filters', async () => {
    const response = await request(app).get('/api/events/filter').query({ startDate: '2023-10-01', endDate: '2023-10-31' });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(event => {
      const eventDate = new Date(event.date);
      expect(eventDate).toBeGreaterThanOrEqual(new Date('2023-10-01'));
      expect(eventDate).toBeLessThanOrEqual(new Date('2023-10-31'));
    });
  });

  test('Should return an error for invalid filters', async () => {
    const response = await request(app).get('/api/events/filter').query({ unknownFilter: 'invalid' });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('Should NOT expose internal error messages on server error', async () => {
    // This test verifies that when an internal error occurs,
    // the response contains a generic error message, not the raw exception
    const response = await request(app).get('/api/events/filter').query({ invalidDate: 'not-a-date' });
    
    if (response.statusCode === 500) {
      // If we get a 500, ensure it's a generic message
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toBe('Internal server error');
      // Ensure no internal error details are exposed
      expect(response.body.error).not.toContain('MongoError');
      expect(response.body.error).not.toContain('TypeError');
      expect(response.body.error).not.toContain('ReferenceError');
      expect(response.body.error).not.toContain('Prisma');
      expect(response.body.error).not.toContain('Redis');
      expect(response.body.error).not.toContain('stack');
    }
  });
});