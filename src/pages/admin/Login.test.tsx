import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import Login from './Login';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom') as object,
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
          <Toaster />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('handles successful login with admin credentials', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@farmfresh.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('handles failed login with incorrect credentials', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});