import { vi } from 'vitest';
import React from 'react';

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
export const MockRouter = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'router' }, children);
};

export const MockRoutes = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'routes' }, children);
};

export const MockRoute = ({ element }: { element: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'route' }, element);
};

export const MockLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: unknown }) => {
  return React.createElement('a', { href: to, 'data-testid': 'link', ...props }, children);
};

export const MockNavLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: unknown }) => {
  return React.createElement('a', { href: to, 'data-testid': 'nav-link', ...props }, children);
}; 