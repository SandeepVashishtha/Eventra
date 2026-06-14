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

export const CursorEnabled = {
  args: {
    cursorEnabled: true,
    toggleCursor: () => {},
  },
};
