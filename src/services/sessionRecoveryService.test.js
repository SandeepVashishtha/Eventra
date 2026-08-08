import {
  CLOUD_RECOVERY_PENDING_KEY,
  readPendingRecoveryQueue,
  syncPendingRecoverySessions,
} from "./sessionRecoveryService";
import { apiUtils } from "../config/api.js";

vi.mock("../config/api.js", () => ({
  API_ENDPOINTS: {
    SESSION_RECOVERY: {
      BASE: "/session-recovery",
      SESSION: (id) => `/session-recovery/${id}`,
      RESTORE: (id) => `/session-recovery/${id}/restore`,
      CLEANUP_EXPIRED: "/session-recovery/cleanup",
    },
  },
  apiUtils: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const recentIso = new Date().toISOString();

const seedQueue = (sessions) => {
  localStorage.setItem(CLOUD_RECOVERY_PENDING_KEY, JSON.stringify(sessions));
};

describe("sessionRecoveryService - failed sync queue (#12077)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("keeps failed sessions in the pending queue for retry", async () => {
    seedQueue([
      { sessionId: "s1", draftData: { title: "Draft A" }, lastUpdated: recentIso },
    ]);
    apiUtils.post.mockRejectedValue(new Error("offline"));

    const result = await syncPendingRecoverySessions();

    expect(result.synced).toEqual([]);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].sessionId).toBe("s1");

    const requeued = readPendingRecoveryQueue();
    expect(requeued).toHaveLength(1);
    expect(requeued[0].sessionId).toBe("s1");
  });

  it("re-queues only the failed sessions and drops the synced ones", async () => {
    seedQueue([
      { sessionId: "s1", draftData: { title: "Draft A" }, lastUpdated: recentIso },
      { sessionId: "s2", draftData: { title: "Draft B" }, lastUpdated: recentIso },
    ]);
    apiUtils.post
      .mockResolvedValueOnce({ data: { sessionId: "s1" } })
      .mockRejectedValueOnce(new Error("offline"));

    const result = await syncPendingRecoverySessions();

    expect(result.synced.map((s) => s.sessionId)).toEqual(["s1"]);
    expect(result.failed.map((s) => s.sessionId)).toEqual(["s2"]);

    const requeued = readPendingRecoveryQueue();
    expect(requeued.map((s) => s.sessionId)).toEqual(["s2"]);
  });

  it("clears the pending queue when every session syncs successfully", async () => {
    seedQueue([
      { sessionId: "s1", draftData: { title: "Draft A" }, lastUpdated: recentIso },
      { sessionId: "s2", draftData: { title: "Draft B" }, lastUpdated: recentIso },
    ]);
    apiUtils.post.mockResolvedValue({ data: {} });

    const result = await syncPendingRecoverySessions();

    expect(result.synced).toHaveLength(2);
    expect(result.failed).toEqual([]);
    expect(localStorage.getItem(CLOUD_RECOVERY_PENDING_KEY)).toBeNull();
    expect(readPendingRecoveryQueue()).toEqual([]);
  });
});
