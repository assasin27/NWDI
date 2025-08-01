import { ReactNode } from 'react';

export const mockNavigate = jest.fn();

export const MockRouter = ({ children }: { children: ReactNode }) => {
  return <div data-testid="mock-router">{children}</div>;
};

export const mockUseNavigate = () => mockNavigate;

export const mockUseLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
});

export const mockLink = ({ to, children, ...props }: any) => (
  <a href={to} {...props}>
    {children}
  </a>
); 