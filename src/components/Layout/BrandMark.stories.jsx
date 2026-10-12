import React from "react";
import { BrowserRouter } from "react-router-dom";
import BrandMark from "./BrandMark";

export default {
  title: "Layout/BrandMark",
  component: BrandMark,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 flex justify-center items-center h-screen">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    compact: { control: "boolean" },
  },
};

export const Default = {
  args: {
    compact: false,
  },
};

export const Compact = {
  args: {
    compact: true,
  },
};
