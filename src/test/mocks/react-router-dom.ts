import { vi } from 'vitest';

export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn(() => ({ pathname: '/' }));

export const mockRouterContext = {
  navigate: mockNavigate,
  location: { pathname: '/' },
  params: {},
  search: '',
  hash: '',
  state: null,
};

// Mock React Router components
export const MockRouter = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="router">{children}</div>
);

export const MockRoutes = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="routes">{children}</div>
);

export const MockRoute = ({ element }: { element: React.ReactNode }) => (
  <div data-testid="route">{element}</div>
);

export const MockLink = ({ to, children, ...props }: any) => (
  <a href={to} {...props} data-testid="link">
    {children}
  </a>
);

export const MockNavLink = ({ to, children, ...props }: any) => (
  <a href={to} {...props} data-testid="nav-link">
    {children}
  </a>
); 