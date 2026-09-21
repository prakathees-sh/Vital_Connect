'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Activity,
  Zap,
  ArrowRight,
  Users,
  Compass
} from 'lucide-react';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { ChainRescueRadar } from '@/components/ChainRescueRadar';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function EmergencyRequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string;
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const timelineSteps = [
    { key: 'CREATED', label_en: 'Request Created', label_ta: 'கோரிக்கை பதிவு', desc_en: 'Emergency request registered' },
    { key: 'SEARCHING', label_en: 'Searching Sources', label_ta: 'ஆதாரங்கள் தேடல்', desc_en: 'Scanning banks and nearby donors' },
    { key: 'FOUND', label_en: 'Source Found', label_ta: 'ஆதாரம் கண்டறியப்பட்டது', desc_en: 'Candidate units identified' },
    { key: 'CONTACTED', label_en: 'Parties Contacted', label_ta: 'தொடர்பு கொள்ளப்பட்டது', desc_en: 'Dispatch alerts sent' },
    { key: 'ACCEPTED', label_en: 'Accepted', label_ta: 'ஏற்கப்பட்டது', desc_en: 'Responder confirmed transfer' },
    { key: 'IN_PROGRESS', label_en: 'In Progress', label_ta: 'செயல்பாட்டில் உள்ளது', desc_en: 'Transit to clinical center' },
    { key: 'COMPLETED', label_en: 'Completed', label_ta: 'நிறைவுற்றது', desc_en: 'Blood received & verified' },
  ];

  const [requestData, setRequestData] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [chainRescueData, setChainRescueData] = useState<any | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    api.getRequestDetail(requestId)
      .then((res) => {
        setRequestData(res.request);
        setMatches(res.matches || []);
        setConversationId(res.conversation_id || null);

        api.getChainRescue(res.request.id).then((crRes) => {
          setChainRescueData(crRes);
        }).catch(() => {});
      })
      .catch((err) => {
        console.error("Error loading request", err);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleEscalate = async () => {
    if (!requestData) return;
    setIsEscalating(true);
    try {
      const res = await api.escalateChainRescue(requestData.id);
      setChainRescueData(res);
      const updated = await api.getRequestDetail(requestId);
      setRequestData(updated.request);
    } catch (err: any) {
      alert(err.message || 'Could not escalate');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!requestData) return;
    try {
      await api.updateRequestStatus(requestData.id, newStatus);
      const updated = await api.getRequestDetail(requestId);
      setRequestData(updated.request);
    } catch (err: any) {
      alert(err.message || 'Could not update status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        {ta ? 'அவசர கோரிக்கை நிலவரம் ஏற்றப்படுகிறது...' : 'Loading emergency request telemetry...'}
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {ta ? 'அவசர கோரிக்கை காணப்படவில்லை' : 'Emergency Request Not Found'}
        </h2>
        <p className="text-xs text-slate-500">
          {ta ? 'கோரப்பட்ட குறியீடு எந்த நேரடி பதிவோடும் பொருந்தவில்லை.' : 'The requested code does not match any active record.'}
        </p>
        <Link href="/requests" className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">
          {ta ? 'அனைத்து கோரிக்கைகளையும் காண்க' : 'View All Requests'}
        </Link>
      </div>
    );
  }

  const statusToStepMap: Record<string, number> = {
    'SEARCHING': 1,
    'CHAIN_RESCUE_ACTIVE': 2,
    'MATCHED': 3,
    'CONTACTED': 3,
    'ACCEPTED': 4,
    'IN_PROGRESS': 5,
    'FULFILLED': 6,
    'COMPLETED': 6,
  };
  const currentStepIdx = statusToStepMap[requestData.status] ?? 1;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* 1. Request Code Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                {requestData.request_code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-900">
                {requestData.urgency}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                {requestData.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {requestData.units_needed} {ta ? 'அலகுகள் தேவை' : 'Units of'} {requestData.blood_group} {ta ? '' : 'Needed'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ta ? 'நோயாளி: ' : 'Patient: '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{requestData.patient_name}</span> • {ta ? 'மருத்துவமனை: ' : 'Hospital: '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{requestData.hospital_name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BloodGroupBadge group={requestData.blood_group} size="lg" />
            {conversationId && (
              <Link
                href={`/chat`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>{ta ? 'அரட்டை இழை திறக்க' : 'Open Coordination Chat'}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Natural Language Description Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {ta ? 'சம்பவ விவரம்' : 'Situation Description'}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            "{requestData.description}"
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{requestData.address}, {requestData.city} ({ta ? 'மாவட்டம்: ' : 'District: '}{tDistrict(requestData.district)})</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>{requestData.latitude?.toFixed(4)}, {requestData.longitude?.toFixed(4)}</span>
            </span>
          </div>
        </div>

        {/* 2. Seven-Stage Emergency Progress Timeline */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {ta ? 'அவசர கால முன்னேற்ற காலவரிசை' : 'Emergency Tracking Timeline'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {timelineSteps.map((step, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20'
                      : isPast
                      ? 'border-emerald-300/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-400 text-[9px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold leading-tight">{ta ? step.label_ta : step.label_en}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Chain Rescue Active Radar Section */}
      {chainRescueData && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>{ta ? 'செயின் ரெஸ்க்யூ முன்னேற்றம்' : 'Chain Rescue Progression'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {ta ? `படிநிலை ${chainRescueData.current_level} / 5` : `Escalation Level ${chainRescueData.current_level} / 5`}
            </span>
          </div>

          <ChainRescueRadar
            currentLevel={chainRescueData.current_level || 1}
            banksCount={chainRescueData.compatible_banks_count || 0}
            donorsCount={chainRescueData.compatible_donors_count || 0}
            radiusKm={chainRescueData.radius_km || 15}
            requestCode={requestData.request_code}
            onEscalate={handleEscalate}
            isEscalating={isEscalating}
          />
        </section>
      )}

      {/* 4. Intelligent Matching Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>{ta ? 'பொருத்தமான இரத்த ஆதாரங்கள்' : 'Intelligent Compatibility Matches'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {ta
                ? 'ABO/Rh பொருத்தம், தூரம் மற்றும் தயார்நிலை அடிப்படையில் தரவரிசைப்படுத்தப்பட்டது'
                : 'Ranked by ABO/Rh compatibility, geographic proximity, and readiness'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {matches.length} {ta ? 'ஆதாரங்கள்' : 'Candidates Identified'}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {ta ? 'அருகில் நேரடி பொருத்தமான ஆதாரம் இல்லை' : 'No compatible blood source found nearby'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {ta
                ? 'செயின் ரெஸ்க்யூ மூலம் தேடல் சுற்றளவை அடுத்த கட்டத்திற்கு விரிவாக்கவும்.'
                : 'Chain Rescue can expand the search radius to district and regional partners.'}
            </p>
            <button
              onClick={handleEscalate}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              {ta ? 'தேடல் சுற்றளவை விரிவாக்குக' : 'Expand Search Radius'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {m.is_donor ? (ta ? 'சரிபார்க்கப்பட்ட தனிநபர் தானியர்' : 'Verified Individual Donor') : (ta ? 'நிறுவன இரத்த வங்கி' : 'Institutional Blood Bank')}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {m.entity_name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {m.score}%
                    </span>
                    <p className="text-[9px] uppercase font-bold text-slate-400">{ta ? 'பொருத்த மதிப்பெண்' : 'Match Score'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {m.reasons.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {ta ? `நிலை: ${m.status}` : `Status: ${m.status}`}
                  </span>
                  <Link
                    href={`/chat`}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>{ta ? 'அரட்டை மூலம் ஒருங்கிணைக்க' : 'Coordinate via Chat'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Request Lifecycle Controls */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {ta ? 'அவசர நிலையை புதுப்பிக்கவும்:' : 'Update Emergency Status:'}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange('ACCEPTED')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {ta ? 'ஏற்கப்பட்டது என குறிக்கவும்' : 'Mark Accepted'}
          </button>
          <button
            onClick={() => handleStatusChange('IN_PROGRESS')}
            className="px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50"
          >
            {ta ? 'விநியோக செயல்பாட்டில்' : 'Fulfillment In Progress'}
          </button>
          <button
            onClick={() => handleStatusChange('FULFILLED')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700"
          >
            {ta ? 'நிறைவுற்றது என குறிக்கவும்' : 'Mark Fulfilled & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
