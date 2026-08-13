/**
 * Interval Tree implementation for schedule overlap checking (#16267)
 */

export class IntervalNode {
  constructor(start, end, sessionId) {
    this.start = start;
    this.end = end;
    this.sessionId = sessionId;
    this.max = end;
    this.left = null;
    this.right = null;
  }
}

export class IntervalTree {
  constructor() {
    this.root = null;
  }

  insert(start, end, sessionId) {
    this.root = this._insert(this.root, start, end, sessionId);
  }

  _insert(node, start, end, sessionId) {
    if (!node) {
      return new IntervalNode(start, end, sessionId);
    }

    if (start < node.start) {
      node.left = this._insert(node.left, start, end, sessionId);
    } else {
      node.right = this._insert(node.right, start, end, sessionId);
    }

    if (node.max < end) {
      node.max = end;
    }

    return node;
  }

  checkOverlap(start, end) {
    return this._checkOverlap(this.root, start, end);
  }

  _checkOverlap(node, start, end) {
    if (!node) return false;

    // Standard overlap check: (start < node.end) && (node.start < end)
    if (start < node.end && node.start < end) {
      return true;
    }

    if (node.left && node.left.max > start) {
      return this._checkOverlap(node.left, start, end);
    }

    return this._checkOverlap(node.right, start, end);
  }
}
