'use client';

import React from 'react';
import { Shield, Users, Building2, Radio, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChainRescueRadarProps {
  currentLevel: number;
  banksCount: number;
  donorsCount: number;
  radiusKm: number;
  requestCode?: string;
  onEscalate?: () => void;
  isEscalating?: boolean;
}

export const ChainRescueRadar: React.FC<ChainRescueRadarProps> = ({
  currentLevel,
  banksCount,
  donorsCount,
  radiusKm,
  requestCode = "VC-REQ-10291",
  onEscalate,
  isEscalating = false
}) => {
  const { t } = useLanguage();

  const levels = [
    { lvl: 1, title: t.chainRescue.level1Title, radius: t.chainRescue.level1Radius, ringSize: 20 },
    { lvl: 2, title: t.chainRescue.level2Title, radius: t.chainRescue.level2Radius, ringSize: 40 },
    { lvl: 3, title: t.chainRescue.level3Title, radius: t.chainRescue.level3Radius, ringSize: 60 },
    { lvl: 4, title: t.chainRescue.level4Title, radius: t.chainRescue.level4Radius, ringSize: 80 },
    { lvl: 5, title: t.chainRescue.level5Title, radius: t.chainRescue.level5Radius, ringSize: 98 },
  ];


  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl relative overflow-hidden">
      {/* Background glowing gradient */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-vital-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        {/* Left: Interactive Animated Radar Visualization */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center flex-shrink-0">
          {/* Radar Circles */}
          {levels.map((l) => {
            const isActive = currentLevel >= l.lvl;
            const isCurrent = currentLevel === l.lvl;
            return (
              <div
                key={l.lvl}
                style={{ width: `${l.ringSize}%`, height: `${l.ringSize}%` }}
                className={`absolute rounded-full border transition-all duration-700 ${
                  isCurrent
                    ? 'border-vital-500 shadow-lg shadow-vital-500/30 ring-2 ring-vital-400/40'
                    : isActive
                    ? 'border-emerald-500/60 dark:border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-300/40 dark:border-slate-800 border-dashed'
                }`}
              >
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-vital-500/10 animate-ping opacity-30" />
                )}
              </div>
            );
          })}

          {/* Radar Sweep Line */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="w-full h-full animate-radar-sweep origin-center bg-gradient-to-tr from-transparent via-vital-500/15 to-vital-500/30" />
          </div>

          {/* Center Point: Incident Origin */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-vital-600 flex items-center justify-center text-white shadow-lg shadow-vital-600/50 animate-heartbeat">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>

          {/* Radar Blips representing candidate matches */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400 animate-pulse" title={t.chainRescue.matchedBanks} />
          <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-vital-500 shadow-sm shadow-vital-400 animate-ping" title={t.chainRescue.compatibleDonors} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-vital-400" />
          <div className="absolute bottom-1/4 left-1/4 w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>

        {/* Right: Level Indicators and Candidate Stats */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-vital-600 dark:text-vital-400 uppercase tracking-wider">
                {t.chainRescue.radarTitle}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t.chainRescue.radarActive} ({radiusKm} {t.common.km})
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-vital-100 dark:bg-vital-950 text-vital-700 dark:text-vital-300 font-bold text-xs">
              {t.chainRescue.levelOf} {currentLevel} {t.chainRescue.ofTotal}
            </span>
          </div>

          {/* Level Progression Steps */}
          <div className="space-y-2">
            {levels.map((l) => {
              const isPast = currentLevel > l.lvl;
              const isCurrent = currentLevel === l.lvl;
              return (
                <div
                  key={l.lvl}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'border-vital-500/60 bg-vital-50 dark:bg-vital-950/50 text-vital-900 dark:text-vital-100 font-bold'
                      : isPast
                      ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Zap className="w-4 h-4 text-vital-600 dark:text-vital-400 animate-pulse flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-700 flex items-center justify-center text-[9px]">
                        {l.lvl}
                      </div>
                    )}
                    <span>{l.title}</span>
                  </div>
                  <span className="font-mono text-[11px] opacity-75">{l.radius}</span>
                </div>
              );
            })}
          </div>

          {/* Candidate Metrics Card */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.chainRescue.matchedBanks}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {banksCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Users className="w-3.5 h-3.5 text-vital-500" />
                <span>{t.chainRescue.compatibleDonors}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {donorsCount}
              </p>
            </div>
          </div>

          {/* Escalate Trigger Button */}
          {onEscalate && currentLevel < 5 && (
            <button
              onClick={onEscalate}
              disabled={isEscalating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-vital-600 to-vital-700 hover:from-vital-700 hover:to-vital-800 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-vital-600/30 transition-all hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4" />
              <span>{isEscalating ? t.chainRescue.escalating : t.chainRescue.triggerEscalation}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
