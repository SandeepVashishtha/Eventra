# Lenis Smooth Scrolling Implementation

## Overview

Lenis smooth scrolling has been integrated across all pages of the Eventra website for a premium, buttery-smooth scrolling experience.

## What's Included

### 1. Core Implementation

- **Package**: `@studio-freight/lenis` (installed)
- **Hook**: `src/hooks/useLenis.js` - Custom React hook for Lenis initialization
- **Integration**: Added to `App.js` for global application

### 2. Configuration

The default Lenis configuration includes:

- **Duration**: 1.2s for smooth transitions
- **Easing**: Custom easing function for natural deceleration
- **Direction**: Vertical scrolling
- **Mouse Multiplier**: 1 (standard mouse wheel sensitivity)
- **Smooth Touch**: Disabled (native touch scrolling on mobile)
- **Touch Multiplier**: 2 (enhanced touch scrolling)

### 3. Utility Functions

Located in `src/utils/lenisUtils.js`:

```javascript
import { scrollToElement, scrollToTop, stopScroll, startScroll, getScrollPosition } from './utils/lenisUtils';

// Scroll to a specific element
scrollToElement('#section-id', { offset: -100, duration: 1.5 });

// Scroll to top
scrollToTop();

// Stop scrolling (useful for modals)
stopScroll();

// Resume scrolling
startScroll();

// Get current scroll position
const position = getScrollPosition();
```

### 4. CSS Styles

Added to `src/index.css`:

- Lenis-specific classes for proper scroll behavior
- Prevents conflicts with existing scroll implementations
- Handles iframe pointer events during scroll

## Usage Examples

### Basic Scroll to Element

```javascript
import { scrollToElement } from '../utils/lenisUtils';

const handleClick = () => {
  scrollToElement('#contact-section', { 
    offset: -80, // Account for fixed navbar
    duration: 1.5 
  });
};
```

### Modal Integration

```javascript
import { stopScroll, startScroll } from '../utils/lenisUtils';

const openModal = () => {
  stopScroll(); // Prevent background scrolling
  setModalOpen(true);
};

const closeModal = () => {
  startScroll(); // Resume scrolling
  setModalOpen(false);
};
```

### Custom Scroll Behavior

```javascript
// Access the global Lenis instance
if (window.lenis) {
  window.lenis.scrollTo(500, { 
    duration: 2,
    easing: (t) => t // Linear easing
  });
}
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (native touch scrolling)

## Performance Notes

- Lenis uses `requestAnimationFrame` for optimal performance
- Smooth scrolling is disabled on touch devices by default (native behavior)
- No impact on page load time
- Minimal JavaScript overhead

## Customization

To modify Lenis behavior, edit the configuration in `src/hooks/useLenis.js`:

```javascript
const lenis = new Lenis({
  duration: 1.5,        // Increase for slower scrolling
  mouseMultiplier: 0.5, // Decrease for less sensitive mouse wheel
  // ... other options
});
```

## Troubleshooting

### Scrolling feels too fast/slow

Adjust the `duration` parameter in `useLenis.js`

### Conflicts with other scroll libraries

Ensure no other smooth scroll implementations are active (e.g., `scroll-behavior: smooth` in CSS)

### Modal background still scrolls

Use `stopScroll()` when opening modals and `startScroll()` when closing

## Resources

- [Lenis Documentation](https://github.com/studio-freight/lenis)
- [Lenis Examples](https://lenis.studiofreight.com/)
