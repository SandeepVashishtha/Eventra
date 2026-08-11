import { describe, it } from "node:test";
import assert from "node:assert/strict";

class CouponStore {
  constructor() {
    this.inventory = new Map([["SUMMER10", 5]]);
  }

  redeem(code) {
    const qty = this.inventory.get(code) || 0;
    if (qty > 0) {
      this.inventory.set(code, qty - 1);
      return true;
    }
    return false;
  }
}

describe("Coupon Redemption Service Allocation Tests", () => {
  it("should process coupon claims up to inventory limits", () => {
    const store = new CouponStore();

    for (let i = 0; i < 5; i++) {
      assert.equal(store.redeem("SUMMER10"), true);
    }
    assert.equal(store.redeem("SUMMER10"), false);
  });
});
