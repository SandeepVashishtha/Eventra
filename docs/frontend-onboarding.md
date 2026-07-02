# React Frontend Onboarding Guide

Welcome to the Eventra React Frontend codebase! This guide will help you understand the architecture, tools, and conventions used to build our seamless user interface.

## Tech Stack

- **React**: Component-based user interface library.
- **Vite**: Ultra-fast build tool and bundler.
- **Tailwind CSS + component styles**: Styled with responsive utility classes and shared CSS modules.

## Directory Layout

- `/src/components`: Reusable UI building blocks and shared interaction patterns.
- `/src/Pages`: Feature-specific container components mapped to router endpoints.
- `/src/context`: Global state providers (e.g. Auth, Theme).
- `/src/hooks`: Custom React hooks that encapsulate shared logic.

## Developer Workflow

1. Run `npm install` to download standard dependencies.
2. Execute `npm run dev` to start the local hot-reloading development server.
3. Run `npm test` before opening a PR so the shared utility and endpoint checks stay green.
4. Make sure all files follow the Prettier formatting configuration rules before committing.
