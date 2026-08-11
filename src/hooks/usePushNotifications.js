import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'eventra_push_prompt_dismissed';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';

      // Do not show prompt if already denied, granted, or previously dismissed by user
      if (currentPermission === 'default' && !isDismissed) {
        setIsPromptVisible(true);
      } else {
        setIsPromptVisible(false);
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'denied') {
      setIsPromptVisible(false);
      localStorage.setItem(STORAGE_KEY, 'true');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsPromptVisible(false);

      if (result === 'denied' || result === 'granted') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsPromptVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  return {
    permission,
    isPromptVisible,
    requestPermission,
    dismissPrompt,
  };
};

export default usePushNotifications;
