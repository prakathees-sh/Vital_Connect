'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Building2,
  Users,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { ChainRescueRadar } from '@/components/ChainRescueRadar';
import { useLanguage } from '@/context/LanguageContext';

export default function ChainRescuePage() {
  const { t, language } = useLanguage();
  const ta = language === 'ta';

  const [selectedLevel, setSelectedLevel] = useState(2);
  const [isEscalating, setIsEscalating] = useState(false);

  const [radarData, setRadarData] = useState({
    banksCount: 4,
    donorsCount: 18,
    radiusKm: 30,
    currentLevel: 2,
  });

  const levelsConfig = [
    {
      level: 1,
      title_en: "Level 1: Immediate Blood Banks",
      title_ta: "படிநிலை 1: அருகிலுள்ள இரத்த வங்கிகள்",
      radius: "0 - 15 km",
      desc_en: "Automated scan of licensed blood banks and emergency hospital storage in the immediate municipal perimeter.",
      desc_ta: "அருகிலுள்ள நகராட்சி எல்லைக்குள் உள்ள உரிமம் பெற்ற இரத்த வங்கிகள் மற்றும் சேமிப்பு மையங்களின் தானியங்கி ஆய்வு.",
      speed_en: "< 15 mins discovery",
      speed_ta: "< 15 நிமிடங்களில் கண்டறிதல்",
    },
    {
      level: 2,
      title_en: "Level 2: Compatible Verified Donors",
      title_ta: "படிநிலை 2: சரிபார்க்கப்பட்ட தன்னார்வ தானியர்கள்",
      radius: "0 - 30 km",
      desc_en: "Direct SMS broadcast and real-time push to verified active donors whose ABO/Rh profiles match the clinical request.",
      desc_ta: "நோயாளிக்கு பொருந்தும் இரத்த வகை கொண்ட உள்ளூர் பதிவுபெற்ற தீவிர தானியர்களுக்கு நேரடி SMS மற்றும் எச்சரிக்கைகள்.",
      speed_en: "< 30 mins transit",
      speed_ta: "< 30 நிமிட பயண தூரம்",
    },
    {
      level: 3,
      title_en: "Level 3: District-Wide Coordination",
      title_ta: "படிநிலை 3: மாவட்ட அளவிலான ஒருங்கிணைப்பு",
      radius: "0 - 60 km",
      desc_en: "Expands discovery to all clinics, sub-district medical colleges, and community centers throughout the entire district.",
      desc_ta: "மாவட்டம் முழுவதும் உள்ள அனைத்து சுகாதார மையங்கள் மற்றும் தாலுகா மருத்துவமனைகளுக்கு தேடல் விரிவாக்கம்.",
      speed_en: "District Dispatch",
      speed_ta: "மாவட்ட விநியோக நெறிமுறை",
    },
    {
      level: 4,
      title_en: "Level 4: Wider Regional Search",
      title_ta: "படிநிலை 4: மண்டல மருத்துவ தாழ்வாரம்",
      radius: "0 - 120 km",
      desc_en: "Cross-district ambulance corridors and regional cluster blood coordination between neighboring Tamil Nadu zones.",
      desc_ta: "அண்டை மாவட்டங்கள் மற்றும் பிராந்திய மண்டலங்களுக்கு இடையேயான ஆம்புலன்ஸ் தாழ்வார ஒருங்கிணைப்பு.",
      speed_en: "Corridor Transit",
      speed_ta: "தாழ்வார அதிவேக போக்குவரத்து",
    },
    {
      level: 5,
      title_en: "Level 5: Statewide Emergency Escalation",
      title_ta: "படிநிலை 5: மாநில அவசர கால தீவிர நிலை",
      radius: "All 38 Districts",
      desc_en: "Full emergency alert across all 38 Tamil Nadu districts for rare blood groups and massive clinical emergencies.",
      desc_ta: "அரிதான இரத்த வகைகள் மற்றும் பேரிடர் மருத்துவ தேவைகளுக்கான தமிழ்நாடு தழுவிய முழு எச்சரிக்கை.",
      speed_en: "Statewide Priority",
      speed_ta: "மாநில முன்னுரிமை மீட்பு",
    },
  ];

  const handleLevelChange = (lvl: number) => {
    setSelectedLevel(lvl);
    const radiusMap = [15, 30, 60, 120, 500];
    const banksMap = [2, 4, 9, 21, 48];
    const donorsMap = [6, 18, 45, 110, 380];

    setRadarData({
      currentLevel: lvl,
      radiusKm: radiusMap[lvl - 1],
      banksCount: banksMap[lvl - 1],
      donorsCount: donorsMap[lvl - 1],
    });
  };

  const handleEscalateSim = () => {
    if (selectedLevel < 5) {
      setIsEscalating(true);
      setTimeout(() => {
        handleLevelChange(selectedLevel + 1);
        setIsEscalating(false);
      }, 700);
    }
  };

  return (
    <div className="space-y-10 py-6 px-2 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>{ta ? 'செயின் ரெஸ்க்யூ: 5 அடுக்கு விரிவாக்க முறைமை' : 'Signature Multi-Tier Expansion Engine'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          {ta ? 'செயின் ரெஸ்க்யூ ரேடார்' : 'Chain Rescue'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {ta
            ? 'அவசர இரத்தத் தேவை உடனடியாகப் பூர்த்தியாகாத போது, உள்ளூர் இரத்த வங்கிகளில் இருந்து தமிழ்நாடு தழுவிய தன்னார்வலர்கள் வரை தானாகவே தேடல் சுற்றளவை விரிக்கிறது.'
            : 'When an urgent blood request is not immediately fulfilled, Chain Rescue automatically and progressively expands the search radius from local blood banks to statewide verified responders.'}
        </p>
      </div>

      {/* Main Radar Display */}
      <ChainRescueRadar
        currentLevel={selectedLevel}
        banksCount={radarData.banksCount}
        donorsCount={radarData.donorsCount}
        radiusKm={radarData.radiusKm}
        requestCode="VC-REQ-10291"
        onEscalate={handleEscalateSim}
        isEscalating={isEscalating}
      />

      {/* Detailed Explanation of the 5 Levels */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>{ta ? '5 அடுக்கு படிநிலை விரிவாக்க கட்டமைப்பு' : '5-Level Progressive Escalation Architecture'}</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {ta ? 'படிநிலையைத் தேர்ந்தெடுக்கவும்' : 'Interactive Level Selector'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {levelsConfig.map((item) => {
            const isSelected = selectedLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => handleLevelChange(item.level)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {ta ? `படிநிலை ${item.level}` : `Level ${item.level}`}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-slate-500">{item.radius}</span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {ta ? item.title_ta : item.title_en}
                </h3>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {ta ? item.desc_ta : item.desc_en}
                </p>

                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ⚡ {ta ? item.speed_ta : item.speed_en}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* District Layer Integration Callout */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>{ta ? 'ஒருங்கிணைந்த தமிழ்நாடு மாவட்ட புவியியல் வலையமைப்பு' : 'Integrated Tamil Nadu Geographic Matrix'}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {ta
              ? 'தமிழ்நாட்டின் 38 மாவட்டங்களும் அவசர கால போக்குவரத்து மற்றும் தொலைதூர இணைப்புடன் ஒருங்கிணைக்கப்பட்டுள்ளன. உயர் படிநிலைகளில், அருகிலுள்ள மாவட்டக் கொத்துகள் தானாகவே எச்சரிக்கப்படும்.'
              : 'All 38 districts in Tamil Nadu are mapped with centroids, population density, and inter-district travel corridors. When Level 4 or Level 5 is reached, the system automatically correlates neighboring district clusters.'}
          </p>
        </div>

        <Link
          href="/map"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors"
        >
          <span>{ta ? 'நேரலை வரைபடத்தில் காண்க' : 'View On Live Map'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
