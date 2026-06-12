import { SkeletonEventCard } from "./SkeletonLoaders";

export default {
  title: "Common/SkeletonEventCard",
  component: SkeletonEventCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export const Default = {};

export const DarkMode = {
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const GridLayout = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonEventCard />
      <SkeletonEventCard />
      <SkeletonEventCard />
    </div>
  ),
};
