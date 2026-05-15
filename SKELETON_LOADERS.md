# Skeleton Loaders Implementation

**Issue:** [#839 - Add skeleton loaders for events, hackathons, and project cards](https://github.com/SandeepVashishtha/Eventra/issues/839)

## Changes Made

### 1. New File: `src/components/common/SkeletonLoaders.jsx`
Created a reusable skeleton components file with three skeleton variants that closely match the actual card layouts:

- **`EventCardSkeleton`** — Matches `EventCard` layout: header (icon + title + badge), image area, description lines, 2x2 info grid (location/time/type/date), and two CTA buttons.
- **`HackathonCardSkeleton`** — Matches `HackathonCard` layout: status/difficulty/prize badges, title + description, organizer, date/location/time block, tech stack tags, stats grid (participants/teams/submissions), winner section, and action buttons.
- **`ProjectCardSkeleton`** — Matches `ProjectCard` layout: header (icon + title + status), 16:9 image area, description, category + difficulty tags, author avatar + stats counters, tech stack tags, and GitHub/Live Demo buttons.

All skeletons use Tailwind's `animate-pulse` with a subtle shimmer gradient (`bg-gradient-to-r` with `bg-[length:200%_100%]`) for a smooth loading effect. Dark mode is fully supported via `dark:` variants.

### 2. Modified: `src/Pages/Events/EventsPage.js`
- Added `isLoading` state (default: `true`)
- Added simulated async data loading with an 800ms delay (via `setTimeout`)
- Replaced instant synchronous `setEvents(mockEvents)` with async loading pattern
- While `isLoading` is `true`, renders 6 `EventCardSkeleton` placeholders in the grid
- This page previously had **no loading state at all** — cards appeared instantly with no feedback

### 3. Modified: `src/Pages/Hackathons/HackathonPage.js`
- Replaced the inline basic `SkeletonCard` (a single div with minimal structure) with the imported `HackathonCardSkeleton` that matches the actual `HackathonCard` layout section-by-section
- Removed ~20 lines of inline skeleton code

### 4. Modified: `src/Pages/Projects/ProjectsPage.js`
- Replaced the inline `SkeletonCard` with the imported `ProjectCardSkeleton` that matches `ProjectCard` layout
- Removed ~32 lines of inline skeleton code

## Key Features
- **Layout-matched**: Each skeleton mirrors its corresponding card's DOM structure for minimal layout shift
- **Shimmer effect**: Smooth animated gradient instead of plain gray blocks
- **Dark mode**: All skeletons use `dark:` variants for dark theme support
- **Reusable**: Components exported from a single file, easy to maintain and extend
- **Non-intrusive**: Loading state only shows during initial data fetch; once data loads, real cards render seamlessly

## How to Test
1. Run the app: `npm start`
2. Navigate to **Events**, **Hackathons**, and **Projects** pages
3. You should see shimmer skeleton cards for ~0.8s (Events) / ~1s (Hackathons) / ~0.5s (Projects) before the actual cards appear
4. Skeletons should closely resemble the card layouts and fully support dark mode
