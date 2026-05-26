import Loading from "./Loading";

export default {
  title: "Common/Loading",
  component: Loading,
  tags: ["autodocs"],
};

export const Default = {};

export const WithText = {
  args: { text: "Loading events..." },
};

export const LongText = {
  args: { text: "Fetching your personalized recommendations..." },
};
