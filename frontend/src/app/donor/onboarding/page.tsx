'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Droplet,
  Activity,
  ShieldCheck,
  Bell,
  Zap,
  User,
  Stethoscope,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HEALTH_QUESTIONS = [
  {
    key: 'recent_fever',
    q_en: 'Have you had a fever, cough, flu, or active infection in the last 14 days?',
    q_ta: 'கடந்த 14 நாட்களில் உங்களுக்கு காய்ச்சல், இருமல், ஃப்ளூ அல்லது தொற்று ஏதாவது இருந்ததா?',
    risk: true,
  },
  {
    key: 'current_medications',
    q_en: 'Are you currently taking antibiotics, anticoagulants, or regular prescribed medications?',
    q_ta: 'நீங்கள் தற்போது ஆன்டிபயோட்டிக்ஸ் அல்லது பரிந்துரைக்கப்பட்ட மருந்துகளை எடுத்துக்கொள்கிறீர்களா?',
    risk: true,
  },
  {
    key: 'recent_surgery',
    q_en: 'Have you undergone major surgery in the past 6 to 12 months?',
    q_ta: 'கடந்த 6 முதல் 12 மாதங்களில் நீங்கள் பெரிய அறுவை சிகிச்சை செய்துள்ளீர்களா?',
    risk: true,
  },
  {
    key: 'recent_dental',
    q_en: 'Have you had any tooth extraction or dental surgery in the past 72 hours?',
    q_ta: 'கடந்த 72 மணி நேரத்தில் நீங்கள் பல் பிடுங்குதல் அல்லது சிகிச்சை மேற்கொண்டீர்களா?',
    risk: true,
  },
  {
    key: 'recent_tattoo',
    q_en: 'Have you gotten a tattoo, body piercing, or acupuncture done in the past 6 months?',
    q_ta: 'கடந்த 6 மாதங்களில் பச்சை குத்துதல் அல்லது உடல் துளைத்தல் செய்தீர்களா?',
    risk: true,
  },
  {
    key: 'recent_donation',
    q_en: 'Have you donated whole blood within the last 90 days (3 months)?',
    q_ta: 'கடந்த 90 நாட்களில் (3 மாதங்கள்) நீங்கள் முழு இரத்தம் தானம் செய்தீர்களா?',
    risk: true,
  },
  {
    key: 'recent_alcohol',
    q_en: 'Have you consumed alcohol within the last 24 hours?',
    q_ta: 'கடந்த 24 மணி நேரத்தில் நீங்கள் மது அருந்தினீர்களா?',
    risk: true,
  },
  {
    key: 'known_conditions',
    q_en: 'Do you have a medical history of cardiovascular disease, hepatitis, HIV, or epilepsy?',
    q_ta: 'உங்களுக்கு இதய நோய், ஹெபடைடிஸ், HIV அல்லது வலிப்பு நோய் போன்ற மருத்துவ வரலாறு உள்ளதா?',
    risk: true,
  },
  {
    key: 'previous_deferral',
    q_en: 'Have you ever been deferred or disqualified from blood donation by a medical camp or blood bank?',
    q_ta: 'இரத்த வங்கி அல்லது மருத்துவ முகாமில் நீங்கள் முன்பு தற்காலிகமாகவோ அல்லது நிரந்தரமாகவோ தகுதி நீக்கம் செய்யப்பட்டிருக்கிறீர்களா?',
    risk: true,
  },
];

const PREFERENCE_QUESTIONS = [
  {
    key: 'emergency_ready',
    q_en: 'Are you available to receive rapid emergency trauma alerts in your district?',
    q_ta: 'உங்கள் மாவட்டத்தில் உள்ள தீவிர அவசர சிகிச்சை நோயாளிகளுக்கான எச்சரிக்கைகளை பெற நீங்கள் தயாரா?',
    defaultVal: true,
  },
  {
    key: 'sms_opt_in',
    q_en: 'Do you consent to receive SMS notifications when your compatible blood group is urgently requested?',
    q_ta: 'உங்கள் இரத்த வகை அவசரமாக தேவைப்படும்போது SMS அறிவிப்புகளைப் பெற சம்மதிக்கிறீர்களா?',
    defaultVal: true,
  },
  {
    key: 'willing_professional_screen',
    q_en: 'Are you willing to undergo final hemoglobin, blood pressure, and vitals checks by qualified blood bank medical staff?',
    q_ta: 'உரிமம் பெற்ற இரத்த வங்கி மருத்துவர்களால் நடத்தப்படும் இறுதி ஹீமோகுளோபின் மற்றும் இரத்த அழுத்த பரிசோதனைக்கு சம்மதிக்கிறீர்களா?',
    defaultVal: true,
  },
];

