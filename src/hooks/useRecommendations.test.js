import { renderHook } from "@testing-library/react";
import useRecommendations from "./useRecommendations";
import * as recommendationEngine from "../utils/recommendationEngine";
import * as userProfileAnalyzer from "../utils/userProfileAnalyzer";

jest.mock("../utils/recommendationEngine");
jest.mock("../utils/userProfileAnalyzer");

const PROFILE_KEY = "eventra_user_profile";

const makeEvent = (id, extra = {}) => ({
  id,
  title: `Event ${id}`,
  date: "2026-07-01",
  ...extra,
});

const mockProfile = {
  interests: ["tech"],
  techStack: ["React"],
  eventTypes: ["hackathon"],
  level: "Intermediate",
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  userProfileAnalyzer.getUserProfile.mockReturnValue(mockProfile);

  recommendationEngine.calculateRecommendationScore.mockImplementation(
    (event) => ({ score: event.id * 10, reasons: [`reason-${event.id}`] })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Basic sorting and enrichment
// ---------------------------------------------------------------------------

describe("useRecommendations — basic behaviour", () => {
  it("returns events sorted by score descending", () => {
    const events = [makeEvent(1), makeEvent(3), makeEvent(2)];
    const { result } = renderHook(() => useRecommendations(events));
    const scores = result.current.map((e) => e.recommendationScore);
    expect(scores).toEqual([30, 20, 10]);
  });

  it("enriches each event with recommendationScore and recommendationReasons", () => {
    const { result } = renderHook(() => useRecommendations([makeEvent(5)]));
    expect(result.current[0].recommendationScore).toBe(50);
    expect(result.current[0].recommendationReasons).toEqual(["reason-5"]);
  });

  it("returns empty array for empty events input", () => {
    const { result } = renderHook(() => useRecommendations([]));
    expect(result.current).toEqual([]);
  });

  it("handles malformed events gracefully — returns score 0", () => {
    recommendationEngine.calculateRecommendationScore.mockImplementation(() => {
      throw new Error("bad event");
    });
    const { result } = renderHook(() => useRecommendations([makeEvent(1)]));
    expect(result.current[0].recommendationScore).toBe(0);
    expect(result.current[0].recommendationReasons).toEqual([]);
  });

  it("preserves original event fields alongside recommendation fields", () => {
    const event = makeEvent(1, { location: "Remote", category: "Workshop" });
    const { result } = renderHook(() => useRecommendations([event]));
    expect(result.current[0].location).toBe("Remote");
    expect(result.current[0].category).toBe("Workshop");
  });
});

// ---------------------------------------------------------------------------
// Memoization — the core bug fix (issue #7036)
// ---------------------------------------------------------------------------

describe("useRecommendations — useMemo caching", () => {
  it("does NOT call calculateRecommendationScore again when events and profile are unchanged", () => {
    const events = [makeEvent(1), makeEvent(2)];

    const { rerender } = renderHook(({ evts }) => useRecommendations(evts), {
      initialProps: { evts: events },
    });

    const callCountAfterMount = recommendationEngine.calculateRecommendationScore.mock.calls.length;

    // Re-render with the same events array reference — memo should NOT re-run
    rerender({ evts: events });

    expect(recommendationEngine.calculateRecommendationScore.mock.calls.length).toBe(
      callCountAfterMount
    );
  });

  it("re-runs when events array reference changes", () => {
    const events1 = [makeEvent(1)];
    const events2 = [makeEvent(1), makeEvent(2)];

    const { rerender } = renderHook(({ evts }) => useRecommendations(evts), {
      initialProps: { evts: events1 },
    });

    const callsBefore = recommendationEngine.calculateRecommendationScore.mock.calls.length;
    rerender({ evts: events2 });

    expect(recommendationEngine.calculateRecommendationScore.mock.calls.length).toBeGreaterThan(
      callsBefore
    );
  });

  it("re-runs when the user profile in localStorage changes", () => {
    const events = [makeEvent(1)];
    const { rerender } = renderHook(({ evts }) => useRecommendations(evts), {
      initialProps: { evts: events },
    });

    const callsBefore = recommendationEngine.calculateRecommendationScore.mock.calls.length;

    // Simulate profile change in localStorage
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ interests: ["design"] }));
    userProfileAnalyzer.getUserProfile.mockReturnValue({ interests: ["design"], techStack: [], eventTypes: [], level: "Beginner" });

    rerender({ evts: events });

    expect(recommendationEngine.calculateRecommendationScore.mock.calls.length).toBeGreaterThan(
      callsBefore
    );
  });

  it("uses the same result reference on consecutive renders with unchanged inputs", () => {
    const events = [makeEvent(1)];
    const { result, rerender } = renderHook(({ evts }) => useRecommendations(evts), {
      initialProps: { evts: events },
    });

    const firstResult = result.current;
    rerender({ evts: events });

    expect(result.current).toBe(firstResult);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("useRecommendations — edge cases", () => {
  it("handles undefined events gracefully (defaults to [])", () => {
    const { result } = renderHook(() => useRecommendations(undefined));
    expect(result.current).toEqual([]);
  });

  it("does not mutate the original events array", () => {
    const original = [makeEvent(3), makeEvent(1), makeEvent(2)];
    const frozen = [...original];
    renderHook(() => useRecommendations(original));
    expect(original).toEqual(frozen);
  });

  it("handles a single event correctly", () => {
    const { result } = renderHook(() => useRecommendations([makeEvent(7)]));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe(7);
  });

  it("passes userProfile to calculateRecommendationScore", () => {
    renderHook(() => useRecommendations([makeEvent(1)]));
    expect(recommendationEngine.calculateRecommendationScore).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      mockProfile
    );
  });
});
