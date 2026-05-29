# Mitigating CLS in Card Thumbnails

Always specify dimensions or aspect ratios on image containers to avoid page layout shifts.

## Resolution
```css
.card-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```