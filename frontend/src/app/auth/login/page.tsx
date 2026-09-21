'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Heart, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { language } = useLanguage();
  const ta = language === 'ta';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/donor/dashboard');
    } catch (err: any) {
      setError(err.message || (ta ? 'உள்நுழைவு தோல்வியடைந்தது. நற்சான்றிதழ்களைச் சரிபார்க்கவும்.' : 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'Vital Connect-ல் உள்நுழையவும்' : 'Sign In to Vital Connect'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {ta
              ? 'அவசர கால ஒருங்கிணைப்பு மற்றும் இரத்த தான டாஷ்போர்டை அணுகவும்'
              : 'Access emergency blood coordination, verified donor portal, and hospital stock'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {ta ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {ta ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {ta ? 'மறந்துவிட்டதா?' : 'Forgot?'}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{loading ? (ta ? 'சரிபார்க்கிறது...' : 'Authenticating...') : (ta ? 'உள்நுழைக' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            {ta ? 'விரைவு டெமோ சான்றுகள்' : 'Quick Demo Credentials'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('karthik.s@example.com', 'DonorPass123!')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-left transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>O+ Donor</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@vitalconnect.org', 'AdminPassword123!')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-left transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('hospital1@chennaimed.org', 'HospitalPass123!')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-left transition-colors flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Hospital</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('bloodbank1@chennaibb.org', 'BloodBankPass123!')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-left transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Blood Bank</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          {ta ? 'கணக்கு இல்லையா?' : 'Don\'t have an account?'}{' '}
          <Link href="/auth/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {ta ? 'இப்போதே பதிவு செய்க' : 'Register now'}
          </Link>
        </div>
      </div>
    </div>
  );
}
