import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LeaderboardStatsCards from "./components/LeaderboardStatsCards";

describe("LeaderboardStatsCards", () => {
  it("renders stat cards without throwing ReferenceError", () => {
    const mockStats = {
      totalContributors: 42,
      flooredTotalPRs: 150,
      flooredTotalPoints: 1200,
    };

    render(<LeaderboardStatsCards stats={mockStats} loading={false} />);

    expect(screen.getByText("Active Contributors")).toBeInTheDocument();
    expect(screen.getByText("Merged Pull Requests")).toBeInTheDocument();
    expect(screen.getByText("Total Arena Points")).toBeInTheDocument();
  });

  it("handles loading state gracefully", () => {
    render(<LeaderboardStatsCards stats={{}} loading={true} />);

    expect(screen.getByText("Active Contributors")).toBeInTheDocument();
  });

  it("handles empty stats object gracefully without crashing", () => {
    render(<LeaderboardStatsCards stats={{}} loading={false} />);

    expect(screen.getByText("Active Contributors")).toBeInTheDocument();
  });
});
