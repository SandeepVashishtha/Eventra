// Safe interval cleaning on reminder checks
import { useEffect } from 'react';
export function useReminderInterval(callback, delay) {
  useEffect(() => {
    if (delay !== null) {
      let id = setInterval(callback, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
