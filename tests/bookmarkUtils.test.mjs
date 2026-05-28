import assert from "node:assert/strict";

// Mock global window and localStorage
const store = {};
const listeners = {};

class MockCustomEvent {
  constructor(name, options) {
    this.type = name;
    this.detail = options ? options.detail : null;
  }
}

globalThis.CustomEvent = MockCustomEvent;

globalThis.window = {
  localStorage: {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    }
  },
  dispatchEvent(event) {
    const eventName = event.type;
    if (listeners[eventName]) {
      listeners[eventName].forEach((callback) => callback(event));
    }
  },
  addEventListener(eventName, callback) {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    listeners[eventName].push(callback);
  },
  removeEventListener(eventName, callback) {
    if (listeners[eventName]) {
      listeners[eventName] = listeners[eventName].filter((cb) => cb !== callback);
    }
  }
};

import {
  getBookmarkedEvents,
  isEventBookmarked,
  addBookmarkedEvent,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges
} from "../src/utils/bookmarkUtils.js";

// Test getBookmarkedEvents when empty
assert.deepEqual(getBookmarkedEvents(), []);

// Test addBookmarkedEvent
const event = { id: 101, title: "Webinar" };
const bookmarks1 = addBookmarkedEvent(event);
assert.equal(bookmarks1.length, 1);
assert.equal(bookmarks1[0].id, 101);

// Test isEventBookmarked
assert.equal(isEventBookmarked(101), true);
assert.equal(isEventBookmarked("101"), true);
assert.equal(isEventBookmarked(102), false);

// Test duplicate addition
const bookmarks2 = addBookmarkedEvent(event);
assert.equal(bookmarks2.length, 1);

// Test subscribeToBookmarkChanges
let callbackTriggered = false;
let callbackData = null;
const unsubscribe = subscribeToBookmarkChanges((data) => {
  callbackTriggered = true;
  callbackData = data;
});

const event2 = { id: 102, title: "Conference" };
addBookmarkedEvent(event2);
assert.equal(callbackTriggered, true);
assert.equal(callbackData.length, 2);

// Test removeBookmarkedEvent
const bookmarks3 = removeBookmarkedEvent(101);
assert.equal(bookmarks3.length, 1);
assert.equal(isEventBookmarked(101), false);

unsubscribe();
