'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ForecastPage() {
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [district, setDistrict] = useState('All Districts');
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const res = await api.get7DayForecast(district !== 'All Districts' ? district : undefined);
      setForecastData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [district]);

  return (
    <div className="space-y-8 py-6 px-2 sm:px-0 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {ta ? 'ML இரத்த தேவை & பற்றாக்குறை கணிப்பு' : 'ML Blood Demand & Shortage Forecaster'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? 'தமிழ்நாடு முழுவதும் 180 நாள் பருவகால தேவைகளை பகுப்பாய்வு செய்து முன்னறிவிக்கும் இயந்திர கற்றல் மாதிரி'
              : 'Machine learning demand projection trained on multi-seasonal emergency patterns across Tamil Nadu'}
          </p>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none shadow-sm"
          >
            <option value="All Districts">{ta ? 'தமிழ்நாடு முழுவதும் (மாநில மாதிரி)' : 'All Tamil Nadu (State Model)'}</option>
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d.name_en} value={d.name_en}>
                {ta ? d.name_ta : `${d.name_en} (${d.name_ta})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Mandatory ML Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p>
          <strong>{ta ? 'முக்கிய அறிவிப்பு: ' : 'MANDATORY NOTICE: '}</strong>
          {forecastData?.disclaimer || (ta ? "இயந்திர கற்றல் முன்னறிவிப்பு ஒரு திட்டமிடல் உதவி மட்டுமே — மருத்துவ முடிவு அல்ல." : "ML prediction / estimate — not a medical decision.")}
          {" "}{ta ? 'இரத்த வங்கிகளின் தளவாட திட்டமிடலுக்காக மட்டுமே பயன்படுத்தப்பட வேண்டும்.' : 'Used exclusively for logistical advance drive planning.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          {ta ? 'கணிப்பு மாதிரி இயக்கப்படுகிறது...' : 'Running Random Forest inference model...'}
        </div>
      ) : forecastData ? (
        <>
          {/* 7-Day Forecast Overview Banner */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                {ta ? 'இயந்திர கற்றல் மாதிரி முன்னறிவிப்பு' : 'Machine Learning Inference'}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {ta ? 'அடுத்த 7 நாட்களுக்கான எதிர்பார்க்கப்படும் தேவை' : 'PREDICTED DEMAND — NEXT 7 DAYS'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {ta ? 'இலக்கு பகுதி: ' : 'Target Zone: '} <b>{tDistrict(forecastData.district)}</b> • {ta ? 'கால அளவு: ' : 'Timeline: '} {forecastData.forecast_period}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
                O+, B+ → {ta ? 'அதிக தேவை' : 'High Demand'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-900">
                AB-, O- → {ta ? 'கவனம் தேவை' : 'Attention Required'}
              </span>
            </div>
          </div>

          {/* Forecast Cards for 8 Blood Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastData.group_forecasts.map((gf: any) => {
              const isHigh = gf.urgency_color === 'red';
              const isRare = gf.urgency_color === 'purple';
              return (
                <div
                  key={gf.blood_group}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md bg-white dark:bg-slate-900 space-y-3 ${
                    isHigh
                      ? 'border-rose-300 dark:border-rose-900/60 shadow-sm'
                      : isRare
                      ? 'border-purple-300 dark:border-purple-900/60 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <BloodGroupBadge group={gf.blood_group} size="md" />
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : isRare
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {gf.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {gf.total_7d_units} <span className="text-xs font-normal text-slate-400">{ta ? 'அலகுகள் எதிர்பார்க்கப்படுகிறது' : 'units expected'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {ta ? 'சராசரி: ' : 'Avg: '} ~{gf.avg_daily_units} {ta ? 'அலகுகள் / நாள்' : 'units / day'}
                    </p>
                  </div>

                  {/* Daily Mini Sparkline */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end h-10">
                    {gf.daily_breakdown.map((d: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div
                          style={{ height: `${Math.min(100, Math.max(15, d.units * 3))}%` }}
                          className={`w-2.5 rounded-t-sm ${
                            isHigh ? 'bg-rose-500' : isRare ? 'bg-purple-500' : 'bg-emerald-500'
                          }`}
                          title={`${d.day}: ${d.units} units`}
                        />
                        <span className="text-[8px] text-slate-400 mt-1">{d.day.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Metrics & Features Explanation */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>{ta ? 'மாதிரி கட்டமைப்பு மற்றும் பண்புகள்' : 'Model Architecture & Features'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {ta
                ? 'வாரத்தின் நாள், வார இறுதி அவசர விபத்துகள், பருவகால போக்குகள், மாவட்ட மக்கள் தொகை மற்றும் ABO/Rh விகிதங்களின் அடிப்படையில் மாதிரி கணக்கிடப்படுகிறது.'
                : 'The model utilizes a Scikit-Learn RandomForestRegressor trained with features including day of the week, weekend trauma surge indicators, monthly seasonality, district population weightings, and ABO/Rh demographic frequencies.'}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
