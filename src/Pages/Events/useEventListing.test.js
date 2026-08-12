import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import useEventListing from "./useEventListing";
import { apiUtils } from "config/api";

vi.mock("config/api", () => ({
  API_ENDPOINTS: { EVENTS: { LIST: "/api/events" } },
  apiUtils: { get: vi.fn() },
}));

vi.mock("hooks/useDebounce", () => ({
  default: (value) => value,
}));

vi.mock("hooks/useRecommendations", () => ({
  default: (events) =>
    (events || []).map((event) => ({
      ...event,
      recommendationScore: (event.id % 10) * 10,
      recommendationReasons: [],
    })),
}));

const mkEvent = (id, price) => ({
  id,
  title: `Event ${id}`,
  date: `2026-07-0${id}T10:00:00`,
  price,
});

const mockEvents = [mkEvent(1, 0), mkEvent(2, 100), mkEvent(3, 20), mkEvent(4, 300)];

const mockPagedResponse = {
  status: 200,
  data: {
    content: mockEvents,
    totalPages: 1,
    totalElements: mockEvents.length,
    first: true,
    last: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  apiUtils.get.mockResolvedValue(mockPagedResponse);
});

describe("Best Match sort (#12461)", () => {
  test("with an active price range, out-of-range events are excluded and the rest are score-ordered", async () => {
    const { result } = renderHook(() => useEventListing());

    await waitFor(() => {
      expect(result.current.paginatedEvents.length).toBe(mockEvents.length);
    });

    act(() => {
      result.current.setSortType("Best Match");
    });

    act(() => {
      result.current.setAdvancedFilters({ priceRange: { min: 0, max: 50 } });
    });

    await waitFor(() => {
      // Only events priced ≤ 50 (ids 1 and 3) survive the filter, and the
      // Best Match sort must order them by recommendation score descending
      // (id 3 → 30 > id 1 → 10), NOT resurrect the paid events (ids 2, 4).
      expect(result.current.paginatedEvents.map((e) => e.id)).toEqual([3, 1]);
    });
  });

  test("with no filters, Best Match keeps all events ordered by score descending", async () => {
    const { result } = renderHook(() => useEventListing());

    await waitFor(() => {
      expect(result.current.paginatedEvents.length).toBe(mockEvents.length);
    });

    act(() => {
      result.current.setSortType("Best Match");
    });

    await waitFor(() => {
      expect(result.current.paginatedEvents.map((e) => e.id)).toEqual([4, 3, 2, 1]);
    });
  });
});
