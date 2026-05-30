// SEO and Open Graph metadata update support on event pages
export function updateMetaTags(event) {
  if (!event) return;
  document.title = `${event.title} | Eventra`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', event.description || '');
}
