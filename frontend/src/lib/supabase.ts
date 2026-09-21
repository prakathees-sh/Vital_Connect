import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if Supabase credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Instantiate Supabase client or a placeholder client that won't crash during SSR/build
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Supabase Auth Service wrapper for Vital Connect
 */
export const supabaseAuth = {
  // Sign up with email & password (sends verification email or OTP)
  async signUpWithEmail(email: string, password: string, metadata: Record<string, any> = {}) {
    if (!isSupabaseConfigured) {
      // Graceful local demo mode
      return {
        data: {
          user: { id: 'demo-user-id', email, user_metadata: metadata },
          session: null,
        },
        error: null,
      };
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/verify-email` : undefined,
      },
    });
  },

  // Verify Email OTP token
  async verifyEmailOtp(email: string, token: string) {
    if (!isSupabaseConfigured) {
      // Demo acceptance: any 6 digit code
      if (token && token.length === 6) {
        return { data: { user: { email }, session: { access_token: 'demo-token' } }, error: null };
      }
      return { data: null, error: new Error('Invalid verification code') };
    }
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
  },

  // Send Phone OTP
  async sendPhoneOtp(phone: string) {
    if (!isSupabaseConfigured) {
      return { data: { message: 'Demo OTP sent' }, error: null };
    }
    return await supabase.auth.signInWithOtp({
      phone,
    });
  },

  // Verify Phone OTP
  async verifyPhoneOtp(phone: string, token: string) {
    if (!isSupabaseConfigured) {
      if (token && token.length === 6) {
        return { data: { user: { phone }, session: { access_token: 'demo-token' } }, error: null };
      }
      return { data: null, error: new Error('Invalid OTP code') };
    }
    return await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return {
        data: {
          user: { id: 'demo-user-id', email },
          session: { access_token: 'demo-token' },
        },
        error: null,
      };
    }
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined,
    });
  },

  // Update password
  async updatePassword(password: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.updateUser({ password });
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  // Get current user session
  async getSession() {
    if (!isSupabaseConfigured) {
      return { data: { session: null }, error: null };
    }
    return await supabase.auth.getSession();
  },
};
