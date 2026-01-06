import { supabase } from '../config/supabase';

const SUPABASE_URL = 'https://jkrgyycposcdizfyhvwv.supabase.co';

/**
 * Sign up user via Supabase Edge Function
 * Fallback: Direct signup if Edge Function is not deployed
 */
export const signupAutoWithEmail = async (email) => {
  try {
    // Try Edge Function first
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/signup-auto`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }
    );

    if (response.ok) {
      return await response.json(); // { userId, email, password }
    }

    // If Edge Function fails (404/500), fallback to direct signup
    console.warn('Edge Function not available, using direct signup');
    
    // Generate random password
    const password = Math.random().toString(36).slice(-16) + 'Aa1!';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // No email confirmation needed
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error('Email already registered. Please use another email or login with your password.');
      }
      throw error;
    }

    return {
      userId: data.user?.id,
      email: data.user?.email,
      password
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Auto-login after signup
 */
export const autoLoginAfterSignup = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Handle email not confirmed error
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        throw new Error('Email not confirmed. Please disable email confirmation in Supabase Dashboard: Settings → Authentication → Email Auth → Disable "Confirm email"');
      }
      throw error;
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

/**
 * Login with email/password
 */
export const loginWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return { user: data.user, session: data.session };
};

/**
 * Logout
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Change password for current logged-in user
 */
export const changePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
};
