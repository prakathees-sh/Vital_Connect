'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, CheckCircle, AlertCircle, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { user, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { language } = useLanguage();
  const ta = language === 'ta';

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone?.replace('+91', '') || '');
  const [step, setStep] = useState<'INPUT_PHONE' | 'INPUT_OTP' | 'SUCCESS'>('INPUT_PHONE');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = `${countryCode}${phoneNumber.trim()}`;

  useEffect(() => {
    if (step === 'INPUT_OTP' && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(ta ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await sendPhoneOtp(fullPhone);
      setStep('INPUT_OTP');
      setTimer(60);
    } catch (err: any) {
      setError(err.message || (ta ? 'SMS OTP அனுப்ப முடியவில்லை' : 'Unable to send SMS OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextInput = document.getElementById(`phone-otp-${Math.min(digits.length, 5)}`);
      nextInput?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`phone-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError(ta ? 'முழுமையான 6 இலக்க OTP குறியீட்டை உள்ளிடவும்' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyPhoneOtp(fullPhone, token);
      setStep('SUCCESS');
      setTimeout(() => {
        router.push('/donor/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || (ta ? 'தவறான அல்லது காலாவதியான OTP' : 'Invalid or expired phone OTP code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await sendPhoneOtp(fullPhone);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend SMS OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <Phone className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'தொலைபேசி எண் சரிபார்ப்பு' : 'Verify Mobile Phone'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {ta
              ? 'அவசர கால இரத்த தேவை அறிவிப்புகளை நேரடியாக SMS மூலம் பெற உங்கள் எண்ணை சரிபார்க்கவும்'
              : 'Verify your phone to receive critical emergency trauma match alerts via SMS'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input Phone */}
        {step === 'INPUT_PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'மொபைல் எண் *' : 'Mobile Phone Number *'}
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="+91">🇮🇳 +91 (India)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+65">🇸🇬 +65 (Singapore)</option>
                </select>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? (ta ? 'OTP அனுப்பப்படுகிறது...' : 'Sending SMS OTP...') : (ta ? 'SMS OTP அனுப்பவும்' : 'Send SMS OTP')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Input OTP */}
        {step === 'INPUT_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center">
              <span className="text-xs text-slate-500">
                {ta ? 'அனுப்பப்பட்ட எண்: ' : 'Sent to: '}
                <strong className="font-mono text-slate-900 dark:text-white">{fullPhone}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('INPUT_PHONE')}
                className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {ta ? 'மாற்றவும்' : 'Change'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center mb-3">
                {ta ? '6 இலக்க SMS குறியீடு' : '6-Digit SMS Code'}
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`phone-otp-${idx}`}
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

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? (ta ? 'சரிபார்க்கிறது...' : 'Verifying OTP...') : (ta ? 'தொலைபேசியை சரிபார்க்கவும்' : 'Verify Mobile Phone')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>
                {timer > 0 ? (
                  <span>
                    {ta ? 'மீண்டும் அனுப்ப: ' : 'Resend available in: '}
                    <strong className="font-mono text-emerald-600">{timer}s</strong>
                  </span>
                ) : (
                  <span>{ta ? 'SMS வரவில்லையா?' : 'Didn\'t receive SMS?'}</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:hover:no-underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{ta ? 'மீண்டும் அனுப்பு' : 'Resend SMS'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'SUCCESS' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {ta ? 'தொலைபேசி எண் வெற்றிகரமாக சரிபார்க்கப்பட்டது!' : 'Phone Number Verified!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ta ? 'டாஷ்போர்டுக்கு திருப்பி விடப்படுகிறீர்கள்...' : 'Returning to dashboard...'}
            </p>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p>
            {ta
              ? 'உங்கள் மொபைல் எண் பாதுகாப்பானது. அவசர இரத்த தான ஒருங்கிணைப்புக்காக மட்டுமே பயன்படுத்தப்படும்.'
              : 'Your phone number is encrypted and never sold or shared publicly. Used strictly for emergency blood alerts.'}
          </p>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link href="/donor/dashboard" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {ta ? '← டாஷ்போர்டுக்கு திரும்பவும்' : '← Back to Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}
