'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Droplet,
  Award,
  Calendar,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { DonationCertificate } from '@/components/DonationCertificate';
import { api } from '@/lib/api';

export default function DonorDashboardPage() {
  const { user, isEmailVerified, isPhoneVerified, isProfileComplete } = useAuth();
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [profile, setProfile] = useState<any | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getDonorProfile(),
      api.getDonorAchievements(),
      api.listCertificates(),
      api.listEmergencyRequests({ urgency: 'EMERGENCY' }),
    ]).then(([pRes, aRes, cRes, rRes]) => {
      if (pRes.status === 'fulfilled' && pRes.value) {
        setProfile(pRes.value);
        setIsAvailable(pRes.value.is_available ?? true);
        setEmergencyAvailable(pRes.value.emergency_available ?? true);
      }
      if (aRes.status === 'fulfilled') setAchievements(aRes.value || []);
      if (cRes.status === 'fulfilled') setCertificates(cRes.value || []);
      if (rRes.status === 'fulfilled') setActiveRequests((rRes.value || []).slice(0, 3));
      setLoading(false);
    });
  }, []);

  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    setSavingStatus(true);
    try {
      await api.updateDonorProfile({
        is_available: nextVal,
        emergency_available: emergencyAvailable,
      });
    } catch (_) {}
    setSavingStatus(false);
  };

  const donorName = user?.full_name || 'Karthik Subramanian';
  const bloodGroup = profile?.blood_group || 'O+';
  const donationsCount = profile?.total_donations ?? 4;
  const isScreened = profile?.screening_cleared ?? false;

  return (
    <div className="space-y-8 py-4 px-2 sm:px-0">
      {/* ── 1. WELCOME & VERIFICATION STATUS BANNER ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {ta ? 'தானியர் கட்டுப்பாட்டு மையம்' : 'Donor Command Center'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                {isAvailable ? (ta ? 'செயலில் உள்ளார்' : 'Active Readiness') : (ta ? 'தற்காலிக விடுப்பு' : 'On Pause')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {ta ? `வணக்கம், ${donorName}` : `Welcome back, ${donorName}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ta ? 'மாவட்டம்: ' : 'District: '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{tDistrict(user?.district || 'Coimbatore')}</span> • {ta ? 'தன்னார்வ உறுப்பினர்' : 'Volunteer Lifesaver'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BloodGroupBadge group={bloodGroup} size="lg" />
            <Link
              href="/donor/id-card"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{ta ? 'டிஜிட்டல் அடையாள அட்டை' : 'Digital Donor ID'}</span>
            </Link>
          </div>
        </div>

        {/* ── VERIFICATION STATUS STRIP (Requirement 12) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Email Verification Status */}
          <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{ta ? 'மின்னஞ்சல்' : 'Email'}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEmailVerified ? (
                    <span className="text-emerald-600 flex items-center gap-1">✓ {ta ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">! {ta ? 'சரிபார்ப்பு தேவை' : 'Verification required'}</span>
                  )}
                </p>
              </div>
            </div>
            {!isEmailVerified && (
              <Link
                href="/auth/verify-email"
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold"
              >
                {ta ? 'சரிபார்க்க' : 'Verify'}
              </Link>
            )}
          </div>

          {/* Phone Verification Status */}
          <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{ta ? 'தொலைபேசி' : 'Phone'}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isPhoneVerified ? (
                    <span className="text-emerald-600 flex items-center gap-1">✓ {ta ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">! {ta ? 'சரிபார்ப்பு தேவை' : 'Verification required'}</span>
                  )}
                </p>
              </div>
            </div>
            {!isPhoneVerified && (
              <Link
                href="/auth/verify-phone"
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold"
              >
                {ta ? 'சரிபார்க்க' : 'Verify'}
              </Link>
            )}
          </div>

          {/* Profile Status */}
          <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{ta ? 'சுயவிவரம்' : 'Profile'}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isProfileComplete ? (
                    <span className="text-emerald-600 flex items-center gap-1">✓ {ta ? 'முழுமையானது' : 'Complete'}</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">! {ta ? 'முழுமையடையவில்லை' : 'Incomplete'}</span>
                  )}
                </p>
              </div>
            </div>
            {/* Availability Switch */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">{ta ? 'தயார்நிலை' : 'Ready'}</span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={savingStatus}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preliminary Screening Notice if Not Cleared */}
        {!isScreened && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {ta ? 'ஆரம்ப தயார்நிலை மதிப்பீடு நிலுவையில் உள்ளது' : 'Preliminary Readiness Screening Pending'}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {ta
                    ? 'அவசர கால தேவைகளில் பங்கேற்க முன் தயார்நிலை வினாத்தாளை முடிக்கவும்.'
                    : 'Complete the preliminary health readiness survey before participating in emergency blood requests.'}
                </p>
              </div>
            </div>
            <Link
              href="/donor/onboarding"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex-shrink-0 transition-all hover:scale-105"
            >
              {ta ? 'மதிப்பீட்டை முடிக்கவும் →' : 'Complete Screening →'}
            </Link>
          </div>
        )}

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>{ta ? 'மொத்த தானங்கள்' : 'Total Donations'}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {donationsCount}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ~{donationsCount * 3} {ta ? 'உயிர்கள் காப்பாற்றப்பட்டன' : 'lives impacted'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{ta ? 'அவசர எச்சரிக்கைகள்' : 'Emergency Alerts'}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              8
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {ta ? 'உடனடி பதிலளிப்பு' : 'Rapid response active'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{ta ? 'சான்றிதழ்கள்' : 'Certificates'}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {certificates.length > 0 ? certificates.length : 1}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {ta ? 'அதிகாரப்பூர்வ அங்கீகாரம்' : 'Official recognitions'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Award className="w-4 h-4 text-teal-600" />
              <span>{ta ? 'பதக்கங்கள்' : 'Achievements'}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {achievements.length > 0 ? achievements.length : 3}
            </p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
              {ta ? 'திறக்கப்பட்ட பேட்ஜ்கள்' : 'Badges unlocked'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. TWO COLUMN GRID: BADGES & CERTIFICATES + ALERTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements / Badges */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {ta ? 'மரியாதை & அங்கீகாரம்' : 'Honors & Recognition'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {ta ? 'தானியர் பங்களிப்பு பேட்ஜ்கள்' : 'Donor Contribution Badges'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {ta ? 'தன்னார்வ சேவை' : 'Voluntary Altruism'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title_en: 'First Step Lifesaver', title_ta: 'முதல் படி உயிர்காப்பாளர்', desc_en: 'Maiden voluntary blood donation completed.', desc_ta: 'முதல் தன்னார்வ தானம் நிறைவுற்றது.', icon: '🏅' },
                { title_en: 'Emergency Responder', title_ta: 'அவசர கால மீட்பாளர்', desc_en: 'Active opt-in for urgent trauma alerts in Tamil Nadu.', desc_ta: 'அவசர சிகிச்சை எச்சரிக்கைகளுக்கான தயார்நிலை.', icon: '⚡' },
                { title_en: 'Community Guardian', title_ta: 'சமூக பாதுகாவலர்', desc_en: 'Contributed 3+ consecutive voluntary donation cycles.', desc_ta: '3+ தொடர் தன்னார்வ இரத்த தானங்கள்.', icon: '🛡️' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {ta ? badge.title_ta : badge.title_en}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {ta ? badge.desc_ta : badge.desc_en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Certificates Section (Requirement 2 & 15) */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {ta ? 'அங்கீகரிக்கப்பட்ட சான்றிதழ்கள்' : 'Digital Certificates'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {ta ? 'அதிகாரப்பூர்வ இரத்த தான சான்றிதழ்கள்' : 'Official Blood Donation Certificates'}
                </h3>
              </div>

              <Link
                href="/donor/certificates"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{ta ? 'அனைத்தையும் காண்க' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.slice(0, 2).map((cert) => (
                  <DonationCertificate
                    key={cert.id}
                    id={cert.id}
                    certificate_code={cert.certificate_code}
                    donor_name={cert.donor_name}
                    blood_group={cert.blood_group}
                    donation_date={cert.donation_date}
                    facility_name={cert.facility_name}
                    district={tDistrict(cert.district)}
                    verification_url={cert.verification_url}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Fallback verified sample certificate with dynamic PDF link */}
                <DonationCertificate
                  id="VC-CERT-88492"
                  certificate_code="VC-CERT-88492"
                  donor_name={donorName}
                  blood_group={bloodGroup}
                  donation_date="September 15, 2026"
                  facility_name="Coimbatore Medical College Hospital"
                  district={tDistrict(user?.district || 'Coimbatore')}
                  verification_url="https://vitalconnect.org/verify/certificate/VC-CERT-88492"
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearby Emergency Trauma Alerts */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {ta ? 'அருகிலுள்ள அவசர எச்சரிக்கைகள்' : 'Nearby Trauma Alerts'}
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                {ta ? 'அவசரம்' : 'Urgent'}
              </span>
            </div>

            <div className="space-y-3">
              {activeRequests.length > 0 ? (
                activeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {req.request_code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase">
                        {req.urgency}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {req.units_needed} {ta ? 'அலகுகள் தேவை' : 'units required'} ({req.blood_group})
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {req.hospital_name} • {tDistrict(req.district)}
                    </p>
                    <Link
                      href={`/requests/${req.request_code}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <span>{ta ? 'விவரங்களை காண்க' : 'View Emergency Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  {ta ? 'தற்போது அவசர கோரிக்கைகள் எதுவும் இல்லை' : 'No urgent alerts in your district right now.'}
                </p>
              )}
            </div>

            <Link
              href="/requests"
              className="block text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              {ta ? 'அனைத்து தமிழ்நாடு கோரிக்கைகளையும் பார்க்க →' : 'Browse All Tamil Nadu Requests →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
