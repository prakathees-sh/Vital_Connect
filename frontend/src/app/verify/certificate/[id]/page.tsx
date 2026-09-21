'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Building2,
  Droplet,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VerifyCertificatePage() {
  const params = useParams();
  const certCode = params?.id as string;

  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certCode) return;

    api.verifyCertificatePublic(certCode)
      .then((res) => {
        setVerifyResult(res);
      })
      .catch(() => {
        setVerifyResult({
          is_valid: false,
          message: 'Certificate verification failed or invalid record.'
        });
      })
      .finally(() => setLoading(false));
  }, [certCode]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-slate-500">
        Verifying digital credential against Vital Connect database...
      </div>
    );
  }

  const isValid = verifyResult?.is_valid;

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 text-center">
        {/* Verification Icon Header */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${
          isValid
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20'
            : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 ring-4 ring-red-500/20'
        }`}>
          {isValid ? (
            <ShieldCheck className="w-9 h-9" />
          ) : (
            <XCircle className="w-9 h-9" />
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-vital-600 dark:text-vital-400">
            Vital Connect Verification Service
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isValid ? 'Official Certificate Verified' : 'Certificate Not Found'}
          </h1>
          <p className="font-mono text-xs font-bold text-slate-500">
            ID: {certCode}
          </p>
        </div>

        {isValid ? (
          <div className="space-y-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Verified Participant:</span>
                <span className="font-black text-slate-900 dark:text-white">{verifyResult.verified_participant}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-black text-red-600">{verifyResult.blood_group}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Donation Date:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{verifyResult.donation_date}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Healthcare Facility:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{verifyResult.facility_name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">District:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{verifyResult.district}</span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              <p>
                <b>Privacy Safe Badge:</b> Personal contact details and medical history are protected under healthcare privacy standards and are never exposed publicly.
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href={`http://localhost:8000/api/v1/certificates/${certCode}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-vital-600 hover:bg-vital-700 text-white font-bold text-xs shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
            {verifyResult?.message || "No verified record exists for this credential."}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
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
