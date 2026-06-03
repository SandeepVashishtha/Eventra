import React from "react";
import { Button } from "../Button";
import { Plus, Trash, Check } from "lucide-react";

export default {
  title: "Common/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "danger", "ghost", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: "Click Me",
  variant: "primary",
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: "Add Event",
  variant: "primary",
  icon: <Plus size={18} />,
};

export const Loading = Template.bind({});
Loading.args = {
  children: "Saving...",
  variant: "primary",
  loading: true,
};

export const Danger = Template.bind({});
Danger.args = {
  children: "Delete",
  variant: "danger",
  icon: <Trash size={18} />,
};
