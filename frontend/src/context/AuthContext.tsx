'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';
import { supabaseAuth, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: 'DONOR' | 'RECIPIENT' | 'HOSPITAL' | 'BLOOD_BANK' | 'ADMIN';
  district: string;
  city: string;
  is_verified: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isProfileComplete: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<any>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isEmailVerified: false,
  isPhoneVerified: false,
  isProfileComplete: false,
  login: async () => {},
  register: async () => {},
  verifyEmailOtp: async () => {},
  sendPhoneOtp: async () => {},
  verifyPhoneOtp: async () => {},
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);

  const checkLocalVerification = (u: AuthUser | null) => {
    if (!u) {
      setIsEmailVerified(false);
      setIsPhoneVerified(false);
      return;
    }
    const emailV = typeof window !== 'undefined' ? localStorage.getItem(`vc_email_v_${u.id}`) === 'true' : false;
    const phoneV = typeof window !== 'undefined' ? localStorage.getItem(`vc_phone_v_${u.id}`) === 'true' : false;
    
    setIsEmailVerified(u.is_verified || emailV);
    setIsPhoneVerified(phoneV || (u.is_verified && Boolean(u.phone)));
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsEmailVerified(false);
      setIsPhoneVerified(false);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      checkLocalVerification(me);
    } catch (_) {
      removeAuthToken();
      setUser(null);
      setIsEmailVerified(false);
      setIsPhoneVerified(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    // 1. Authenticate with Supabase if configured
    if (isSupabaseConfigured) {
      const { error } = await supabaseAuth.signInWithEmail(email, pass);
      if (error) {
        console.warn('Supabase login notice:', error.message);
      }
    }

    // 2. Synchronize with Vital Connect backend database
    const res = await api.login({ email, password: pass });
    setAuthToken(res.access_token);
    setUser(res.user);
    checkLocalVerification(res.user);
  };

  const register = async (data: any) => {
    // 1. Create account in Supabase Auth if configured
    if (isSupabaseConfigured) {
      const { error } = await supabaseAuth.signUpWithEmail(data.email, data.password, {
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
        district: data.district,
      });
      if (error) {
        console.warn('Supabase signup notice:', error.message);
      }
    }

    // 2. Register in Vital Connect Backend
    const res = await api.register(data);
    setAuthToken(res.access_token);
    setUser(res.user);
    checkLocalVerification(res.user);
    return res;
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    // 1. Verify via Supabase Auth
    const { error } = await supabaseAuth.verifyEmailOtp(email, token);
    if (error) {
      throw new Error(error.message || 'Invalid or expired email verification code');
    }

    // 2. Notify backend
    try {
      await api.verifyEmail();
    } catch (_) {}

    // 3. Update local state
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vc_email_v_${user.id}`, 'true');
      }
      setUser({ ...user, is_verified: true, email_verified: true });
    }
    setIsEmailVerified(true);
  };

  const sendPhoneOtp = async (phone: string) => {
    const { error } = await supabaseAuth.sendPhoneOtp(phone);
    if (error) {
      throw new Error(error.message || 'Unable to send SMS OTP. Please try again.');
    }
    return { success: true };
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { error } = await supabaseAuth.verifyPhoneOtp(phone, token);
    if (error) {
      throw new Error(error.message || 'Invalid or expired phone verification code');
    }

    // Notify backend
    try {
      await api.verifyPhone();
    } catch (_) {}

    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vc_phone_v_${user.id}`, 'true');
      }
      setUser({ ...user, phone_verified: true });
    }
    setIsPhoneVerified(true);
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabaseAuth.sendPasswordResetEmail(email);
    if (error) {
      throw new Error(error.message || 'Unable to send password reset email');
    }
  };

  const resetPassword = async (newPassword: string) => {
    const { error } = await supabaseAuth.updatePassword(newPassword);
    if (error) {
      throw new Error(error.message || 'Unable to reset password');
    }
  };

  const logout = async () => {
    await supabaseAuth.signOut();
    removeAuthToken();
    setUser(null);
    setIsEmailVerified(false);
    setIsPhoneVerified(false);
  };

  const isProfileComplete = Boolean(
    user &&
    user.full_name &&
    user.district &&
    user.city
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isEmailVerified,
        isPhoneVerified,
        isProfileComplete,
        login,
        register,
        verifyEmailOtp,
        sendPhoneOtp,
        verifyPhoneOtp,
        requestPasswordReset,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
