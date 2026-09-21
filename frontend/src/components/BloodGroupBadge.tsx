'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface BloodGroupBadgeProps {
  group: string;
  size?: 'sm' | 'md' | 'lg';
  status?: string;
  interactive?: boolean;
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  group,
  size = 'md',
  status,
  interactive = false
}) => {
  const { t } = useLanguage();
  const isNegative = group.includes('-');

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-11 h-11 text-sm font-black',
    lg: 'w-14 h-14 text-base font-black',
  }[size];

  const statusBorder = status === 'Critical'
    ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 animate-pulse'
    : status === 'Low'
    ? 'ring-2 ring-amber-500'
    : '';

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={`rounded-xl flex items-center justify-center transition-all ${sizeClasses} ${statusBorder} ${
          isNegative
            ? 'bg-gradient-to-br from-purple-600 to-vital-700 text-white shadow-md shadow-purple-500/20'
            : 'bg-gradient-to-br from-vital-500 to-vital-700 text-white shadow-md shadow-vital-500/25'
        } ${interactive ? 'hover:scale-105 cursor-pointer' : ''}`}
      >
        <span>{group}</span>
      </div>
      {isNegative && (
        <span className="absolute -top-1.5 -right-1 px-1 py-0.2 bg-purple-900 text-purple-200 border border-purple-400/30 text-[9px] font-bold rounded-full uppercase tracking-tighter">
          {t.common.rare}
        </span>
      )}
    </div>
  );
};

