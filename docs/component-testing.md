# Component Testing Guide

Guidelines for writing modular unit tests for React components in the Eventra web application.

## Tools
- **Vitest**: Light, ultra-fast unit testing framework.
- **React Testing Library**: Asserts component rendering and DOM interactions.

## Best Practices
- Test user interactions (clicks, input modifications) rather than private state values.
- Mock all outer contexts (like `AuthContext` and router states) to isolate tests.