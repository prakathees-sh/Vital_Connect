'use client';

import React from 'react';
import Link from 'next/link';
import { Droplet, Phone, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors z-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-vital-600 flex items-center justify-center text-white">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t.footer.brandDesc}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-vital-600 dark:text-vital-400">
              <Phone className="w-3.5 h-3.5" />
              <span>{t.footer.helplineText}</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.footer.featuresTitle}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/requests/new" className="hover:text-vital-600">{t.footer.createRequest}</Link></li>
              <li><Link href="/inventory" className="hover:text-vital-600">{t.footer.liveAvailability}</Link></li>
              <li><Link href="/chain-rescue" className="hover:text-vital-600">{t.footer.chainRescueEngine}</Link></li>
              <li><Link href="/map" className="hover:text-vital-600">{t.footer.interactiveMap}</Link></li>
              <li><Link href="/forecast" className="hover:text-vital-600">{t.footer.mlForecaster}</Link></li>
            </ul>
          </div>

          {/* Col 3: Donor Verification */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.footer.trustTitle}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/donor/onboarding" className="hover:text-vital-600">{t.footer.prelimScreening}</Link></li>
              <li><Link href="/donor/id-card" className="hover:text-vital-600">{t.footer.digitalDonorId}</Link></li>
              <li><Link href="/verify/certificate/VC-CERT-88492" className="hover:text-vital-600">{t.footer.verifyCert}</Link></li>
              <li><Link href="/admin" className="hover:text-vital-600">{t.footer.adminAudit}</Link></li>
            </ul>
          </div>

          {/* Col 4: Medical Safety Notice */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.footer.safetyTitle}</span>
            </h4>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
              <p className="text-slate-500 dark:text-slate-400">
                {t.footer.safetyDesc}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
            <span>{t.footer.privacyFirst}</span>
            <span>•</span>
            <span>{t.footer.nonProfit}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

