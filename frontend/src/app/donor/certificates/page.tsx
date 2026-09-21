'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, ShieldCheck, FileCheck, Download, ExternalLink, Calendar, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { DonationCertificate } from '@/components/DonationCertificate';

export default function DonorCertificatesPage() {
  const { user } = useAuth();
  const { language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCertificates()
      .then((res) => {
        setCertificates(res || []);
      })
      .catch((err) => {
        console.error('Error fetching certificates:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/donor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{ta ? 'டாஷ்போர்டுக்கு திரும்பவும்' : 'Back to Donor Dashboard'}</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-emerald-600" />
            <span>{ta ? 'அதிகாரப்பூர்வ இரத்த தான சான்றிதழ்கள்' : 'Official Blood Donation Certificates'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? 'சரிபார்க்கப்பட்ட மற்றும் நிறைவுசெய்யப்பட்ட இரத்த தானங்களுக்கான டிஜிட்டல் அங்கீகாரப் பதிவுகள்'
              : 'Verifiable credentials issued for successfully completed and verified voluntary blood donations'}
          </p>
        </div>

        <Link
          href="/donor/id-card"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{ta ? 'டிஜிட்டல் அடையாள அட்டை' : 'Digital Donor ID'}</span>
        </Link>
      </div>

      {/* Certificates Feed */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">{ta ? 'சான்றிதழ்கள் ஏற்றப்படுகின்றன...' : 'Loading verified certificates...'}</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {ta ? 'இன்னும் சான்றிதழ்கள் எதுவும் இல்லை' : 'No Donation Certificates Yet'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {ta
                ? 'ஒரு அவசர இரத்த தானம் மருத்துவமனையால் வெற்றிகரமாக சரிபார்க்கப்பட்டு நிறைவடைந்த பிறகு சான்றிதழ் தானாக உருவாக்கப்படும்.'
                : 'Certificates are generated automatically after a voluntary blood donation is officially verified and confirmed by the participating facility.'}
            </p>
          </div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{ta ? 'அவசர தேவைகளை பார்க்கவும்' : 'View Emergency Requests'}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {certificates.map((cert) => (
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
              qr_code_base64={cert.qr_code_base64}
            />
          ))}
        </div>
      )}
    </div>
  );
}
