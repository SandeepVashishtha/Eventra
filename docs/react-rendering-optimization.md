# React Render Optimization Guide

Strategies for mitigating performance bottlenecks and duplicate rendering cycles in Eventra React components.

## Strategies

1. **useCallback & useMemo**: Restrict re-evaluation of non-primitive values across cycles.
2. **React.memo**: Restrict component updates unless reference properties explicitly change.
3. **Lazy Loading**: Route-based code splitting using `React.lazy` limits the bundle size.
