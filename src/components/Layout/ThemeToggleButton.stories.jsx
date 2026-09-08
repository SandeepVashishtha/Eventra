import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";

export default {
  title: "Layout/ThemeToggleButton",
  component: ThemeToggleButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 flex justify-center items-center h-[200px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isDarkMode: { control: "boolean" },
    isMobile: { control: "boolean" },
    toggleTheme: { action: "theme_toggled" },
    setIsCustomizerOpen: { action: "customizer_opened" },
  },
};

export const DesktopLight = {
  args: {
    isDarkMode: false,
    isMobile: false,
  },
};

export const DesktopDark = {
  args: {
    isDarkMode: true,
    isMobile: false,
  },
};

export const MobileLight = {
  args: {
    isDarkMode: false,
    isMobile: true,
  },
};

export const MobileDark = {
  args: {
    isDarkMode: true,
    isMobile: true,
  },
};
