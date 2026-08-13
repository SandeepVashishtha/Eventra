import { create } from 'zustand';

export const useEventWorkspaceStore = create((set) => ({
  eventData: null,
  activeTab: 'overview',
  isLoading: false,
  error: null,

  setEventData: (data) => set({ eventData: data }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),

  resetWorkspace: () => set({
    eventData: null,
    activeTab: 'overview',
    isLoading: false,
    error: null,
  }),
}));
