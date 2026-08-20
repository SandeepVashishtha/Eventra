import React from "react";
import CursorToggleButton from "./CursorToggleButton";

export default {
  title: "Layout/CursorToggleButton",
  component: CursorToggleButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 flex justify-center items-center h-[200px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    cursorEnabled: { control: "boolean" },
    isMobile: { control: "boolean" },
    toggleCursor: { action: "toggled" },
  },
};

export const DesktopEnabled = {
  args: {
    cursorEnabled: true,
    isMobile: false,
  },
};

export const DesktopDisabled = {
  args: {
    cursorEnabled: false,
    isMobile: false,
  },
};

export const MobileEnabled = {
  args: {
    cursorEnabled: true,
    isMobile: true,
  },
};

export const MobileDisabled = {
  args: {
    cursorEnabled: false,
    isMobile: true,
  },
};
