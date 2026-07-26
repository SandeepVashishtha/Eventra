import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

export function renderWithRouter(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

export function renderWithAuth(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
    ...options,
  });
}

export function renderWithProviders(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        {/* FIX (#7653): ThemeProvider must be inside AuthProvider so useAuth()
            is available for cross-device theme sync — mirrors App.jsx nesting. */}
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
    ...options,
  });
}

export function createMockEvent(overrides = {}) {
  return {
    id: "mock-event-1",
    title: "Test Event",
    date: "2026-07-15T10:00:00Z",
    category: "Conference",
    description: "A test event for testing.",
    location: "Test Location",
    organizer: "Test Organizer",
    price: 0,
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: "mock-user-1",
    name: "Test User",
    email: "test@eventra.com",
    ...overrides,
  };
}
