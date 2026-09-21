'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  AlertTriangle,
  Users,
  Compass,
  Layers,
  Filter,
  Search,
  ArrowRight,
  Activity,
  Phone,
  Globe
} from 'lucide-react';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { TamilNaduInteractiveMap } from '@/components/TamilNaduInteractiveMap';

export default function InteractiveMapPage() {
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [activeView, setActiveView] = useState<'LEAFLET' | 'DISTRICTS'>('LEAFLET');
  const [filterType, setFilterType] = useState<'ALL' | 'HOSPITALS' | 'BLOOD_BANKS' | 'REQUESTS'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeItem, setActiveItem] = useState<any | null>(null);

  // Facility datasets
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    api.listEmergencyRequests().then((r) => setRequests(r || [])).catch(() => {});

    setHospitals([
      { id: 'h1', name: 'Rajiv Gandhi Government General Hospital', district: 'Chennai', lat: 13.0805, lng: 80.2798, type: 'HOSPITAL', phone: '+914425305000' },
      { id: 'h2', name: 'Apollo Hospitals Greams Road', district: 'Chennai', lat: 13.0569, lng: 80.2527, type: 'HOSPITAL', phone: '+914428290200' },
      { id: 'h3', name: 'Coimbatore Medical College Hospital', district: 'Coimbatore', lat: 11.0028, lng: 76.9691, type: 'HOSPITAL', phone: '+914222301393' },
      { id: 'h4', name: 'Government Rajaji Hospital', district: 'Madurai', lat: 9.9324, lng: 78.1332, type: 'HOSPITAL', phone: '+914522532535' },
      { id: 'h5', name: 'Mahatma Gandhi Memorial Govt Hospital', district: 'Tiruchirappalli', lat: 10.8122, lng: 78.6853, type: 'HOSPITAL', phone: '+914312415152' },
      { id: 'h6', name: 'Govt Mohan Kumaramangalam Medical College', district: 'Salem', lat: 11.6612, lng: 78.1408, type: 'HOSPITAL', phone: '+914272383313' },
      { id: 'h7', name: 'Christian Medical College Hospital', district: 'Vellore', lat: 12.9248, lng: 79.1350, type: 'HOSPITAL', phone: '+914162281000' },
    ]);

    setBloodBanks([
      { id: 'b1', name: 'Tamil Nadu State Blood Transfusion Center', district: 'Chennai', lat: 13.0838, lng: 80.2707, type: 'BLOOD_BANK', phone: '+914428190001' },
      { id: 'b2', name: 'Rotary Central Blood Bank', district: 'Chennai', lat: 13.0604, lng: 80.2496, type: 'BLOOD_BANK', phone: '+914428264567' },
      { id: 'b3', name: 'Coimbatore Blood Bank Society', district: 'Coimbatore', lat: 11.0183, lng: 76.9602, type: 'BLOOD_BANK', phone: '+914222212345' },
      { id: 'b4', name: 'Indian Red Cross Society Blood Center', district: 'Madurai', lat: 9.9200, lng: 78.1150, type: 'BLOOD_BANK', phone: '+914522345678' },
      { id: 'b5', name: 'Trichy Voluntary Blood Donors Bank', district: 'Tiruchirappalli', lat: 10.7950, lng: 78.6900, type: 'BLOOD_BANK', phone: '+914312700123' },
    ]);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (activeView !== 'LEAFLET') return;

    let isMounted = true;
    const setupMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current).setView([11.1271, 78.6569], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    };

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeView]);

  // Render Markers on Map
  useEffect(() => {
    if (activeView !== 'LEAFLET' || !mapInstanceRef.current || !markersGroupRef.current) return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      const createPin = (color: string, symbol: string) => {
        return L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">${symbol}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
      };

      // 1. Hospitals
      if (filterType === 'ALL' || filterType === 'HOSPITALS') {
        hospitals.forEach((h) => {
          if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return;
          const marker = L.marker([h.lat, h.lng], { icon: createPin('#059669', '🏥') });
          marker.on('click', () => setActiveItem(h));
          markersGroupRef.current.addLayer(marker);
        });
      }

      // 2. Blood Banks
      if (filterType === 'ALL' || filterType === 'BLOOD_BANKS') {
        bloodBanks.forEach((b) => {
          if (selectedDistrict !== 'All' && b.district !== selectedDistrict) return;
          const marker = L.marker([b.lat, b.lng], { icon: createPin('#0d9488', '🩸') });
          marker.on('click', () => setActiveItem(b));
          markersGroupRef.current.addLayer(marker);
        });
      }

      // 3. Emergency Requests
      if (filterType === 'ALL' || filterType === 'REQUESTS') {
        requests.forEach((r) => {
          if (selectedDistrict !== 'All' && r.district !== selectedDistrict) return;
          const marker = L.marker([r.latitude || 11.0, r.longitude || 77.0], { icon: createPin('#e11d48', '⚠️') });
          marker.on('click', () => setActiveItem({ ...r, type: 'REQUEST' }));
          markersGroupRef.current.addLayer(marker);

          const radiusMeters = (r.chain_rescue_level || 2) * 15000;
          const circle = L.circle([r.latitude || 11.0, r.longitude || 77.0], {
            color: '#e11d48',
            fillColor: '#e11d48',
            fillOpacity: 0.08,
            radius: radiusMeters,
            weight: 1.5,
          });
          markersGroupRef.current.addLayer(circle);
        });
      }
    };

    renderMarkers();
  }, [activeView, filterType, selectedDistrict, hospitals, bloodBanks, requests]);

  const handleDistrictSelect = (distName: string) => {
    setSelectedDistrict(distName);
    if (distName === 'All') {
      mapInstanceRef.current?.setView([11.1271, 78.6569], 7);
    } else {
      const d = TAMIL_NADU_DISTRICTS.find((item) => item.name_en === distName);
      if (d && mapInstanceRef.current) {
        mapInstanceRef.current.setView([d.lat, d.lng], 11);
      }
    }
  };

  return (
    <div className="space-y-6 py-6 px-2 sm:px-0">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {ta ? 'நேரலை தமிழ்நாடு மருத்துவ வரைபடம்' : 'Live Tamil Nadu Medical Map'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? '38 மாவட்டங்களையும் உள்ளடக்கிய மருத்துவமனைகள், இரத்த வங்கிகள் மற்றும் செயின் ரெஸ்க்யூ தேடல் சுற்றளவு'
              : 'Geographic coordination layer covering all 38 districts with hospital, blood bank, and emergency radar nodes'}
          </p>
        </div>

        {/* View Switcher: Leaflet OSM vs 38-District SVG */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveView('LEAFLET')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'LEAFLET'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {ta ? 'செயற்கைக்கோள் / சாலை வரைபடம்' : 'Live Facility Map'}
          </button>
          <button
            onClick={() => setActiveView('DISTRICTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'DISTRICTS'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {ta ? '38 மாவட்டங்கள் பகுப்பாய்வு' : '38-District Vector Map'}
          </button>
        </div>
      </div>

      {activeView === 'LEAFLET' ? (
        <div className="space-y-4">
          {/* Layer Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label_en: 'All Layers', label_ta: 'அனைத்து அடுக்குகள்' },
              { key: 'HOSPITALS', label_en: '🏥 Hospitals', label_ta: '🏥 மருத்துவமனைகள்' },
              { key: 'BLOOD_BANKS', label_en: '🩸 Blood Banks', label_ta: '🩸 இரத்த வங்கிகள்' },
              { key: 'REQUESTS', label_en: '⚠️ Active Requests', label_ta: '⚠️ அவசர கோரிக்கைகள்' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === tab.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {ta ? tab.label_ta : tab.label_en}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{ta ? 'மாவட்ட எல்லை பார்வை' : 'District Focus'}</span>
                </h3>

                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="All">{ta ? 'அனைத்து 38 மாவட்டங்கள்' : 'All 38 Districts (State View)'}</option>
                  {TAMIL_NADU_DISTRICTS.map((d) => (
                    <option key={d.name_en} value={d.name_en}>
                      {ta ? d.name_ta : `${d.name_en} (${d.name_ta})`}
                    </option>
                  ))}
                </select>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <p>• {ta ? 'சிவப்பு வட்டம்: செயின் ரெஸ்க்யூ தேடல் சுற்றளவு' : 'Red Circle: Chain Rescue radius'}</p>
                  <p>• 🏥 {ta ? 'பச்சை குறி: பதிவுபெற்ற மருத்துவமனைகள்' : 'Green Pin: Verified Hospitals'}</p>
                  <p>• 🩸 {ta ? 'நீலப்பச்சை குறி: இரத்த வங்கிகள்' : 'Teal Pin: Partner Blood Banks'}</p>
                  <p>• ⚠️ {ta ? 'சிவப்பு குறி: தீவிர அவசர கோரிக்கைகள்' : 'Red Pin: Emergency Incidents'}</p>
                </div>
              </div>

              {/* Marker Inspector */}
              {activeItem && (
                <div className="rounded-3xl border border-emerald-500/40 bg-white dark:bg-slate-900 p-5 shadow-md space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {activeItem.type === 'REQUEST' ? (ta ? 'அவசர கோரிக்கை' : 'Emergency Incident') : activeItem.type}
                    </span>
                    <button
                      onClick={() => setActiveItem(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {activeItem.name || activeItem.patient_name || activeItem.hospital_name}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {ta ? 'மாவட்டம்: ' : 'District: '}<b>{tDistrict(activeItem.district)}</b>
                  </p>

                  {activeItem.blood_group && (
                    <p className="text-xs font-bold text-rose-600">
                      {ta ? 'தேவை: ' : 'Requirement: '}{activeItem.units_needed} units ({activeItem.blood_group})
                    </p>
                  )}

                  {activeItem.phone && (
                    <a
                      href={`tel:${activeItem.phone}`}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono hover:text-emerald-600"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeItem.phone}</span>
                    </a>
                  )}

                  {activeItem.request_code && (
                    <Link
                      href={`/requests/${activeItem.request_code}`}
                      className="block w-full text-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      {ta ? 'விவரங்களை காண்க →' : 'Track Emergency →'}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="lg:col-span-3 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative h-[560px]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
            </div>
          </div>
        </div>
      ) : (
        /* Tamil Nadu 38-District Vector Visualization View */
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="max-w-2xl mx-auto text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {ta ? '38 மாவட்டங்கள் ஊடாடும் வரைபடம்' : 'Tamil Nadu 38 Administrative Districts Overview'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ta
                ? 'எந்தவொரு மாவட்டத்தின் மீதும் கர்சரை நகர்த்தி அல்லது கிளிக் செய்து பிராந்திய தகவல்களைக் காண்க'
                : 'Hover or click any of the 38 districts to view regional donor telemetry and emergency status'}
            </p>
          </div>

          <div className="flex justify-center">
            <TamilNaduInteractiveMap
              selectedDistrict={selectedDistrict === 'All' ? null : selectedDistrict}
              onSelectDistrict={(d) => setSelectedDistrict(d || 'All')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
