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
      // First try to fetch from farmer_profiles
      let { data: farmerProfile, error: farmerError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (farmerProfile) {
        return {
          id: farmerProfile.id,
          user_id: farmerProfile.user_id,
          full_name: farmerProfile.name || '',
          email: farmerProfile.email,
          role: 'farmer' as UserRole,
          created_at: farmerProfile.created_at,
          updated_at: farmerProfile.updated_at,
        };
      }

      // If not a farmer, try regular profiles
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;
      return userProfile as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Update the auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    try {
      console.log('Updating auth state with session:', session?.user?.id);
      
      if (!session?.user) {
        console.log('No session or user, setting guest state');
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

      console.log('Checking for farmer profile');
      // First check for farmer profile
      const { data: farmerProfile, error: farmerError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (farmerError) {
        console.error('Error fetching farmer profile:', farmerError);
        throw farmerError;
      }

      console.log('Farmer profile found:', farmerProfile);

      if (farmerProfile) {
        const profile = {
          id: farmerProfile.id,
          user_id: farmerProfile.user_id,
          full_name: farmerProfile.farm_name || '',
          email: farmerProfile.email,
          role: 'farmer' as UserRole,
          created_at: farmerProfile.created_at,
          updated_at: farmerProfile.updated_at,
        };
        console.log('Setting farmer state with profile:', profile);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
          isAuthenticated: true,
          role: 'farmer',
        });
        return;
      }

      console.log('No farmer profile found, checking regular profile');
      // If not a farmer, get regular profile
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

      // Create farmer profile
      const farmerProfile = {
        user_id: data.user.id,
        email,
        name: userData.full_name || '',
      };

      const { error: profileError } = await supabase
        .from('farmer_profiles')
        .insert([farmerProfile]);

      if (profileError) throw profileError;

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
