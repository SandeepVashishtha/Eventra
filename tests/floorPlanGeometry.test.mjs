import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkCollision, getSeatPositions } from '../src/utils/floorPlanGeometry.js';

describe('Floor Plan Geometry Utilities', () => {
  describe('checkCollision', () => {
    it('should return false for invalid or missing element inputs', () => {
      assert.strictEqual(checkCollision(null, {}), false);
      assert.strictEqual(checkCollision({}, null), false);
    });

    it('should return false if elements have matching IDs', () => {
      assert.strictEqual(checkCollision({ id: '1' }, { id: '1' }), false);
    });

    it('should return false for invalid coordinates', () => {
      assert.strictEqual(checkCollision({ id: '1', x: NaN, y: 0, width: 10, height: 10 }, { id: '2', x: 0, y: 0, width: 10, height: 10 }), false);
    });

    it('should detect collisions correctly for valid overlapping rectangles', () => {
      const el1 = { id: '1', x: 0, y: 0, width: 50, height: 50 };
      const el2 = { id: '2', x: 25, y: 25, width: 50, height: 50 };
      assert.strictEqual(checkCollision(el1, el2), true);
    });
  });

  describe('getSeatPositions', () => {
    it('should return empty array for invalid inputs or zero seats count', () => {
      assert.deepStrictEqual(getSeatPositions(null), []);
      assert.deepStrictEqual(getSeatPositions({ seatsCount: 0 }), []);
      assert.deepStrictEqual(getSeatPositions({ seatsCount: -5 }), []);
    });

    it('should clamp seats count to a maximum of 100 to prevent browser freezing', () => {
      const positions = getSeatPositions({ seatsCount: 500, type: 'round-table', width: 100, height: 100, x: 0, y: 0 });
      assert.ok(positions.length <= 100);
    });
  });
});
