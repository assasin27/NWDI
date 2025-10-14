import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';

// Mock useAuth hook values
const mockAuthValue = {
  user: null,
  login: jest.fn(),
  logout: jest.fn()
};

// Mock useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockAuthValue
}));

// Mock Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(({ to }) => <div data-testid="mock-navigate" data-to={to}>Redirected</div>)
}));

describe('AdminLayout Component', () => {
  const renderAdminLayout = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLayout />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('redirects to login when user is not authenticated', () => {
    mockAuthValue.user = null;
    renderAdminLayout();
    const navigate = screen.getByTestId('mock-navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
  });

  it('redirects to homepage when user is not an admin', () => {
    mockAuthValue.user = {
      id: 'user1',
      email: 'user@example.com',
      role: 'customer'
    };
    renderAdminLayout();
    const navigate = screen.getByTestId('mock-navigate');
    expect(navigate).toHaveAttribute('data-to', '/');
  });

  it('shows admin layout when user is an admin', () => {
    mockAuthValue.user = {
      id: 'admin1',
      email: 'admin@farmfresh.com',
      role: 'admin'
    };
    renderAdminLayout();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });
});