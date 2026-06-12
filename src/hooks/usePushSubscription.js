import { useState, useCallback, useEffect } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { logger } from "../utils/logger";
import { safeJsonParse } from "../utils/safeJsonParse";
import { PUSH_SUBSCRIPTION_KEY, urlBase64ToUint8Array } from "../utils/notificationPreferences";

const getEnv = () =>
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const VAPID_PUBLIC_KEY =
  getEnv().VITE_VAPID_PUBLIC_KEY || getEnv().REACT_APP_VAPID_PUBLIC_KEY || "";

const getRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  try {
    return await navigator.serviceWorker.register("/service-worker.js");
  } catch {
    return null;
  }
};

export function usePushSubscription(updatePreferences) {
  const { token } = useAuth();
  const [pushStatus, setPushStatus] = useState({
    supported: false,
    permission: typeof Notification !== "undefined" ? Notification.permission : "unsupported",
    subscribed: false,
    error: "",
  });

  const updatePushStatus = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPushStatus({ supported: false, permission: "unsupported", subscribed: false, error: "" });
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      setPushStatus({
        supported: true,
        permission: Notification.permission,
        subscribed: Boolean(subscription),
        error: "",
      });
      return subscription;
    } catch (error) {
      setPushStatus({
        supported: true,
        permission: Notification.permission,
        subscribed: false,
        error: error.message || "Unable to read push subscription.",
      });
      return null;
    }
  }, []);

  useEffect(() => {
    updatePushStatus();
  }, [updatePushStatus]);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushStatus((c) => ({ ...c, permission: "unsupported" }));
      return "unsupported";
    }
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    setPushStatus((c) => ({ ...c, permission }));
    return permission;
  }, []);

  const subscribeToPush = useCallback(async () => {
    const permission = await requestPushPermission();
    if (permission !== "granted") {
      updatePreferences((c) => ({ ...c, push: false }));
      return { subscribed: false, reason: permission };
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus((c) => ({ ...c, supported: false, error: "Web Push not supported." }));
      return { subscribed: false, reason: "unsupported" };
    }
    if (!VAPID_PUBLIC_KEY) {
      updatePreferences((c) => ({ ...c, push: true }));
      setPushStatus((c) => ({
        ...c,
        supported: true,
        permission,
        subscribed: false,
        error: "Add a VAPID key for server push delivery.",
      }));
      return { subscribed: false, reason: "missing-vapid-key" };
    }
    try {
      const registration = await getRegistration();
      if (!registration) throw new Error("Service worker registration unavailable.");
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
      const safeLocalRecord = {
        endpoint: subscription?.endpoint ?? "",
        subscribed: true,
        subscribedAt: new Date().toISOString(),
      };
      try {
        const existing = window.localStorage.getItem(PUSH_SUBSCRIPTION_KEY);
        if (existing) {
          try {
            if (safeJsonParse(existing, {}).keys)
              logger.info("[usePushSubscription] Migrating legacy record.");
          } catch {}
        }
        window.localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(safeLocalRecord));
      } catch {}
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PUSH_SUBSCRIBE;
      if (token && endpoint) await apiUtils.post(endpoint, subscription);
      updatePreferences((c) => ({ ...c, push: true }));
      await updatePushStatus();
      return { subscribed: true, subscription };
    } catch (error) {
      setPushStatus((c) => ({ ...c, error: error.message || "Push subscription failed." }));
      return { subscribed: false, error };
    }
  }, [requestPushPermission, token, updatePreferences, updatePushStatus]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const subscription = await updatePushStatus();
      if (subscription) await subscription.unsubscribe();
      window.localStorage.removeItem(PUSH_SUBSCRIPTION_KEY);
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PUSH_UNSUBSCRIBE;
      if (token && endpoint) await apiUtils.post(endpoint, {});
      updatePreferences((c) => ({ ...c, push: false }));
      await updatePushStatus();
      return { unsubscribed: true };
    } catch (error) {
      setPushStatus((c) => ({ ...c, error: error.message || "Push unsubscribe failed." }));
      return { unsubscribed: false, error };
    }
  }, [token, updatePreferences, updatePushStatus]);

  return {
    pushStatus,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    updatePushStatus,
  };
}
