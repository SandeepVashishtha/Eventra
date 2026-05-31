# fix/navbar-accessibility — Plan

Goal: Finish keyboard navigation, focus management, and ARIA improvements for the navbar.

Work items:
- Ensure submenu buttons are reachable and operable via keyboard (Arrow keys, Enter, Space, Escape)
- Manage focus when menus open/close (focus trap/return)
- Add missing ARIA attributes (role="menu" role="menuitem", aria-controls)
- Add unit tests for `NavbarLinks` keyboard behavior
- Validate with a11y tools (axe-core)

This branch adds plan and test skeleton.
