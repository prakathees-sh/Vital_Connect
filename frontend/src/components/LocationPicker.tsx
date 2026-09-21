'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, CheckCircle2, Navigation, Compass, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';
import { useLanguage } from '@/context/LanguageContext';

interface LocationPickerProps {
  onLocationConfirmed: (data: {
    address: string;
    area: string;
    city: string;
    district: string;
    pincode: string;
    landmark: string;
    lat: number;
    lng: number;
  }) => void;
  initialDistrict?: string;
  initialLat?: number;
  initialLng?: number;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationConfirmed,
  initialDistrict = 'Coimbatore',
  initialLat = 11.0168,
  initialLng = 76.9558
}) => {
  const { t, language, tDistrict } = useLanguage();
  const [address, setAddress] = useState('123 Avinashi Road, Peelamedu, Coimbatore');

  const [area, setArea] = useState('Peelamedu');
  const [city, setCity] = useState('Coimbatore');
  const [pincode, setPincode] = useState('641004');
  const [landmark, setLandmark] = useState('Near PSG Tech');
  const [detectedDistrict, setDetectedDistrict] = useState(initialDistrict);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Auto-detect district whenever address or city changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const fullQuery = `${address} ${area} ${city}`;
        const res = await api.detectDistrict(fullQuery, lat, lng);
        if (res && res.detected_district) {
          setDetectedDistrict(res.detected_district);
        }
      } catch (_) {}
    }, 400);

    return () => clearTimeout(timer);
  }, [address, area, city, lat, lng]);

  // Initialize Leaflet map in browser
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      // Leaflet CSS check
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Avoid double initialization
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom red medical pin
      const icon = L.divIcon({
        className: 'custom-medical-pin',
        html: `<div style="background-color: #DC2626; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">📍</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);

      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        if (!isMounted) return;
        setLat(Number(position.lat.toFixed(6)));
        setLng(Number(position.lng.toFixed(6)));
        setIsConfirmed(false);

        // Reverse detect district
        try {
          const res = await api.detectDistrict('', position.lat, position.lng);
          if (res?.detected_district && isMounted) {
            setDetectedDistrict(res.detected_district);
          }
        } catch (_) {}
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        if (!isMounted) return;
        setLat(Number(e.latlng.lat.toFixed(6)));
        setLng(Number(e.latlng.lng.toFixed(6)));
        setIsConfirmed(false);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleConfirmLocation = () => {
    setIsConfirmed(true);
    onLocationConfirmed({
      address,
      area,
      city,
      district: detectedDistrict,
      pincode,
      landmark,
      lat,
      lng,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setDetectedDistrict(selected);
    const d = TAMIL_NADU_DISTRICTS.find((item) => item.name_en === selected);
    if (d && mapInstanceRef.current && markerRef.current) {
      setLat(d.lat);
      setLng(d.lng);
      mapInstanceRef.current.setView([d.lat, d.lng], 12);
      markerRef.current.setLatLng([d.lat, d.lng]);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-vital-600 dark:text-vital-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {t.locationPicker.labelDistrict}
          </h3>
        </div>
        {/* District Auto-Detected Pill */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 text-[11px]">{t.common.district}:</span>
          <select
            value={detectedDistrict}
            onChange={handleDistrictChange}
            className="bg-transparent font-bold text-vital-600 dark:text-vital-400 cursor-pointer focus:outline-none"
            title="Tamil Nadu District"
          >
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d.name_en} value={d.name_en} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                {language === 'ta' ? `${d.name_ta} (${d.name_en})` : `${d.name_en} (${d.name_ta})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address & Locality Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.locationPicker.labelAddress}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.locationPicker.placeholderAddress}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-vital-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.locationPicker.labelArea}
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t.locationPicker.placeholderArea}
            className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.locationPicker.labelCity}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.locationPicker.placeholderCity}
            className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.locationPicker.labelPincode}
          </label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder={t.locationPicker.placeholderPincode}
            className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.locationPicker.labelLandmark}
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder={t.locationPicker.placeholderLandmark}
            className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Interactive Leaflet Map View */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-vital-500" />
            <span>{t.locationPicker.mapDragHint}</span>
          </span>
          <span className="font-mono text-[11px]">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
        <div
          ref={mapContainerRef}
          className="w-full h-56 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden relative z-0"
        />
      </div>

      {/* Confirm Location Button */}
      <div className="pt-2 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.locationPicker.coordNotice}</span>
        </p>

        <button
          type="button"
          onClick={handleConfirmLocation}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            isConfirmed
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-vital-600 hover:bg-vital-700 text-white shadow-md shadow-vital-600/30'
          }`}
        >
          {isConfirmed ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.locationPicker.locationConfirmed}</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>{t.locationPicker.confirmLocation}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
