import { supabase } from './supabaseClient';

type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isSeller?: boolean;
};

type LoginData = {
  email: string;
  password: string;
};

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSeller: boolean;
};

export const signUp = async (userData: SignUpData): Promise<UserProfile> => {
  const { email, password, firstName, lastName, isSeller = false } = userData;

  // Create the user in Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        is_seller: isSeller,
      },
    },
  });

  if (signUpError) {
    throw signUpError;
  }

  // If email confirmation is required, authData.user will be null
  if (!authData.user) {
    throw new Error('Sign up successful! Please check your email to confirm your account before logging in.');
  }

  // Create user in the public.users table
  const { error: profileError } = await supabase.from('users').insert([
    {
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      is_seller: isSeller,
    },
  ]);

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return {
    id: authData.user.id,
    email: authData.user.email!,
    firstName,
    lastName,
    isSeller,
  };
};

export const login = async ({ email, password }: LoginData): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned after login');
  }

  // Get the full user profile
  const { data: userData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    isSeller: userData.is_seller,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    isSeller: userData.is_seller,
  };
};

export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: UserProfile | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT') {
        callback(null);
        return;
      }

      if (session?.user) {
        try {
          const user = await getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting user on auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};
