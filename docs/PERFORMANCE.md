# Performance Optimization: Route-level Code Splitting

This PR implements route-level code splitting using `React.lazy()` and `Suspense` to reduce the initial bundle size and improve Core Web Vitals (LCP, TBT).

## Strategies
- **Code Splitting:** Chunks generated for major routes (Explore, Auth, Admin).
- **Intelligent Prefetching:** Hover-based and predictive prefetching via `useRoutePrefetch`.
- **Custom Skeletons:** Branded loading states to reduce CLS.

## Implementation
- `useRoutePrefetch`: Background loading hook.
- `prefetchRoute`: Caching prefetch utility.
- `AuthFormSkeleton` & `ExploreEventsSkeleton`: Granular loading UI.
