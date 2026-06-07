import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../utils/auth", () => ({
  isTokenValid: vi.fn(),
}));

import { useAuth } from "../../context/AuthContext";
import { isTokenValid } from "../../utils/auth";

const ProtectedPage = () => <div data-testid="protected-content">Secret</div>;

describe("ProtectedRoute session expiration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when JWT is expired", async () => {
    isTokenValid.mockReturnValue(false);
    const clearExpiredSession = vi.fn();

    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      hasRole: () => false,
      hasPermission: () => false,
      loading: false,
      user: { email: "user@test.com", roles: ["ATTENDEE"] },
      token: "expired.jwt.token",
      sessionExpired: false,
      clearExpiredSession,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
    expect(clearExpiredSession).toHaveBeenCalled();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders protected content for valid sessions", () => {
    isTokenValid.mockReturnValue(true);

    useAuth.mockReturnValue({
      isAuthenticated: () => true,
      hasRole: () => true,
      hasPermission: () => true,
      loading: false,
      user: { email: "user@test.com", roles: ["ATTENDEE"] },
      token: "valid.jwt.token",
      sessionExpired: false,
      clearExpiredSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
