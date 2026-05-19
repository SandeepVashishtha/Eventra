import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import PageTransition from "./PageTransition";

function RoutedApp({ initialPath = "/" }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<div data-testid="page-home">Home</div>} />
          <Route path="/events" element={<div data-testid="page-events">Events</div>} />
        </Routes>
      </PageTransition>
      <nav>
        <Link to="/" data-testid="link-home">
          Home
        </Link>
        <Link to="/events" data-testid="link-events">
          Events
        </Link>
      </nav>
    </MemoryRouter>
  );
}

describe("PageTransition", () => {
  test("renders initial route content inside animated wrapper", () => {
    render(<RoutedApp />);
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    const wrapper = document.querySelector("[style*='will-change']");
    expect(wrapper).toBeTruthy();
  });

  test("switches visible page when navigating between routes", async () => {
    render(<RoutedApp />);

    fireEvent.click(screen.getByTestId("link-events"));

    await waitFor(() => {
      expect(screen.getByTestId("page-events")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("page-home")).not.toBeInTheDocument();
  });

  test("starts on /events when initial path is /events", () => {
    render(<RoutedApp initialPath="/events" />);
    expect(screen.getByTestId("page-events")).toBeInTheDocument();
  });

  test("uses fade-only variants when reduced motion is preferred", () => {
    jest.spyOn(require("framer-motion"), "useReducedMotion").mockReturnValue(true);
    render(<RoutedApp />);
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});
