/**
 * Last-Write-Wins (LWW) Register conflict resolution helper implementation (#17664)
 */

export class LwwRegister {
  constructor(initialValue, timestamp = 0) {
    this.value = initialValue;
    this.timestamp = timestamp;
  }

  update(newValue, newTimestamp) {
    // Write changes only if the incoming modification holds a later timestamp
    if (newTimestamp > this.timestamp) {
      this.value = newValue;
      this.timestamp = newTimestamp;
      return true;
    }
    return false;
  }

  merge(otherRegister) {
    if (!otherRegister) return;
    this.update(otherRegister.value, otherRegister.timestamp);
  }
}
