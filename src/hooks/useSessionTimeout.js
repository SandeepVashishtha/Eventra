
import { useEffect } from 'react';
export function useSessionTimeout(logoutFn, timeoutMs = 900000) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timer;
    const resetTimer = () => { clearTimeout(timer); timer = setTimeout(logoutFn, timeoutMs); };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => { window.removeEventListener('mousemove', resetTimer); window.removeEventListener('keydown', resetTimer); clearTimeout(timer); };
  }, [logoutFn, timeoutMs]);
}
