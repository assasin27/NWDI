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
    throw new Error(
      '\n==============================\n' +
      'Sign up successful!\n' +
      'To complete authentication, open Gmail (or your email app) and click the confirmation link we sent you.\n' +
      'You must confirm your email before you can log in.\n' +
      '==============================\n'
    );
  }

  // Do not insert into users table here; wait until login
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

  // Check if user profile exists in users table
  const { data: userData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError && profileError.code === 'PGRST116') { // Not found
    // Insert user profile if not found
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.user_metadata?.first_name || '',
        last_name: data.user.user_metadata?.last_name || '',
        is_seller: data.user.user_metadata?.is_seller || false,
      },
    ]);
    if (insertError) throw insertError;
    // Fetch the newly inserted user
    const { data: newUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (fetchError) throw fetchError;
    userData = newUser;
  } else if (profileError) {
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return null;

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
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
