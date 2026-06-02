import { create } from "zustand";
import { logger } from "../utils/logger";

/**
 * useNotificationStore
 * 
 * High-performance notification state management.
 * Consumers can subscribe to specific slices (e.g., only unreadCount).
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Actions
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = updated.filter(n => !n.read).length;
    set({ notifications: updated, unreadCount });
  },

  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      return { 
        notifications: updated, 
        unreadCount: updated.filter(n => !n.read).length 
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  }
}));
