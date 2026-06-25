import {
  getEventWaitlist,
  getQueuePosition,
  joinWaitlist,
  leaveWaitlist,
  organizerRemoveUser,
  promoteNextUser,
  handleCapacityIncrease,
  getGlobalWaitlist,
} from "./waitlistUtils";

// idb-keyval is async; stub it so the test environment doesn't need IndexedDB
jest.mock("idb-keyval", () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
}));

const GLOBAL_KEY = "eventra_global_waitlists";

const makeEntry = (overrides = {}) => ({
  userId: "u1",
  userName: "Alice",
  userEmail: "alice@example.com",
  phone: "",
  eventId: 42,
  joinedAt: new Date().toISOString(),
  status: "waiting",
  ...overrides,
});

const seedWaitlist = (entries) => {
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(entries));
};

const makeUser = (overrides = {}) => ({
  id: "u1",
  email: "alice@example.com",
  fullName: "Alice",
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(window, "dispatchEvent").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getEventWaitlist", () => {
  it("returns waiting entries sorted by joinedAt for a valid numeric id", () => {
    const t1 = new Date(Date.now() - 2000).toISOString();
    const t2 = new Date(Date.now() - 1000).toISOString();
    seedWaitlist([
      makeEntry({ eventId: 42, joinedAt: t2, userId: "u2" }),
      makeEntry({ eventId: 42, joinedAt: t1, userId: "u1" }),
      makeEntry({ eventId: 99, joinedAt: t1, userId: "u3" }),
    ]);
    const result = getEventWaitlist(42);
    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe("u1"); // earlier joinedAt comes first
    expect(result[1].userId).toBe("u2");
  });

  it("accepts a numeric string and coerces it correctly", () => {
    seedWaitlist([makeEntry({ eventId: 42 })]);
    expect(getEventWaitlist("42")).toHaveLength(1);
  });

  it("excludes entries that are not in 'waiting' status", () => {
    seedWaitlist([
      makeEntry({ status: "promoted" }),
      makeEntry({ status: "removed" }),
      makeEntry({ status: "waiting" }),
    ]);
    expect(getEventWaitlist(42)).toHaveLength(1);
  });

  it("throws TypeError for null eventId instead of silently returning []", () => {
    seedWaitlist([makeEntry()]);
    expect(() => getEventWaitlist(null)).toThrow(TypeError);
    expect(() => getEventWaitlist(null)).toThrow(/Invalid eventId/);
  });

  it("throws TypeError for undefined eventId", () => {
    expect(() => getEventWaitlist(undefined)).toThrow(TypeError);
  });

  it("throws TypeError for a non-numeric string", () => {
    expect(() => getEventWaitlist("abc")).toThrow(TypeError);
  });

  it("throws TypeError for an empty string", () => {
    expect(() => getEventWaitlist("")).toThrow(TypeError);
  });

  it("returns [] when no matching entries exist (empty waitlist)", () => {
    seedWaitlist([makeEntry({ eventId: 99 })]);
    expect(getEventWaitlist(42)).toEqual([]);
  });
});

describe("getQueuePosition", () => {
  it("returns 1-based position for the first user in queue", () => {
    seedWaitlist([
      makeEntry({ userId: "u1", joinedAt: new Date(1000).toISOString() }),
      makeEntry({ userId: "u2", joinedAt: new Date(2000).toISOString() }),
    ]);
    expect(getQueuePosition(42, "u1")).toBe(1);
    expect(getQueuePosition(42, "u2")).toBe(2);
  });

  it("returns -1 for a user not on the waitlist", () => {
    seedWaitlist([makeEntry()]);
    expect(getQueuePosition(42, "unknown")).toBe(-1);
  });
});

describe("joinWaitlist", () => {
  it("creates a waitlist entry with a parsed integer eventId", async () => {
    const entry = await joinWaitlist("42", makeUser());
    expect(entry.eventId).toBe(42);
    expect(typeof entry.eventId).toBe("number");
  });

  it("throws when user has no id or email", async () => {
    await expect(joinWaitlist(42, {})).rejects.toThrow("Authentication required");
  });

  it("throws when user is already on the waitlist", async () => {
    await joinWaitlist(42, makeUser());
    await expect(joinWaitlist(42, makeUser())).rejects.toThrow("already on the waitlist");
  });

  it("throws TypeError for invalid eventId", async () => {
    await expect(joinWaitlist(null, makeUser())).rejects.toThrow(TypeError);
    await expect(joinWaitlist("bad", makeUser())).rejects.toThrow(TypeError);
  });
});

describe("leaveWaitlist", () => {
  it("marks the entry as removed and returns true", async () => {
    seedWaitlist([makeEntry()]);
    const result = await leaveWaitlist(42, "u1");
    expect(result).toBe(true);
    const stored = getGlobalWaitlist();
    expect(stored[0].status).toBe("removed");
  });

  it("throws when no matching record is found", async () => {
    seedWaitlist([]);
    await expect(leaveWaitlist(42, "u1")).rejects.toThrow("No active waitlist record");
  });

  it("throws TypeError for invalid eventId", async () => {
    await expect(leaveWaitlist(null, "u1")).rejects.toThrow(TypeError);
  });
});

describe("organizerRemoveUser", () => {
  it("sets status to removed for a valid entry", async () => {
    seedWaitlist([makeEntry()]);
    const result = await organizerRemoveUser(42, "u1");
    expect(result).toBe(true);
    expect(getGlobalWaitlist()[0].status).toBe("removed");
  });

  it("throws when user is not in the active waitlist", async () => {
    seedWaitlist([]);
    await expect(organizerRemoveUser(42, "u1")).rejects.toThrow("not in the active waitlist");
  });

  it("throws TypeError for invalid eventId", async () => {
    await expect(organizerRemoveUser(undefined, "u1")).rejects.toThrow(TypeError);
  });
});

describe("promoteNextUser", () => {
  it("returns null when waitlist is empty", async () => {
    expect(await promoteNextUser(42)).toBeNull();
  });

  it("throws TypeError for invalid eventId", async () => {
    await expect(promoteNextUser(null)).rejects.toThrow(TypeError);
  });
});

describe("handleCapacityIncrease", () => {
  it("returns 0 when new capacity is not greater than current attendees", async () => {
    const event = { id: 42, attendees: 10 };
    expect(await handleCapacityIncrease(event, 10)).toBe(0);
    expect(await handleCapacityIncrease(event, 5)).toBe(0);
  });

  it("promotes up to the number of available waitlist slots", async () => {
    const t = Date.now();
    seedWaitlist([
      makeEntry({ userId: "u1", joinedAt: new Date(t).toISOString() }),
      makeEntry({ userId: "u2", joinedAt: new Date(t + 1).toISOString() }),
    ]);
    const event = { id: 42, attendees: 8, title: "Test Event" };
    // newCapacity=10 → 2 spots, waitlist has 2 → promotes 2
    const promoted = await handleCapacityIncrease(event, 10);
    expect(promoted).toBe(2);
  });
});
