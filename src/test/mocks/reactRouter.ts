import React, { ReactNode } from 'react';

export const mockNavigate = jest.fn();

export const MockRouter = ({ children }: { children: ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'mock-router' }, children);
};

export const mockUseNavigate = () => mockNavigate;

export const mockUseLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
});

export const mockLink = ({ to, children, ...props }: { to: string; children: ReactNode; [key: string]: unknown }) => {
  return React.createElement('a', { href: to, ...props }, children);
}; 