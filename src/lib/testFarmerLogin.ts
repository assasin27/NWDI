import { supabase } from '@/integrations/supabase/client';

export const testFarmerLogin = async () => {
  try {
    console.log('Testing farmer login...');
    
    // Try to sign in with the farmer credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@nareshwadi.in',
      password: 'farmer',
    });

    if (error) {
      console.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log('Login successful:', data.user);
      
      // Check if user has a farmer profile
      const { data: profile, error: profileError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile check failed:', profileError.message);
        await supabase.auth.signOut();
        return { success: false, error: 'No farmer profile found' };
      }

      console.log('Farmer profile found:', profile);
      await supabase.auth.signOut();
      return { success: true, message: 'Farmer login test successful!' };
    }

    return { success: false, error: 'No user data received' };
  } catch (error) {
    console.error('Test error:', error);
    return { success: false, error: 'Test failed' };
  }
}; 