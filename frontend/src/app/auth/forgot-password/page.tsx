'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { language } = useLanguage();
  const ta = language === 'ta';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || (ta ? 'கடவுச்சொல் மீட்டெடுப்பு மின்னஞ்சல் அனுப்ப முடியவில்லை' : 'Unable to send password reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {ta
              ? 'உங்கள் கணக்குடன் இணைக்கப்பட்ட மின்னஞ்சலை உள்ளிடவும். மீட்பு வழிகாட்டுதல்களை அனுப்புவோம்.'
              : 'Enter your registered email address and we will send you password reset instructions.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {ta ? 'மீட்பு மின்னஞ்சல் அனுப்பப்பட்டது' : 'Reset Instructions Sent'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {ta
                ? 'உங்கள் மின்னஞ்சல் இன்பாக்ஸைச் சரிபார்க்கவும். கடவுச்சொல்லை மீட்டமைக்க இணைப்பைப் பின்பற்றவும்.'
                : 'Please check your email inbox and follow the link to reset your secure password.'}
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{ta ? 'உள்நுழைவுக்கு திரும்பவும்' : 'Return to Login'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'பதிவு செய்யப்பட்ட மின்னஞ்சல்' : 'Registered Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? (ta ? 'அனுப்பப்படுகிறது...' : 'Sending Link...') : (ta ? 'மீட்பு இணைப்பை அனுப்பு' : 'Send Reset Link')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{ta ? 'உள்நுழைவுக்கு திரும்பவும்' : 'Back to Login'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
