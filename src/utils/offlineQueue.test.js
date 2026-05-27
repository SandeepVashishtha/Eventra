import { pushToQueue, getQueue, clearQueue } from './offlineQueue';

describe('offlineQueue', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Silence console warnings/errors during test execution
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('queues items successfully and returns true', async () => {
    const item = { eventId: 101, payload: { name: 'Test User' } };
    const success = await pushToQueue(item);
    
    expect(success).toBe(true);
    const queue = getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].eventId).toBe(101);
  });

  it('limits queue to 15 items and returns false when full', async () => {
    // Fill the queue with 15 items
    for (let i = 0; i < 15; i++) {
      const success = await pushToQueue({ eventId: i, payload: {} });
      expect(success).toBe(true);
    }

    // Attempting to push 16th item should fail and return false
    const success16 = await pushToQueue({ eventId: 16, payload: {} });
    expect(success16).toBe(false);

    // Verify queue length remains 15
    const queue = getQueue();
    expect(queue.length).toBe(15);
  });

  it('clears queue successfully', async () => {
    await pushToQueue({ eventId: 1, payload: {} });
    expect(getQueue().length).toBe(1);

    await clearQueue();
    expect(getQueue().length).toBe(0);
  });
});
