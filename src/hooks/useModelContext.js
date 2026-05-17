import { useEffect } from "react";

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
              window.location.href = "/apiDocs";
              return { success: true, message: "Navigating to API documentation" };
            }
          }
        ]
      });
    }
  }, []);
};
