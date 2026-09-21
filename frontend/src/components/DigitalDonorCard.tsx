'use client';

import React from 'react';
import { Droplet, ShieldCheck, QrCode, Printer, Share2, Award, Calendar } from 'lucide-react';
import { BloodGroupBadge } from './BloodGroupBadge';
import { useLanguage } from '@/context/LanguageContext';

interface DigitalDonorCardProps {
  donorCode: string;
  fullName: string;
  bloodGroup: string;
  district: string;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate?: string | null;
  qrCodeBase64?: string;
  verificationUrl?: string;
}

export const DigitalDonorCard: React.FC<DigitalDonorCardProps> = ({
  donorCode,
  fullName,
  bloodGroup,
  district,
  isVerified,
  totalDonations,
  lastDonationDate,
  qrCodeBase64,
  verificationUrl = 'https://vitalconnect.org/verify'
}) => {
  const { t, tDistrict } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Visual Identity Card Container */}
      <div className="relative rounded-3xl overflow-hidden p-6 text-white shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-900 via-slate-950 to-vital-950 border border-vital-500/30 print:shadow-none print:border-black">
        {/* Glow and watermark background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-vital-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-vital-600 flex items-center justify-center shadow-lg shadow-vital-600/40">
              <Droplet className="w-5 h-5 fill-current text-white animate-heartbeat" />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white uppercase">
                {t.appName}
              </span>
              <p className="text-[10px] text-vital-300 font-medium tracking-tight">
                {t.donorCard.credential}
              </p>
            </div>
          </div>
          {isVerified && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.common.verified}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="my-6 flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              {t.donorCard.donorId}
            </p>
            <p className="text-lg font-black font-mono tracking-wider text-vital-300">
              {donorCode}
            </p>
            <h2 className="text-xl font-black text-white pt-1">
              {fullName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1 pt-0.5">
              <span>{t.common.district}:</span>
              <span className="font-semibold text-white">{tDistrict(district)}</span>
            </p>
          </div>

          <div className="text-center">
            <BloodGroupBadge group={bloodGroup} size="lg" />
            <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">{t.donorCard.bloodGroup}</p>
          </div>
        </div>

        {/* Stats & QR Code */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{t.donorPortal.totalDonations}: <b>{totalDonations} {t.common.completed}</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.donorCard.lastDonation}: {lastDonationDate ? new Date(lastDonationDate).toLocaleDateString() : t.donorCard.readyToDonate}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-2 rounded-xl shadow-lg shadow-black/40 flex flex-col items-center">
            {qrCodeBase64 ? (
              <img
                src={qrCodeBase64}
                alt="Verification QR"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <span className="text-[8px] text-slate-800 font-bold uppercase mt-1">{t.donorCard.scanToVerify}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>{t.donorCard.printCard}</span>
        </button>
        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vital-600 hover:bg-vital-700 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.common.viewDetails}</span>
        </a>
      </div>
    </div>
  );
};

