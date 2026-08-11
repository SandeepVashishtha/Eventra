/**
 * adds a body scroll lock helper.
 */
export function scrollLock(on) {
  if (typeof document === 'undefined') return;
  if (on) {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  } else {
    const top = Math.abs(parseInt(document.body.style.top || '0', 10));
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, top);
  }
}
