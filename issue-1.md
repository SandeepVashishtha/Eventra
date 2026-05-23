# Issue 1: Neon and Highly Saturated Navbar and Logo Borders

## Description
The top navigation bar features a highly saturated neon animated border (`neon-navbar-border`) and multi-color revolving text logo styling. While eye-catching, this extreme neon look detracts from the professional content of the application, degrades readability, and clashes with a clean, minimalist SaaS layout.

## Proposed Solution / Changes
- Remove the animated `neon-navbar-border` and replace it with a clean, desaturated border divider (`1px solid var(--border-color)`).
- Simplify the neon brand logo by replacing the high-saturation colorful text gradient with a modern, high-contrast monochrome style (`var(--text-color)`) that respects the system theme.
- Clean up neon keyframes and drop-shadows to ensure high-end visual elegance.

## Type of Issue
- [ ] 🐛 Bug Fix
- [ ] ✨ Feature Request
- [x] 🎨 UI/UX Enhancement
- [ ] 🧾 Documentation Update
