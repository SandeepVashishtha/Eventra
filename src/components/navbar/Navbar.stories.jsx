import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import Navbar from "./Navbar";

const withProviders = (Story) => (
  <MemoryRouter>
    <AuthProvider>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </AuthProvider>
  </MemoryRouter>
);

export default {
  title: "Layout/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  decorators: [withProviders],
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = {
  args: {
    cursorEnabled: false,
    toggleCursor: () => {},
  },
};

export const LoggedOut = {
  args: {
    cursorEnabled: false,
    toggleCursor: () => {},
  },
};

export const LoggedIn = {
  args: {
    cursorEnabled: false,
    toggleCursor: () => {},
  },
  parameters: {
    authContext: {
      isAuthenticated: true,
      user: {
        name: "John Doe",
        avatar: "/avatar.png",
      },
    },
  },
};

export const CursorEnabled = {
  args: {
    cursorEnabled: true,
    toggleCursor: () => {},
  },
};
