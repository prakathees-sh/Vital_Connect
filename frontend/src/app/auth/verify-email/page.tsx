'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, verifyEmailOtp } = useAuth();
  const { language } = useLanguage();
  const ta = language === 'ta';

  const defaultEmail = searchParams.get('email') || user?.email || '';
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextInput = document.getElementById(`email-otp-${Math.min(digits.length, 5)}`);
      nextInput?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      const nextInput = document.getElementById(`email-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError(ta ? '6 இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்' : 'Please enter the complete 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyEmailOtp(email, token);
      setSuccess(true);
      setTimeout(() => {
        if (user?.role === 'DONOR') {
          router.push('/donor/onboarding');
        } else {
          router.push('/donor/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || (ta ? 'தவறான அல்லது காலாவதியான சரிபார்ப்புக் குறியீடு' : 'Invalid or expired verification code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      // Simulate/trigger resend
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'மின்னஞ்சல் சரிபார்ப்பு' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {ta
              ? 'உங்கள் மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்ட 6 இலக்க பாதுகாப்பு குறியீட்டை உள்ளிடவும்'
              : 'Enter the 6-digit security verification code sent to your email address'}
          </p>
          {email && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full inline-block">
              {email}
            </p>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {ta ? 'மின்னஞ்சல் வெற்றிகரமாக சரிபார்க்கப்பட்டது!' : 'Email Verified Successfully!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ta ? 'உங்கள் கணக்கு செயல்படுத்தப்படுகிறது...' : 'Redirecting to onboarding...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center mb-3">
                {ta ? '6 இலக்க பாதுகாப்பு குறியீடு' : '6-Digit Verification Code'}
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`email-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e.key)}
                    className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? (ta ? 'சரிபார்க்கிறது...' : 'Verifying Code...') : (ta ? 'மின்னஞ்சலை சரிபார்க்கவும்' : 'Verify Email')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend & Timer */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>
                {timer > 0 ? (
                  <span>
                    {ta ? 'மீண்டும் அனுப்ப காத்திருக்கவும்: ' : 'Resend available in: '}
                    <strong className="font-mono text-emerald-600">{timer}s</strong>
                  </span>
                ) : (
                  <span>{ta ? 'குறியீடு கிடைக்கவில்லையா?' : 'Didn\'t receive the code?'}</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:hover:no-underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{ta ? 'குறியீட்டை மீண்டும் அனுப்பு' : 'Resend OTP'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Assurance */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p>
            {ta
              ? 'Vital Connect உங்கள் தனியுரிமையை பாதுகாக்கிறது. சரிபார்ப்புக் குறியீடுகள் ஒருபோதும் பொதுவில் பகிரப்படாது.'
              : 'Vital Connect protects your security. OTP codes expire within 10 minutes and should never be shared.'}
          </p>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {ta ? '← உள்நுழைவுக்கு திரும்பவும்' : '← Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
