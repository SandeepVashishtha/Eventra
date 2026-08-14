import React from 'react';
import { render, waitForElementToBeRemoved, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

/**
 * ============================================================================
 * MOCK PROVIDERS & DEFAULT CONFIGURATIONS
 * ============================================================================
 */

// Placeholder Theme Context for theme testing support
const MockThemeContext = React.createContext({ theme: 'light', toggleTheme: () => {} });

export function MockThemeProvider({ children, initialTheme = 'light' }) {
  const [theme, setTheme] = React.useState(initialTheme);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <MockThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-testid="theme-provider-wrapper" data-theme={theme}>
        {children}
      </div>
    </MockThemeContext.Provider>
  );
}

/**
 * Creates a standard wrapper combining all application-level context providers.
 */
function AllTheProviders({ children, initialRoute = '/', authValue = null, theme = 'light' }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider initialValue={authValue}>
        <MockThemeProvider initialTheme={theme}>
          {children}
        </MockThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

/**
 * ============================================================================
 * CUSTOM RENDER FUNCTIONS
 * ============================================================================
 */

/**
 * Standard render wrapper with basic BrowserRouter.
 */
export function renderWithRouter(ui, options = {}) {
  const { route = '/', ...renderOptions } = options;
  window.history.pushState({}, 'Test page', route);

  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
      ...renderOptions,
    }),
  };
}

/**
 * Render wrapper for components requiring AuthContext and Router.
 */
export function renderWithAuth(ui, options = {}) {
  const { authValue = null, route = '/', ...renderOptions } = options;

  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider initialValue={authValue}>{children}</AuthProvider>
        </MemoryRouter>
      ),
      ...renderOptions,
    }),
  };
}

/**
 * Flexible MemoryRouter render wrapper for testing deep link paths, query parameters,
 * and parameterized routes (e.g. /users/:id).
 */
export function renderWithMemoryRouter(ui, { route = '/', path = '/', ...options } = {}) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>,
      options
    ),
  };
}

/**
 * Master custom render method that encapsulates all application providers.
 */
export function customRender(ui, options = {}) {
  const { initialRoute = '/', authValue = null, theme = 'light', ...renderOptions } = options;

  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllTheProviders initialRoute={initialRoute} authValue={authValue} theme={theme}>
          {children}
        </AllTheProviders>
      ),
      ...renderOptions,
    }),
  };
}

/**
 * ============================================================================
 * USER EVENT HELPERS
 * ============================================================================
 */

/**
 * Pre-configures a userEvent instance with custom options (e.g., pointer event delay).
 */
export function setupUser(options = {}) {
  return userEvent.setup({ delay: null, ...options });
}

/**
 * Helper to simulate typing into input fields with clear-first behavior.
 */
export async function clearAndType(element, text, user = userEvent.setup()) {
  await user.clear(element);
  await user.type(element, text);
}

/**
 * ============================================================================
 * ASYNC & DOM HELPERS
 * ============================================================================
 */

/**
 * Waits for loading spinners or skeleton loaders to disappear from the DOM.
 */
export async function waitForLoadingToFinish(matcher = /loading|spinner|skeleton/i) {
  const loadingElements = screen.queryAllByTestId(matcher);
  if (loadingElements.length > 0) {
    await Promise.all(
      loadingElements.map((element) =>
        waitForElementToBeRemoved(() => element, { timeout: 4000 }).catch(() => {})
      )
    );
  }
}

/**
 * ============================================================================
 * BROWSER FEATURE MOCKS (JSDOM POLYFILLS)
 * ============================================================================
 */

/**
 * Mocks window.matchMedia for components depending on CSS media queries or dark mode.
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/**
 * Mocks ResizeObserver for components measuring DOM element bounding boxes.
 */
export function mockResizeObserver() {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

/**
 * Mocks IntersectionObserver for lazy-loading or infinite scroll components.
 */
export function mockIntersectionObserver() {
  class IntersectionObserverMock {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  });
}

/**
 * Mocks window.localStorage with an in-memory Map store.
 */
export function setupLocalStorageMock() {
  const store = new Map();

  const localStorageMock = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    getLength: () => store.size,
    key: (index) => Array.from(store.keys())[index] || null,
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return store;
}

/**
 * ============================================================================
 * MOCK DATA GENERATORS (FACTORIES)
 * ============================================================================
 */

/**
 * Generates a mock authenticated user object for test assertions.
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'user',
    avatar: 'https://example.com/avatar.png',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Generates a mock AuthContext payload.
 */
export function createMockAuthState(overrides = {}) {
  const user = createMockUser(overrides.user);
  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    token: 'mock-jwt-token-xyz',
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    ...overrides,
  };
}

// Re-export everything from React Testing Library for convenient single-source imports
export * from '@testing-library/react';

// Override default render method with customRender
export { customRender as render };