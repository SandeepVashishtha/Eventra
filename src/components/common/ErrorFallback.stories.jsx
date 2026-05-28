import React from "react";
import { ErrorFallback } from "./ErrorFallback";

export default {
  title: "Common/ErrorFallback",
  component: ErrorFallback,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export const Default = {
  args: {
    error: { message: "Something went wrong while loading this section." },
    resetErrorBoundary: () => alert("Reset triggered"),
  },
};

export const NetworkError = {
  args: {
    error: { message: "Failed to fetch data. Please check your connection." },
    resetErrorBoundary: () => alert("Retrying..."),
  },
};

export const NoMessage = {
  args: {
    error: {},
    resetErrorBoundary: () => alert("Reset triggered"),
  },
};

export const NoReset = {
  args: {
    error: { message: "A non-recoverable error occurred." },
  },
};
