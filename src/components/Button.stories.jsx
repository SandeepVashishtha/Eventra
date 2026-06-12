import { Button } from "./Button";

export default {
  title: "Common/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    // 🔥 FIX: Added the missing "outline" variant to the Storybook controls
    variant: { control: "select", options: ["primary", "secondary", "danger", "outline"] },
    size: { control: "select", options: ["small", "medium", "large"] },
  },
};

export const Primary = {
  args: {
    children: "Primary Button",
    variant: "primary",
    size: "medium",
  },
};

export const Secondary = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
    size: "medium",
  },
};

export const Danger = {
  args: {
    children: "Delete Event",
    variant: "danger",
    size: "medium",
  },
};

// 🔥 FIX: Added the missing Outline story so developers can actually see it in the docs
export const Outline = {
  args: {
    children: "Outline Button",
    variant: "outline",
    size: "medium",
  },
};

export const Small = {
  args: {
    children: "Small Button",
    variant: "primary",
    size: "small",
  },
};

export const Large = {
  args: {
    children: "Large Button",
    variant: "primary",
    size: "large",
  },
};

export const Disabled = {
  args: {
    children: "Disabled Button",
    variant: "primary",
    disabled: true,
  },
};
