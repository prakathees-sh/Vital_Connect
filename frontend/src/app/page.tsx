'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Zap,
  Building2,
  Users,
  Search,
  Activity,
  CheckCircle2,
  Lock,
  Award,
  PhoneCall,
  Clock,
  ChevronRight,
  Radio,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t, language } = useLanguage();
  const ta = language === 'ta';

  const stats = [
    { value: '1,420+', label: ta ? 'சரிபார்க்கப்பட்ட தானியர்கள்' : 'Verified Donors', icon: Users },
    { value: '384', label: ta ? 'அவசர கோரிக்கைகள்' : 'Emergency Requests', icon: AlertTriangle },
    { value: '362', label: ta ? 'நிறைவேற்றப்பட்ட தேவைகள்' : 'Fulfilled Dispatches', icon: CheckCircle2 },
    { value: '48', label: ta ? 'இணைக்கப்பட்ட இரத்த வங்கிகள்' : 'Partner Blood Banks', icon: Building2 },
    { value: '38', label: ta ? 'தமிழ்நாடு மாவட்டங்கள்' : 'Tamil Nadu Districts', icon: ShieldCheck },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: ta ? 'அவசர கோரிக்கை உருவாக்கம்' : 'Create Emergency Request',
      desc: ta
        ? 'மருத்துவமனை அல்லது நோயாளி இரத்த வகை, அலகுகள் மற்றும் இருப்பிடத்தை விரைவாக பதிவிடுகின்றனர்.'
        : 'Hospital or patient specifies blood group, units needed, urgency, and precise location with pin-point accuracy.',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
    },
    {
      step: '02',
      title: ta ? 'நுண்ணறிவு பொருத்தம்' : 'Intelligent Proximity Matching',
      desc: ta
        ? 'ABO மற்றும் Rh இணக்கத்தன்மை விதிகளின்படி அருகிலுள்ள இரத்த வங்கிகள் மற்றும் தானியர்களை தானியங்கி அமைப்பு கண்டறிகிறது.'
        : 'Proprietary proximity matching evaluates exact blood compatibility and identifies available sources within minutes.',
      icon: Zap,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    },
    {
      step: '03',
      title: ta ? 'செயின் ரெஸ்க்யூ படிநிலை' : 'Progressive Chain Rescue',
      desc: ta
        ? 'உள்ளூர் கையிருப்பு போதவில்லை எனில், தானியங்கி சுற்றளவு விரிவாக்கம் மூலம் அருகிலுள்ள மாவட்டங்களை தொடர்பு கொள்கிறது.'
        : 'If local stocks are insufficient, the 5-tier Chain Rescue protocol expands the radius progressively across Tamil Nadu.',
      icon: Radio,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900',
    },
    {
      step: '04',
      title: ta ? 'பாதுகாப்பான தானம் & சான்றிதழ்' : 'Safe Transit & Certification',
      desc: ta
        ? 'நேரடி ஒருங்கிணைப்பு, மருத்துவமனை விநியோகம் மற்றும் அதிகாரப்பூர்வ டிஜிட்டல் பாராட்டுச் சான்றிதழ் வழங்கல்.'
        : 'Fulfillment confirmation, institutional coordination, and generation of verifiable Digital Donation Certificates.',
      icon: FileCheck,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    },
  ];

  const keyFeatures = [
    {
      title: ta ? 'நிகழ்நேர இரத்த இருப்பு கண்காணிப்பு' : 'Live Blood Stock Telemetry',
      desc: ta
        ? 'தமிழ்நாட்டின் அனைத்து 38 மாவட்டங்களிலும் உள்ள அரசு மற்றும் தனியார் இரத்த வங்கிகளின் இருப்பு விபரங்கள்.'
        : 'Instant visibility across all 8 blood groups in verified institutional blood banks across Tamil Nadu.',
      icon: Droplet,
      link: '/inventory',
      action: ta ? 'இருப்பை பார்க்க' : 'Check Live Stock',
    },
    {
      title: ta ? 'செயின் ரெஸ்க்யூ ரேடார்' : 'Signature Chain Rescue Radar',
      desc: ta
        ? 'தீவிர விபத்து நேரங்களில் 15 கி.மீ முதல் 120+ கி.மீ வரை தானாக விரியும் 5 அடுக்கு அவசர மீட்பு முறைமை.'
        : 'Automated 5-tier dynamic expansion protocol ensuring no critical emergency goes unanswered.',
      icon: Activity,
      link: '/chain-rescue',
      action: ta ? 'ரேடாரை திறக்க' : 'View Chain Rescue',
    },
    {
      title: ta ? 'டிஜிட்டல் தானியர் பாஸ்போர்ட்' : 'Digital Donor ID & QR Verification',
      desc: ta
        ? 'தனியுரிமையை பாதுகாக்கும் பாதுகாப்பான QR குறியீட்டுடன் கூடிய அதிகாரப்பூர்வ டிஜிட்டல் அடையாள அட்டை.'
        : 'Official healthcare credentials with safe QR verification that protects private donor addresses and contact details.',
      icon: ShieldCheck,
      link: '/donor/id-card',
      action: ta ? 'அடையாள அட்டை' : 'View Digital ID',
    },
    {
      title: ta ? 'அவசர ஒருங்கிணைப்பு அரட்டை' : 'Dedicated Coordination Chat',
      desc: ta
        ? 'நோயாளி மற்றும் தானியர்/மருத்துவமனை இடையே பாதுகாப்புடன் கூடிய நேரடி அவசர தகவல் பரிமாற்றம்.'
        : 'Direct end-to-end incident communication between requesters, donors, and dispatch medical staff.',
      icon: Users,
      link: '/chat',
      action: ta ? 'அரட்டைக்கு செல்ல' : 'Open Chat',
    },
  ];

  const rescueTiers = [
    {
      tier: '1',
      name: ta ? 'அருகிலுள்ள இரத்த வங்கிகள்' : 'Nearby Blood Banks',
      radius: '0 – 15 km',
      desc: ta ? 'அருகிலுள்ள மருத்துவ கல்லூரிகள் மற்றும் பதிவுபெற்ற இரத்த மையங்கள்.' : 'Immediate institutional blood bank reserves and hospital storage.',
    },
    {
      tier: '2',
      name: ta ? 'சரிபார்க்கப்பட்ட தானியர்கள்' : 'Compatible Verified Donors',
      radius: '15 – 30 km',
      desc: ta ? 'உடனடி தயார்நிலையில் உள்ள உள்ளூர் தன்னார்வலர்களுக்கு நேரடி எச்சரிக்கை.' : 'Rapid notification to registered active local volunteer lifesavers.',
    },
    {
      tier: '3',
      name: ta ? 'மாவட்ட அளவிலான தேடல்' : 'District Regional Search',
      radius: '30 – 60 km',
      desc: ta ? 'அண்டை நகரங்கள் மற்றும் தாலுகா அளவிலான ஒருங்கிணைப்பு.' : 'Expansion to neighboring taluks and secondary health centers.',
    },
    {
      tier: '4',
      name: ta ? 'மண்டல மருத்துவ தாழ்வாரம்' : 'Wider Regional Corridors',
      radius: '60 – 120 km',
      desc: ta ? 'அருகிலுள்ள மாவட்ட மருத்துவமனைகளுடன் அதிவேக இணைப்பு.' : 'Regional inter-district medical college network transit links.',
    },
    {
      tier: '5',
      name: ta ? 'மாநில அவசர அறிவிப்பு' : 'Statewide Emergency Escalation',
      radius: '120+ km',
      desc: ta ? 'அரிதான இரத்த வகைகளுக்கான தமிழ்நாடு தழுவிய உடனடி ஒருங்கிணைப்பு.' : 'Full Tamil Nadu emergency broadcast for rare blood groups and disasters.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        {/* Subtle Healthcare Ambient Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-14 sm:py-20 text-center max-w-4xl mx-auto space-y-8">
          {/* Tag / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {ta
                ? 'தமிழ்நாடு அவசர இரத்த ஒருங்கிணைப்பு தளம் • 38 மாவட்டங்கள்'
                : 'Tamil Nadu Emergency Blood Coordination Network • 38 Districts'}
            </span>
          </div>

          {/* Main Headings */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              VITAL <span className="text-emerald-600 dark:text-emerald-400">CONNECT</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 max-w-2xl mx-auto leading-snug">
              {ta
                ? 'ஒவ்வொரு நொடியும் உயிர்காக்கும் போது மனிதர்களையும், மருத்துவமனைகளையும், இரத்த ஆதாரங்களையும் இணைக்கிறது.'
                : 'Connecting people, hospitals, and blood sources when every second matters.'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {ta
                ? 'தமிழ்நாடு முழுவதும் அவசர கால இரத்த தேவைகளை உடனுக்குடன் கண்டறிந்து, அருகில் உள்ள இரத்த வங்கிகள் மற்றும் தகுதிவாய்ந்த தானியர்களை ஒன்றிணைக்கும் அதிநவீன தளம்.'
                : 'An intelligent emergency coordination network providing verified blood discovery, progressive Chain Rescue escalation, and rapid institutional coordination across Tamil Nadu.'}
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Primary Action: Request Blood */}
            <Link
              href="/requests/new"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02]"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{ta ? 'அவசர இரத்தம் கோருக' : 'Request Blood'}</span>
            </Link>

            {/* Primary Action: Become a Donor */}
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Heart className="w-4 h-4" />
              <span>{ta ? 'தானியராக இணையுங்கள்' : 'Become a Donor'}</span>
            </Link>

            {/* Secondary Action: Find Blood */}
            <Link
              href="/inventory"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{ta ? 'இருப்பை தேடுக' : 'Find Blood'}</span>
            </Link>

            {/* Secondary Action: Explore Platform */}
            <Link
              href="/map"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>{ta ? 'நேரலை வரைபடம்' : 'Explore Platform'}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Quick Helpline Strip */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{ta ? 'இரத்த வங்கி உதவி எண்: ' : 'Emergency Blood Helpline: '} <strong className="text-slate-900 dark:text-white">104</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span>{ta ? 'ஆம்புலன்ஸ் உதவி எண்: ' : 'Ambulance: '} <strong className="text-slate-900 dark:text-white">108</strong></span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. PLATFORM INTRODUCTION & STATS ── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            {ta ? 'மாநில அளவிலான தாக்கம்' : 'Statewide Platform Impact'}
          </h2>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {ta ? 'தமிழ்நாடு முழுவதும் உயிர்காக்கும் இணைப்பு' : 'Coordinating Emergencies Across Tamil Nadu'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center space-y-2 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. HOW VITAL CONNECT WORKS ── */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {ta ? 'எளிய செயல்முறை' : 'Workflow Architecture'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {ta ? 'Vital Connect எவ்வாறு இயங்குகிறது?' : 'How Vital Connect Works'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ta
              ? 'அவசர கோரிக்கை முதல் நோயாளிக்கு இரத்தம் சேரும் வரை 4 எளிய படிநிலைகள்'
              : 'A transparent, four-step coordination flow connecting emergency patients to safe blood sources'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {ws.step}
                    </span>
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${ws.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. KEY PLATFORM FEATURES ── */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {ta ? 'முக்கிய சிறப்பம்சங்கள்' : 'Core Capabilities'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {ta ? 'உயிர்காக்கும் நவீன கருவிகள்' : 'Built for Life-Saving Coordination'}
            </h2>
          </div>
          <Link
            href="/requests"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{ta ? 'அனைத்து கோரிக்கைகளையும் பார்க்க' : 'Browse Active Requests'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <Link
                  href={feat.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
                >
                  <span>{feat.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. CHAIN RESCUE INTRODUCTION ── */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>{ta ? 'அவசர கால படிநிலை' : 'Signature Escalation Engine'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {ta ? 'செயின் ரெஸ்க்யூ: 5 அடுக்கு மீட்பு முறைமை' : 'Chain Rescue: 5-Tier Escalation Protocol'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {ta
                ? 'நோயாளிக்கு உடனடியாக இரத்தம் கிடைக்கவில்லை எனில், தானியங்கி சுற்றளவு விரிவாக்கத்தின் மூலம் அடுத்தடுத்த நிலைகளில் தேடுதல் விரிவடைகிறது.'
                : 'When an emergency case faces local shortage, Chain Rescue progressively broadens the rescue perimeter across verified medical centers and volunteer networks.'}
            </p>
          </div>

          <Link
            href="/chain-rescue"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
          >
            <span>{ta ? 'ரேடாரை இயக்குக' : 'Launch Chain Rescue'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Escalation Tiers List */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {rescueTiers.map((tItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                  {tItem.tier}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {tItem.radius}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {tItem.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {tItem.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. TRUST & SECURITY SECTION ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {ta ? 'தனியுரிமை பாதுகாப்பு' : 'Privacy-First Architecture'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {ta
              ? 'தானியர்களின் சரியான முகவரியோ, தொலைபேசி எண்களோ பொதுவெளியில் ஒருபோதும் பகிரப்படாது. குறியாக்கம் செய்யப்பட்ட QR குறியீடு மட்டுமே பயன்படுத்தப்படுகிறது.'
              : 'Donor exact residential addresses and phone numbers are never exposed publicly. Public verification utilizes encrypted QR badges only.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {ta ? 'மருத்துவ பாதுகாப்பு வழிகாட்டுதல்' : 'Certified Clinical Protocols'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {ta
              ? 'Vital Connect ஒரு தளவாட ஒருங்கிணைப்பு வலைப்பின்னல் மட்டுமே. இறுதி தான தகுதியை தகுதிவாய்ந்த மருத்துவமனை மற்றும் இரத்த வங்கி மருத்துவர்கள் மட்டுமே தீர்மானிப்பர்.'
              : 'Vital Connect serves purely as a logistical emergency matching network. All clinical testing, antibody screening, and donation clearance remain with licensed blood banks.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {ta ? 'அங்கீகரிக்கப்பட்ட டிஜிட்டல் சான்றிதழ்' : 'Verifiable Recognition'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {ta
              ? 'ஒவ்வொரு நிறைவுபெற்ற இரத்த தானத்திற்கும் ஆன்லைன் சரிபார்ப்பு மற்றும் பதிவிறக்கம் செய்யக்கூடிய PDF சான்றிதழ் தானியர்களுக்கு வழங்கப்படுகிறது.'
              : 'Every completed voluntary donation generates an official Digital Blood Donation Certificate with verifiable QR code and PDF download.'}
          </p>
        </div>
      </section>

      {/* ── 7. FINAL CALL-TO-ACTION ── */}
      <section className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 p-8 sm:p-14 text-center space-y-6 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {ta ? 'ஒவ்வொரு நொடியும் உயிர்காக்கும். இப்போதே இணையுங்கள்.' : 'Every Second Matters. Join the Life-Saving Network.'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {ta
              ? 'நீங்கள் ஒரு இரத்த தானியராக இருந்தாலும் சரி, அல்லது உடனடி இரத்தம் தேவைப்படும் குடும்பமாக இருந்தாலும் சரி, Vital Connect உங்களுக்கு உதவ தயாராக உள்ளது.'
              : 'Whether you are an eligible donor ready to step forward or an institution managing emergency requirements, Vital Connect accelerates discovery and response.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <Heart className="w-4 h-4" />
            <span>{ta ? 'தானியராக பதிவு செய்க' : 'Register as Volunteer Donor'}</span>
          </Link>
          <Link
            href="/requests/new"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all hover:scale-105"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{ta ? 'அவசர கோரிக்கையை பதிவிடுக' : 'Post Emergency Blood Request'}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
