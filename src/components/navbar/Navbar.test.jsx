import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "./Navbar";

// Mock AuthContext
vi.mock("context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: () => false,
    logout: vi.fn(),
  }),
}));

// Mock ThemeContext
vi.mock("context/ThemeContext", () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    isCustomizerOpen: false,
    setIsCustomizerOpen: vi.fn(),
  }),
}));

// Mock other components
vi.mock("./DesktopNavbar", () => () => <div>DesktopNavbar</div>);
vi.mock("./MobileNavbar", () => () => <div>MobileNavbar</div>);
vi.mock("./AuthButtons", () => () => <div>AuthButtons</div>);
vi.mock("./ProfileMenu", () => () => <div>ProfileMenu</div>);
vi.mock("../LanguageSelector", () => () => <div>LanguageSelector</div>);
vi.mock("../notifications/NotificationBell", () => () => <div>NotificationBell</div>);
vi.mock("../Layout/ThemeToggleButton", () => () => <div>ThemeToggleButton</div>);
vi.mock("../Layout/ThemeCustomizer", () => () => <div>ThemeCustomizer</div>);

// Mock hooks
vi.mock("./hooks/useBodyScrollLock", () => () => {});
vi.mock("hooks/useKeyboardShortcuts", () => () => {});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }) => <div>{children}</div>,
    span: ({ children }) => <span>{children}</span>,
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: () => 0,
}));

describe("Navbar with Theme Toggle", () => {
  it("renders ThemeToggleButton in desktop view", () => {
    render(
      <MemoryRouter>
        <Navbar cursorEnabled={true} toggleCursor={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("ThemeToggleButton")).toBeInTheDocument();
  });

  it("renders LanguageSelector in desktop view", () => {
    render(
      <MemoryRouter>
        <Navbar cursorEnabled={true} toggleCursor={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("LanguageSelector")).toBeInTheDocument();
  });

  it("renders DesktopNavbar in center", () => {
    render(
      <MemoryRouter>
        <Navbar cursorEnabled={true} toggleCursor={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("DesktopNavbar")).toBeInTheDocument();
  });
});