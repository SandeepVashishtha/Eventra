/**
 * @fileoverview useModelContext - Browser AI Model Context integration hook
 * @module hooks/useModelContext
 */
import { useEffect } from "react";

/**
 * A custom React hook that registers Eventra's tools with the browser's
 * experimental Model Context API (navigator.modelContext), enabling
 * AI assistants and browser agents to interact with the application.
 *
 * Registers two tools on mount:
 * - `search_events`: Navigates to event search results for a given query
 * - `get_api_docs`: Navigates to the Eventra API documentation page
 *
 * Only activates when `navigator.modelContext` is available in the browser.
 * Gracefully does nothing in unsupported environments.
 *
 * @returns {void}
 *
 * @example
 * function App() {
 *   useModelContext();
 *   return <div>...</div>;
 * }
 */
export const useModelContext = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.modelContext) {
      navigator.modelContext.provideContext({
        tools: [
          {
            name: "search_events",
            description: "Search for events on Eventra",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search term for events" }
              }
            },
            execute: async ({ query }) => {
              window.location.href = `/events?search=${encodeURIComponent(query)}`;
              return { success: true, message: `Searching for ${query}` };
            }
          },
          {
            name: "get_api_docs",
            description: "Get information about Eventra APIs",
            inputSchema: { type: "object", properties: {} },
            execute: async () => {
              window.location.href = "/api-docs";
              return { success: true, message: "Navigating to API documentation" };
            }
          }
        ]
      });
    }
  }, []);
};
