# Project Architecture

## Overview

Eventra is a React/Vite frontend that connects to a Spring Boot backend over REST. The frontend is fully static and hosted on Vercel; the backend runs on Azure.

---

## High-Level System Architecture

```mermaid
graph TD
    Browser["Browser / PWA"]:::client

    subgraph Frontend["Frontend — Vercel (Static)"]
        Vite["Vite Build + Bundler"]
        React["React 19 SPA"]
        Router["React Router 7"]
        Context["Context Providers\n(Auth, Theme, Notification, MyEvents)"]
        Hooks["Custom Hooks\n(useEventForm, useOfflineSync, useLenis …)"]
        Utils["Utility Modules\n(rateLimiter, conflictDetection, shareUtils …)"]
        SW["Service Worker\n(offline cache / push)"]
    end

    subgraph API["Serverless API Helpers — Vercel Functions"]
        ProxyFn["/api/* proxy functions"]
        Middleware["middleware.js\n(CSRF, CSP headers)"]
    end

    subgraph Backend["Backend — Azure Spring Boot"]
        Auth["Auth Service\n(JWT / OAuth2)"]
        Events["Events Service"]
        Users["Users / Profiles"]
        Notifications["Notifications / SSE"]
        Waitlist["Waitlist Service"]
        DB["PostgreSQL"]
    end

    Browser -->|HTTP| Frontend
    Browser -->|IndexedDB / localStorage| SW
    React --> Router
    React --> Context
    Context --> Hooks
    Hooks --> Utils
    React -->|fetch / apiUtils| API
    API --> Middleware
    Middleware -->|Proxied REST| Backend
    Backend --> DB
    Backend -->|SSE stream| Browser

    classDef client fill:#6366f1,color:#fff,stroke:none
    classDef fe fill:#0ea5e9,color:#fff,stroke:none
    classDef api fill:#8b5cf6,color:#fff,stroke:none
    classDef be fill:#10b981,color:#fff,stroke:none
```

---

## Frontend Layer Breakdown

```mermaid
graph LR
    Pages["Pages\n/events, /hackathons,\n/dashboard, /auth …"]
    Components["Components\nnavbar, common, events,\ngamification, feedback …"]
    Hooks2["Hooks\nuseEventForm\nuseOfflineSync\nuseLenis\nuseWaitlist …"]
    Utils2["Utils\nrateLimiter\nconflictDetection\ncalendarExporter\nshareUtils …"]
    Context2["Context\nAuthContext\nThemeContext\nMyEventsContext\nNotificationContext"]
    Store["Store\n(local state + localStorage)"]

    Pages --> Components
    Pages --> Hooks2
    Components --> Hooks2
    Hooks2 --> Utils2
    Hooks2 --> Context2
    Context2 --> Store
```

---

## Data Flow: Event Registration

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React Frontend
    participant MW as Vercel Middleware
    participant BE as Spring Boot Backend
    participant DB as PostgreSQL

    U->>FE: Click "Register Now"
    FE->>FE: Validate form (useEventForm)
    FE->>FE: Check conflict (conflictDetection.js)
    FE->>MW: POST /api/events/:id/register
    MW->>MW: Verify CSRF token + rate limit
    MW->>BE: Proxy request with JWT
    BE->>DB: INSERT registration
    DB-->>BE: OK
    BE-->>MW: 201 Created
    MW-->>FE: 201 Created
    FE->>FE: Update MyEventsContext
    FE->>FE: Schedule reminder (useOfflineSync)
    FE-->>U: Show success toast
```

---

## Offline Support Architecture

```mermaid
graph TD
    Online["Online Mode"]
    Offline["Offline Mode"]
    SW2["Service Worker\n(Cache API)"]
    IDB["IndexedDB\n(offlineQueue.js)"]
    Sync["Background Sync\n(useOfflineSync hook)"]
    API2["Backend API"]

    Online -->|"network available"| API2
    Online -->|cache assets| SW2
    Offline -->|"queue actions"| IDB
    IDB -->|"on reconnect"| Sync
    Sync -->|"flush queue"| API2
```

---

## Security Layers

| Layer | Mechanism |
|---|---|
| Transport | HTTPS only; HSTS via Vercel headers |
| Auth | JWT Bearer tokens; refresh via HttpOnly cookie |
| CSRF | Double-submit cookie pattern in `middleware.js` |
| Input | `inputSanitization.js` + `sanitizeHtml.js` |
| Rate Limiting | Token-bucket `rateLimiter.js` on hot endpoints |
| CSP | Strict Content-Security-Policy via `cspReporting.js` |
| Secrets | No secrets in `VITE_*` or `REACT_APP_*` env vars |

---

## Key Technology Decisions

| Decision | Rationale |
|---|---|
| Vite 8 over CRA | 10× faster HMR; native ESM |
| React Router 7 | Nested layouts, data loaders, and code splitting |
| Tailwind CSS 4 | Utility-first; zero unused CSS in production build |
| Framer Motion | Declarative animations with reduced-motion support |
| IndexedDB for offline queue | Persistent across browser restarts; survives tab close |
| Token-bucket rate limiter | Prevents client-side API spam without a server round-trip |
