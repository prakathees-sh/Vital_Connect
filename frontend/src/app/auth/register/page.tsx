'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, User, Mail, Phone, Lock, Building, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { language } = useLanguage();
  const ta = language === 'ta';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT' | 'HOSPITAL' | 'BLOOD_BANK'>('DONOR');
  const [district, setDistrict] = useState('Coimbatore');
  const [city, setCity] = useState('Coimbatore');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role,
        district,
        city,
        address,
      });

      // Flow: Move immediately to Email Verification OTP
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || (ta ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'Vital Connect-ல் சேரவும்' : 'Create Vital Connect Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ta
              ? 'தமிழ்நாடு அவசர இரத்த தான ஒருங்கிணைப்பு வலைப்பின்னலில் இணையுங்கள்'
              : 'Join the Tamil Nadu emergency coordination and voluntary life-saving network'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            {ta ? 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்' : 'Select Your Healthcare Role'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { r: 'DONOR', label_en: 'Donor', label_ta: 'தானியர்', icon: Heart },
              { r: 'RECIPIENT', label_en: 'Recipient', label_ta: 'நோயாளி', icon: User },
              { r: 'HOSPITAL', label_en: 'Hospital', label_ta: 'மருத்துவமனை', icon: Building },
              { r: 'BLOOD_BANK', label_en: 'Blood Bank', label_ta: 'இரத்த வங்கி', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = role === tab.r;
              return (
                <button
                  key={tab.r}
                  type="button"
                  onClick={() => setRole(tab.r as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    isSel
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{ta ? tab.label_ta : tab.label_en}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {ta ? 'முழு பெயர் / நிறுவன பெயர் *' : 'Full Name / Organization Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={ta ? 'எ.கா. மருத்துவர் ராஜேஷ் குமார்' : 'e.g. Dr. Rajesh Kumar'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'மொபைல் எண் *' : 'Mobile Phone *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {ta ? 'கடவுச்சொல் *' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={ta ? 'குறைந்தது 6 எழுத்துகள்' : 'At least 6 characters'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'மாவட்டம் (தமிழ்நாடு) *' : 'District (Tamil Nadu) *'}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d.name_en} value={d.name_en}>
                    {ta ? d.name_ta : `${d.name_en} (${d.name_ta})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'நகரம் / ஊர் *' : 'City / Town *'}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Coimbatore"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {ta ? 'பகுதி முகவரி' : 'Locality / Area'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. RS Puram, West Zone"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{loading ? (ta ? 'கணக்கு உருவாக்கப்படுகிறது...' : 'Creating Account...') : (ta ? 'பதிவை முடிக்கவும் → OTP சரிபார்ப்பு' : 'Complete Registration → Verify OTP')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          {ta ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
          <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            {ta ? 'உள்நுழைக' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
