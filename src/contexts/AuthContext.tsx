import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserRole, UserProfile, AuthSession } from '@/types/auth';

// Default user profile for unauthenticated users
const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  user_id: '',
  full_name: 'Guest',
  email: '',
  role: 'guest',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Create the context with a default value
const AuthContext = createContext<AuthSession>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  role: 'guest',
  hasRole: () => false,
  signIn: async () => ({ error: 'Auth context not initialized' }),
  signUp: async () => ({ error: 'Auth context not initialized' }),
  signOut: async () => {},
  updateProfile: async () => ({ error: 'Auth context not initialized' }),
  refreshSession: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: UserRole;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    role: 'guest',
  });

  // Fetch user profile from the database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // First check if user is an admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData?.is_admin) {
        return {
          id: userData.id,
          user_id: userData.id,
          full_name: userData.first_name ? 
            `${userData.first_name} ${userData.last_name || ''}`.trim() : 'Admin User',
          email: userData.email,
          role: 'admin' as UserRole,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
        };
      }

      // If not admin, check for farmer profile
      const { data: farmerProfile, error: farmerError } = await supabase
        .from('admin_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (farmerProfile) {
        return {
          id: farmerProfile.id,
          user_id: farmerProfile.user_id,
          full_name: farmerProfile.farm_name || '',
          email: farmerProfile.contact_email,
          role: 'farmer' as UserRole,
          created_at: farmerProfile.created_at,
          updated_at: farmerProfile.updated_at,
        };
      }

      // If not a farmer, try regular profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        // If no profile exists, create a basic one from user data
        if (userData) {
          return {
            id: userData.id,
            user_id: userData.id,
            full_name: userData.first_name ? 
              `${userData.first_name} ${userData.last_name || ''}`.trim() : 'User',
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            role: 'buyer' as UserRole,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString(),
          };
        }
        return null;
      }
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Update the auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    try {
      if (!session?.user) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          role: 'guest',
        });
        return;
      }

      // Get user data including is_admin flag
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;

      // If user is admin, set admin role immediately
      if (userData?.is_admin) {
        const adminProfile = {
          id: session.user.id,
          user_id: session.user.id,
          full_name: userData.first_name ? 
            `${userData.first_name} ${userData.last_name || ''}`.trim() : 'Admin User',
          email: session.user.email || '',
          role: 'admin' as UserRole,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
        };
        
        setState({
          user: session.user,
          profile: adminProfile,
          session,
          loading: false,
          error: null,
          isAuthenticated: true,
          role: 'admin',
        });
        return;
      }

      // For non-admin users, proceed with regular flow
      const profile = await fetchUserProfile(session.user.id) || {
        ...DEFAULT_USER_PROFILE,
        user_id: session.user.id,
        email: session.user.email || '',
      };

      setState({
        user: session.user,
        profile,
        session,
        loading: false,
        error: null,
        isAuthenticated: true,
        role: (profile.role || 'guest') as UserRole,
      });
    } catch (error) {
      console.error('Error updating auth state:', error);
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        profile: null,
        session: session,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update auth state',
        isAuthenticated: false,
        role: 'guest',
      }));
    }
  }, [fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await updateAuthState(session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to initialize authentication',
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: null,
              isAuthenticated: false,
              role: 'guest',
            });
          }
        } else if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      await updateAuthState(data.session);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Failed to create user');

      await updateAuthState(data.session);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        role: 'guest',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out',
      }));
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const { user } = state;
    if (!user) throw new Error('Not authenticated');
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh the profile
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setState(prev => ({
          ...prev,
          profile: { ...profile, ...updates },
        }));
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Refresh the current session
  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await updateAuthState(session);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    const { role: userRole } = state;
    return userRole === role || userRole === 'admin';
  };

  const value: AuthSession = {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    hasRole,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthSession => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};