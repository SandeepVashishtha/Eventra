import { create } from 'zustand';

export const useMyEventsStore = create((set) => ({
  myEvents: [],
  setMyEvents: (events) => set({ myEvents: events }),
  addRegistration: (event, formData, registrationId, qrToken) => set((state) => ({
    myEvents: [...state.myEvents, { ...event, registrationData: formData, registrationId, qrToken }]
  })),
}));
