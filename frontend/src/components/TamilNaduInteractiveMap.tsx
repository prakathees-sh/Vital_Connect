'use client';

import React, { useState } from 'react';
import tnMapData from '@/lib/tnMapData.json';
import { Activity, ShieldCheck, Droplet, Users, Building2, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TamilNaduMapProps {
  selectedDistrict?: string | null;
  onSelectDistrict?: (districtName: string) => void;
  className?: string;
  isBackground?: boolean;
}

export const TamilNaduInteractiveMap: React.FC<TamilNaduMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
  className = '',
  isBackground = false,
}) => {
  const { t, language } = useLanguage();
  const [hoveredDistrict, setHoveredDistrict] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });


  // Inter-district emergency arterial network corridors
  const arterialCorridors = [
    { from: 'Chennai', to: 'Chengalpattu' },
    { from: 'Chengalpattu', to: 'Viluppuram' },
    { from: 'Viluppuram', to: 'Tiruchirappalli' },
    { from: 'Tiruchirappalli', to: 'Madurai' },
    { from: 'Madurai', to: 'Tirunelveli' },
    { from: 'Tirunelveli', to: 'Kanniyakumari' },
    { from: 'Chennai', to: 'Vellore' },
    { from: 'Vellore', to: 'Dharmapuri' },
    { from: 'Dharmapuri', to: 'Salem' },
    { from: 'Salem', to: 'Erode' },
    { from: 'Erode', to: 'Tiruppur' },
    { from: 'Tiruppur', to: 'Coimbatore' },
    { from: 'Coimbatore', to: 'The Nilgiris' },
    { from: 'Salem', to: 'Namakkal' },
    { from: 'Namakkal', to: 'Karur' },
    { from: 'Karur', to: 'Dindigul' },
    { from: 'Dindigul', to: 'Madurai' },
    { from: 'Tiruchirappalli', to: 'Thanjavur' },
    { from: 'Thanjavur', to: 'Nagapattinam' },
    { from: 'Madurai', to: 'Virudhunagar' },
    { from: 'Virudhunagar', to: 'Tenkasi' },
  ];

  const getDistrictCoords = (name: string) => {
    const d = tnMapData.find((item: any) => item.name_en === name);
    return d ? { x: d.cx, y: d.cy } : null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative select-none ${className} ${
        isBackground ? 'pointer-events-auto' : ''
      }`}
    >
      <svg
        viewBox="0 0 700 900"
        className="w-full h-full filter drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle medical tech glow filters */}
          <filter id="vital-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="arterial-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FB7185" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="coastal-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Ambient Grid overlay for military/healthcare telemetry feel */}
        <g className="opacity-15 dark:opacity-20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6">
          <circle cx="350" cy="450" r="180" fill="none" className="text-vital-500" />
          <circle cx="350" cy="450" r="320" fill="none" className="text-vital-500" />
          <circle cx="350" cy="450" r="440" fill="none" className="text-vital-500" />
          <line x1="350" y1="20" x2="350" y2="880" className="text-vital-500" />
          <line x1="20" y1="450" x2="680" y2="450" className="text-vital-500" />
        </g>

        {/* Arterial Healthcare Corridor Network Lines */}
        <g className="transition-opacity duration-500">
          {arterialCorridors.map((c, i) => {
            const from = getDistrictCoords(c.from);
            const to = getDistrictCoords(c.to);
            if (!from || !to) return null;
            return (
              <g key={i}>
                {/* Base arterial line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#arterial-grad)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  className="opacity-40 animate-pulse"
                />
              </g>
            );
          })}
        </g>

        {/* 38 District Boundaries Mesh */}
        <g id="tn-districts-group">
          {tnMapData.map((d: any) => {
            const isHovered = hoveredDistrict?.name_en === d.name_en;
            const isSelected = selectedDistrict?.toLowerCase() === d.name_en.toLowerCase();

            return (
              <g
                key={d.name_en}
                className="cursor-pointer transition-all duration-300 group"
                onMouseEnter={() => setHoveredDistrict(d)}
                onMouseLeave={() => setHoveredDistrict(null)}
                onClick={() => onSelectDistrict?.(d.name_en)}
              >
                {/* District Polygon */}
                <path
                  d={d.path}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-vital-600/40 stroke-vital-400 stroke-[2.5] filter drop-shadow(0 0 14px rgba(225,29,72,0.8))'
                      : isHovered
                      ? 'fill-vital-500/30 stroke-vital-400 stroke-[2] filter drop-shadow(0 0 10px rgba(225,29,72,0.6))'
                      : 'fill-slate-900/10 hover:fill-vital-500/20 dark:fill-slate-950/25 stroke-vital-500/30 hover:stroke-vital-400/80 stroke-[0.85]'
                  }`}
                />

                {/* Centroid Node Beacon */}
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={isSelected ? 5 : isHovered ? 4.5 : 2.5}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-white stroke-vital-600 stroke-2 filter drop-shadow(0 0 6px #ffffff)'
                      : isHovered
                      ? 'fill-vital-400 stroke-vital-600 stroke-1.5'
                      : 'fill-vital-500/80 dark:fill-vital-400/60'
                  }`}
                />

                {/* Animated pulse ring for major hubs */}
                {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].includes(d.name_en) && (
                  <circle
                    cx={d.cx}
                    cy={d.cy}
                    r="8"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="1"
                    className="animate-ping opacity-40 origin-center pointer-events-none"
                  />
                )}

                {/* District Name Label on hover/selection or major hubs */}
                {(isHovered || isSelected || ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'].includes(d.name_en)) && (
                  <text
                    x={d.cx}
                    y={d.cy - 7}
                    textAnchor="middle"
                    className={`text-[9px] font-black uppercase tracking-wider pointer-events-none transition-all ${
                      isSelected || isHovered
                        ? 'fill-white font-extrabold text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                        : 'fill-slate-400 dark:fill-slate-400/70 text-[8px]'
                    }`}
                  >
                    {language === 'ta' ? d.name_ta : d.name_en}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Modern Floating Healthcare HUD Tooltip */}
      {hoveredDistrict && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(mousePos.x + 16, 460)}px`,
            top: `${Math.max(10, mousePos.y - 120)}px`,
            zIndex: 50,
          }}
          className="pointer-events-none w-64 rounded-2xl border border-vital-500/50 bg-slate-950/90 backdrop-blur-xl p-3.5 shadow-2xl text-white space-y-2 transition-all duration-150 animate-in fade-in zoom-in-95 ring-1 ring-vital-400/30"
        >
          <div className="flex justify-between items-start border-b border-white/10 pb-2">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-vital-400">
                {t.tnMap.districtNode}
              </span>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                {language === 'ta' ? (
                  <>
                    <span>{hoveredDistrict.name_ta}</span>
                    <span className="text-xs text-vital-300 font-normal">({hoveredDistrict.name_en})</span>
                  </>
                ) : (
                  <>
                    <span>{hoveredDistrict.name_en}</span>
                    <span className="text-xs text-vital-300 font-normal">({hoveredDistrict.name_ta})</span>
                  </>
                )}
              </h4>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-vital-900/60 border border-vital-500/40 text-[9px] font-bold text-vital-300">
              {hoveredDistrict.zone} {t.tnMap.zone}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-vital-400" />
              <span><b>{hoveredDistrict.donors.toLocaleString()}+</b> {t.tnMap.donors}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span><b>{hoveredDistrict.blood_banks}</b> {t.tnMap.bloodBanks}</span>
            </div>
          </div>

          <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.tnMap.telemetryActive}</span>
            </span>
            <span className="text-vital-400 font-semibold">{t.tnMap.clickToFilter}</span>
          </div>
        </div>
      )}
    </div>
  );
};
