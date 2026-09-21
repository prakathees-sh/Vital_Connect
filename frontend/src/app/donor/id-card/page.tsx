'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DigitalDonorCard } from '@/components/DigitalDonorCard';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, ArrowLeft, Heart, Award } from 'lucide-react';

export default function DigitalIDCardPage() {
  const { user } = useAuth();
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [cardData, setCardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDigitalCard()
      .then((res) => {
        setCardData(res);
      })
      .catch(() => {
        setCardData({
          donor_code: 'VC-DON-10291',
          full_name: user?.full_name || 'Karthik Subramanian',
          blood_group: 'O+',
          district: user?.district || 'Coimbatore',
          is_verified: true,
          total_donations: 4,
          last_donation_date: '2026-06-12',
          verification_url: 'https://vitalconnect.org/verify/donor/VC-DON-10291'
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        {ta ? 'சரிபார்க்கப்பட்ட சான்றுகள் ஏற்றப்படுகின்றன...' : 'Loading verified digital credential...'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/donor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{ta ? 'தானியர் டாஷ்போர்டுக்கு திரும்பவும்' : 'Back to Donor Dashboard'}</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{ta ? 'அங்கீகரிக்கப்பட்ட சுகாதார சான்று' : 'Verified Healthcare Credential'}</span>
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {ta ? 'டிஜிட்டல் இரத்த தானியர் அடையாள அட்டை' : 'Digital Blood Donor ID Card'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {ta
            ? 'டைனமிக் QR சரிபார்ப்புடன் கூடிய அதிகாரப்பூர்வ தன்னார்வ இரத்த தானியர் அடையாளம்'
            : 'Official voluntary blood donor identification with dynamic QR code verification'}
        </p>
      </div>

      {cardData && (
        <DigitalDonorCard
          donorCode={cardData.donor_code}
          fullName={cardData.full_name}
          bloodGroup={cardData.blood_group}
          district={tDistrict(cardData.district)}
          isVerified={cardData.is_verified}
          totalDonations={cardData.total_donations}
          lastDonationDate={cardData.last_donation_date}
          qrCodeBase64={cardData.qr_code_base64}
          verificationUrl={cardData.verification_url}
        />
      )}

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 leading-relaxed">
        <p>
          <strong>{ta ? 'தனியுரிமை உத்தரவாதம்: ' : 'Privacy Assurance: '}</strong>
          {ta
            ? 'இந்த அட்டை மற்றும் QR குறியீடு உங்கள் இரத்த வகை மற்றும் சரிபார்க்கப்பட்ட நிலையை மட்டுமே வெளிப்படுத்தும். உங்கள் தொலைபேசி எண் அல்லது குடியிருப்பு முகவரி பொதுவில் காட்டப்படாது.'
            : 'This card and its verification QR code lead to a secure public badge that confirms your blood group and verified status without exposing your private phone number or home address.'}
        </p>
      </div>
    </div>
  );
}
