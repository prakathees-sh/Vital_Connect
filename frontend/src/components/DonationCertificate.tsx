'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Download, Shield, Heart, Calendar, MapPin, Hash, ExternalLink, FileCheck } from 'lucide-react';

interface CertificateProps {
  id: string;
  certificate_code: string;
  donor_name: string;
  blood_group: string;
  donation_date: string;
  facility_name: string;
  district: string;
  verification_url: string;
  qr_code_base64?: string;
  compact?: boolean;
}

export const DonationCertificate: React.FC<CertificateProps> = ({
  id,
  certificate_code,
  donor_name,
  blood_group,
  donation_date,
  facility_name,
  district,
  verification_url,
  qr_code_base64,
  compact = false,
}) => {
  const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/certificates/${id}/pdf`;

  if (compact) {
    return (
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900 dark:text-white">{certificate_code}</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                {blood_group}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {facility_name} • {district} • {donation_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/verify/certificate/${certificate_code}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify</span>
          </Link>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
      {/* Decorative Top Band: Healthcare Green & Blood Red Accent */}
      <div className="h-3 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-rose-600" />

      {/* Certificate Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Brand & Verification Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
              <Heart className="w-5 h-5 fill-current text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                VITAL CONNECT
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Intelligent Emergency Blood Coordination Platform • Tamil Nadu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Verified Authentic</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 border-t border-b border-dashed border-slate-200 dark:border-slate-700 py-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-semibold">
            Certificate of Voluntary Recognition
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Blood Donation Recognition
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Presented in honor of selflessness and life-saving altruism
          </p>
        </div>

        {/* Donor Name + Blood Group */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {donor_name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            In sincere appreciation of your voluntary blood donation that directly contributed to saving a life in emergency medical need.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400">Blood Group</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{blood_group}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Donation Date</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{donation_date}</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <FileCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Facility</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{facility_name}</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">District</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{district}</p>
            </div>
          </div>
        </div>

        {/* Certificate Code + Actions + QR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Certificate ID</p>
                <p className="font-mono text-sm font-black text-slate-900 dark:text-white">{certificate_code}</p>
              </div>
            </div>
            <div>
              <a
                href={verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Verify online authenticity</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/verify/certificate/${certificate_code}`}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Online</span>
              </Link>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* QR Code */}
          {qr_code_base64 && (
            <div className="flex-shrink-0 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white text-center">
              <img
                src={qr_code_base64}
                alt="Certificate Verification QR Code"
                className="w-24 h-24 object-contain mx-auto"
              />
              <p className="text-[9px] text-slate-500 mt-1 font-semibold">Scan to Verify</p>
            </div>
          )}
        </div>

        {/* Medical Disclaimer Notice */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong>Important Medical Notice:</strong> This document recognizes voluntary blood donation coordination and does not constitute a clinical medical clearance or laboratory test record. Blood donation eligibility remains under the authority of licensed blood banks and qualified medical professionals.
        </div>
      </div>

      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-600" />
    </div>
  );
};
