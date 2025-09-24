import { supabase } from '@/lib/supabase';

export const setupFarmerAccount = async () => {
  try {
    console.log('Setting up farmer account...');
    
    // First, check if the user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email: 'test@nareshwadi.in',
      password: 'farmer',
    });

    if (existingUser.user) {
      console.log('User already exists, signing out...');
      await supabase.auth.signOut();
    }

    // Try to sign up the farmer account
    console.log('Attempting to create farmer account...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@nareshwadi.in',
      password: 'farmer',
      options: {
        data: {
          name: 'Nareshwadi Farmer',
          role: 'farmer'
        }
      }
    });

    if (signUpError) {
      console.log('Sign up error:', signUpError.message);
      
      // If user already exists, try to sign in
      if (signUpError.message.includes('already registered')) {
        console.log('User already registered, attempting sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test@nareshwadi.in',
          password: 'farmer',
        });

        if (signInError) {
          console.error('Sign in failed:', signInError.message);
          return { success: false, error: `Sign in failed: ${signInError.message}` };
        }

        console.log('Sign in successful:', signInData);
        
        // Create admin profile
        const { data: profileData, error: profileError } = await supabase
          .from('admin_profile')
          .insert({
            user_id: signInData.user.id,
            contact_email: 'test@nareshwadi.in',
            farm_name: 'Nareshwadi Farm'
          })
          .select()
          .single();

        if (profileError) {
          console.log('Profile creation error (might already exist):', profileError.message);
        } else {
          console.log('Farmer profile created:', profileData);
        }

        // Sign out after setup
        await supabase.auth.signOut();
        return { success: true, message: 'Farmer account setup completed!' };
      } else {
        return { success: false, error: `Sign up failed: ${signUpError.message}` };
      }
    } else {
      console.log('Farmer account created:', signUpData);
      
      // Create admin profile
      const { data: profileData, error: profileError } = await supabase
        .from('admin_profile')
        .insert({
          user_id: signUpData.user.id,
          contact_email: 'test@nareshwadi.in',
          farm_name: 'Nareshwadi Farm'
        })
        .select()
        .single();

      if (profileError) {
        console.log('Profile creation error (might already exist):', profileError.message);
      } else {
        console.log('Farmer profile created:', profileData);
      }

      // Sign out after setup
      await supabase.auth.signOut();
      return { success: true, message: 'Farmer account setup completed!' };
    }
  } catch (error) {
    console.error('Setup error:', error);
    return { success: false, error: 'Failed to setup farmer account' };
  }
};

export const checkFarmerAccount = async () => {
  try {
    // Check if admin profile exists
    const { data: profiles, error } = await supabase
      .from('admin_profile')
      .select('*')
      .eq('contact_email', 'test@nareshwadi.in');

    if (error) {
      console.error('Error checking farmer profiles:', error);
      return { exists: false, error: error.message };
    }

    console.log('Farmer profiles found:', profiles);
    return { exists: profiles.length > 0, profiles };
  } catch (error) {
    console.error('Check error:', error);
    return { exists: false, error: 'Failed to check farmer account' };
  }
}; 