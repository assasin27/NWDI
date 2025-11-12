# Authentication Integration Examples

## Example 1: Using useSupabaseUser in Components

### Basic Usage
```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';

export function UserProfile() {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return <div className="text-center p-4">Loading user data...</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Please log in first</div>;
  }

  return (
    <div className="p-4">
      <h2>Welcome, {user.email}</h2>
      <p>User ID: {user.id}</p>
    </div>
  );
}
```

### Protected Route
```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { Navigate } from 'react-router-dom';

export function ProtectedPage() {
  const { user, loading } = useSupabaseUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <div>This content is only for logged-in users</div>;
}
```

## Example 2: Admin Protection

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { supabase } from '@/integrations/supabase/supabaseClient';

export function AdminPanel() {
  const { user, loading } = useSupabaseUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.id);
    }
  }, [user]);

  async function checkAdminStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <div>Unauthorized</div>;

  return <div>Admin Dashboard</div>;
}
```

## Example 3: Login Form

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { supabase } from '@/integrations/supabase/supabaseClient';
import { useState } from 'react';

export function LoginForm() {
  const { user } = useSupabaseUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }
      // useSupabaseUser will automatically detect the new session
      // No manual redirect needed - auth state change will trigger
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4">
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border mb-4"
        disabled={loading}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border mb-4"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

## Example 4: Logout

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const { signOut } = useSupabaseUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
      // useSupabaseUser will automatically clear user state
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

## Example 5: Session Persistence Check

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useEffect } from 'react';

export function SessionDebug() {
  const { user, loading } = useSupabaseUser();

  useEffect(() => {
    // Log session status on mount and changes
    console.log('Session Status:', {
      hasUser: !!user,
      loading,
      email: user?.email || 'none',
      timestamp: new Date().toISOString(),
    });

    // Check localStorage for token
    const token = localStorage.getItem('sb-lzjhjecktllltkizgwnr-auth-token');
    console.log('Token in localStorage:', !!token);
  }, [user, loading]);

  return (
    <div className="p-4 bg-gray-100 rounded text-sm">
      <p>Loading: {loading ? 'YES' : 'NO'}</p>
      <p>User: {user ? user.email : 'Not logged in'}</p>
      <p>Session: {localStorage.getItem('sb-lzjhjecktllltkizgwnr-auth-token') ? 'Active' : 'None'}</p>
    </div>
  );
}
```

## Example 6: Cart with Auth Integration

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useCart } from '@/hooks/useCart';

export function CartCheckout() {
  const { user, loading: authLoading } = useSupabaseUser();
  const { items, loading: cartLoading } = useCart();

  if (authLoading || cartLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <p>Please log in to checkout</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <div>Your cart is empty</div>;
  }

  return (
    <div>
      <h2>Checkout for {user.email}</h2>
      {items.map((item) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
      <button onClick={handleCheckout}>Complete Purchase</button>
    </div>
  );
}
```

## Example 7: Error Boundary with Auth

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error?.message.includes('Auth')) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <p>Authentication error: {this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/login'}>
            Back to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in App.tsx
export function App() {
  return (
    <AuthErrorBoundary>
      <Routes>
        {/* your routes */}
      </Routes>
    </AuthErrorBoundary>
  );
}
```

## Example 8: Conditional Rendering Based on Auth

```typescript
export function Navigation() {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return <div>Loading navigation...</div>;
  }

  return (
    <nav>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/orders">Orders</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
```

## Example 9: Real-time Sync

```typescript
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { supabase } from '@/integrations/supabase/supabaseClient';

export function UserDataSync() {
  const { user } = useSupabaseUser();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to user profile changes
    const subscription = supabase
      .from('users')
      .on('*', (payload) => {
        if (payload.new.id === user.id) {
          setUserData(payload.new);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (!user || !userData) return <div>Loading user data...</div>;

  return <div>User data synced: {userData.email}</div>;
}
```

## Testing Examples

### Unit Test
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

test('useSupabaseUser handles no session gracefully', async () => {
  const { result } = renderHook(() => useSupabaseUser());

  // Initially loading
  expect(result.current.loading).toBe(true);

  // After session check
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // No user, no error
  expect(result.current.user).toBe(null);
});
```

### Integration Test
```typescript
test('Login flow updates useSupabaseUser', async () => {
  const { result } = renderHook(() => useSupabaseUser());

  // User not logged in initially
  expect(result.current.user).toBe(null);

  // Simulate login
  await act(async () => {
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password',
    });
  });

  // User should be updated
  await waitFor(() => {
    expect(result.current.user).not.toBe(null);
  });
});
```

These examples demonstrate proper usage of the fixed `useSupabaseUser` hook and best practices for authentication in the NWDI project.