const STEPS = [
  { label: 'Profile', label_ta: 'அடிப்படை விவரங்கள்', icon: User },
  { label: 'Health Screening', label_ta: 'உடல்நல சரிபார்ப்பு', icon: Stethoscope },
  { label: 'Preferences', label_ta: 'விருப்பத்தேர்வுகள்', icon: Bell },
];

export default function DonorOnboardingPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const ta = language === 'ta';

  const [step, setStep] = useState(0);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState(26);
  const [weight, setWeight] = useState(65);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [healthAnswers, setHealthAnswers] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(HEALTH_QUESTIONS.map((q) => [q.key, false]))
  );
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PREFERENCE_QUESTIONS.map((q) => [q.key, q.defaultVal]))
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const toggleHealth = (key: string) => {
    setHealthAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePref = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const answers = {
        blood_group: bloodGroup,
        age,
        weight,
        gender,
        ...healthAnswers,
        ...prefs,
      };

      const res = await api.submitScreening(answers);
      await api.updateDonorProfile({
        blood_group: bloodGroup,
        age,
        weight,
        gender,
        is_available: true,
        emergency_available: prefs.emergency_ready,
        sms_notifications: prefs.sms_opt_in,
      });

      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Error submitting preliminary screening');
    } finally {
      setLoading(false);
    }
  };

  // Result view
  if (result) {
    const isEligible = result.is_preliminarily_eligible;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
              isEligible
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isEligible ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isEligible
                ? ta ? 'முன்னோடி தயார்நிலை அங்கீகரிக்கப்பட்டது!' : 'Preliminary Readiness Cleared!'
                : ta ? 'ஆரம்ப மருத்துவ பரிசீலனை தேவை' : 'Preliminary Medical Consultation Advised'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {isEligible
                ? (ta ? 'உங்கள் இரத்த தானியர் சுயவிவரம் செயல்படுத்தப்பட்டது. உங்கள் டிஜிட்டல் அடையாள அட்டை தயாராக உள்ளது.' : 'Your donor profile is now active on the Vital Connect coordination network. Your Digital Donor ID is generated.')
                : (ta ? 'உங்கள் பதில்களின் அடிப்படையில், நீங்கள் மருத்துவமனை அல்லது இரத்த வங்கி மருத்துவர்களிடம் இறுதி ஆலோசனை பெற பரிந்துரைக்கப்படுகிறது.' : 'Based on your preliminary responses, consultation with blood bank staff or a licensed physician is recommended before voluntary donation.')}
            </p>
          </div>

          {!isEligible && result.disqualifiers && result.disqualifiers.length > 0 && (
            <div className="text-left p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                {ta ? 'பரிசீலனை காரணிகள்:' : 'Points Noted for Review:'}
              </p>
              {result.disqualifiers.map((d: string, i: number) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>{d}</span>
                </p>
              ))}
            </div>
          )}

          {/* Mandatory Medical Clearance Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left leading-relaxed">
            <strong>{ta ? 'முக்கிய மருத்துவ குறிப்பு: ' : 'Mandatory Clinical Notice: '}</strong>
            {ta
              ? 'இந்த வினாத்தாள் ஒரு ஆரம்ப தயார்நிலை மதிப்பீட்டு கருவி மட்டுமே. இது மருத்துவ அனுமதியை வழங்காது. இரத்த தானத்திற்கான இறுதி தகுதி, தகுதிவாய்ந்த இரத்த வங்கி மருத்துவர்கள் மற்றும் ஊழியர்களால் மட்டுமே தீர்மானிக்கப்பட வேண்டும்.'
              : 'This is a preliminary screening only and does NOT provide final medical clearance or guarantee donation eligibility. Final eligibility must be determined by qualified medical or blood-bank professionals.'}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/donor/id-card')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <span>{ta ? 'டிஜிட்டல் அடையாள அட்டைக்கு செல்ல →' : 'View Digital Donor ID →'}</span>
            </button>
            <button
              onClick={() => router.push('/donor/dashboard')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
            >
              {ta ? 'தானியர் டாஷ்போர்டு' : 'Donor Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Header with Step Wizard */}
        <div className="border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Heart className="w-5 h-5 fill-current text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {ta ? 'தானியர் தயார்நிலை மதிப்பீடு' : 'Donor Readiness & Preliminary Screening'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ta ? 'தன்னார்வ உயிர்காக்கும் ஒருங்கிணைப்புக்கான ஆரம்ப சரிபார்ப்பு' : 'Pre-donation readiness assessment for voluntary blood coordination'}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              {ta ? `படிநிலை ${step + 1} / ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              {STEPS.map((s, idx) => (
                <div key={idx} className={`flex items-center gap-1.5 ${idx <= step ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    idx < step ? 'bg-emerald-600 text-white' : idx === step ? 'border-2 border-emerald-600 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {idx < step ? '✓' : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{ta ? s.label_ta : s.label}</span>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          {/* Prominent Medical Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>{ta ? 'முக்கிய அறிவிப்பு: ' : 'IMPORTANT NOTICE: '}</strong>
              {ta
                ? 'இது ஒரு ஆரம்ப மதிப்பீட்டு வினாத்தாள் மட்டுமே. இது இறுதி மருத்துவ அனுமதியை வழங்காது. இரத்த தான தகுதியை தகுதிவாய்ந்த மருத்துவர்கள் அல்லது இரத்த வங்கி ஊழியர்கள் மட்டுமே தீர்மானிக்க வேண்டும்.'
                : 'This is only a preliminary readiness questionnaire and does NOT provide final medical clearance or guarantee donation eligibility. Final eligibility must be determined by qualified medical or blood-bank professionals.'}
            </p>
          </div>

          {/* ── STEP 1: Core Parameters ── */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{ta ? '1. அடிப்படை உடல் விவரங்கள்' : '1. Basic Physical Profile'}</span>
              </h2>

              {/* Blood Group Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {ta ? 'இரத்த வகை *' : 'Blood Group *'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-3 rounded-xl text-sm font-black transition-all ${
                        bloodGroup === bg
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600'
                          : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      {ta ? 'வயது (ஆண்டுகள்)' : 'Age (Years)'}
                    </label>
                    <span className="text-sm font-mono font-bold text-emerald-600">{age} yrs</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-[11px] text-slate-400">{ta ? 'தகுதியான வயது வரம்பு: 18 – 65 வயது' : 'Standard eligible range: 18 – 65 years'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      {ta ? 'எடை (கிலோ)' : 'Weight (kg)'}
                    </label>
                    <span className="text-sm font-mono font-bold text-emerald-600">{weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-[11px] text-slate-400">{ta ? 'குறைந்தபட்ச எடை: 45 கிலோ' : 'Minimum body weight requirement: 45 kg'}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {ta ? 'பாலினம்' : 'Gender'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        gender === g
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {g === 'Male' ? (ta ? 'ஆண்' : 'Male') : g === 'Female' ? (ta ? 'பெண்' : 'Female') : (ta ? 'மற்றவர்' : 'Other')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Health Screening Questions ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>{ta ? '2. ஆரம்ப மருத்துவ வினாத்தாள்' : '2. Preliminary Medical Screening'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ta
                  ? 'நோயாளி மற்றும் தானியர் இருவரின் பாதுகாப்பிற்காக நேர்மையாக பதிலளிக்கவும்.'
                  : 'Please answer accurately for patient safety and clinical integrity.'}
              </p>

              <div className="space-y-2.5">
                {HEALTH_QUESTIONS.map((hq) => {
                  const val = healthAnswers[hq.key];
                  return (
                    <div
                      key={hq.key}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        val
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {ta ? hq.q_ta : hq.q_en}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { if (!val) toggleHealth(hq.key); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            val
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {ta ? 'ஆம்' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (val) toggleHealth(hq.key); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            !val
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {ta ? 'இல்லை' : 'No'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: Notification & Availability Preferences ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>{ta ? '3. அவசர கால தயார்நிலை மற்றும் அறிவிப்பு விருப்பங்கள்' : '3. Availability & Notification Preferences'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ta
                  ? 'உங்கள் பகுதியில் தீவிர அவசர நிலைகள் ஏற்படும் போது தகவல் தொடர்பு விருப்பங்களை உறுதிப்படுத்தவும்.'
                  : 'Specify how you would like to be alerted when compatible patients require urgent blood coordination.'}
              </p>

              <div className="space-y-3">
                {PREFERENCE_QUESTIONS.map((pq) => {
                  const val = prefs[pq.key];
                  return (
                    <div
                      key={pq.key}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {ta ? pq.q_ta : pq.q_en}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePref(pq.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                          val ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            val ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{ta ? 'முந்தைய' : 'Previous'}</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <span>{ta ? 'அடுத்து' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? (ta ? 'சமர்ப்பிக்கப்படுகிறது...' : 'Submitting Assessment...') : (ta ? 'மதிப்பீட்டை சமர்ப்பிக்கவும்' : 'Submit Assessment')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
