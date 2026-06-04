import { useEffect } from 'react'; export function EventHero() { useEffect(() => { const timer = setInterval(() => {}, 1000); return () => clearInterval(timer); }, []); return null; }
