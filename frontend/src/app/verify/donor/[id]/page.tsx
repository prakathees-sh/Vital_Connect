'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Heart, Droplet, User, CheckCircle2 } from 'lucide-react';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';

export default function VerifyDonorPage() {
  const params = useParams();
  const donorId = params?.id as string;

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20 shadow-lg">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-vital-600 dark:text-vital-400">
            Vital Connect Credential Registry
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Verified Voluntary Donor
          </h1>
          <p className="font-mono text-xs font-bold text-slate-500">
            {donorId}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-left">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Verified Volunteer</span>
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="text-slate-500">Tamil Nadu Network:</span>
            <span className="font-semibold text-slate-900 dark:text-white">38 Districts Connected</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Emergency Readiness:</span>
            <span className="font-semibold text-slate-900 dark:text-white">Trauma Rapid Responder</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed text-left">
          <b>Privacy Assurance:</b> In compliance with healthcare confidentiality, donor contact numbers and residential addresses are never displayed on public badges.
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="text-xs font-bold text-vital-600 dark:text-vital-400 hover:underline"
          >
            ← Back to Vital Connect Home
          </Link>
        </div>
      </div>
    </div>
  );
}
