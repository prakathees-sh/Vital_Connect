'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Droplet,
  MapPin,
  Building,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Heart
} from 'lucide-react';
import { LocationPicker } from '@/components/LocationPicker';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function NewEmergencyRequestPage() {
  const router = useRouter();
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const urgencies = [
    { val: "NORMAL", label_en: "Normal (Scheduled)", label_ta: "சாதாரண (திட்டமிடப்பட்டது)" },
    { val: "URGENT", label_en: "Urgent (Within 6h)", label_ta: "அவசரம் (6 மணி நேரத்திற்குள்)" },
    { val: "CRITICAL", label_en: "Critical (Within 2h)", label_ta: "தீவிரம் (2 மணி நேரத்திற்குள்)" },
    { val: "EMERGENCY", label_en: "Immediate Emergency (Trauma)", label_ta: "உடனடி அவசரம் (விபத்து / தீவிர சிகிச்சை)" },
  ];

  const [patientName, setPatientName] = useState('K. Meenakshi (Trauma Wing)');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState('EMERGENCY');
  const [hospitalName, setHospitalName] = useState('Coimbatore Medical College Hospital');
  const [description, setDescription] = useState(
    'Need 2 units of O+ blood urgently at Coimbatore Medical College Hospital. Patient is currently in emergency trauma ICU bed 4. Cross-matching ready.'
  );

  // Address & Map Coordinates
  const [locationData, setLocationData] = useState({
    address: 'Avinashi Road, Peelamedu',
    area: 'Peelamedu',
    city: 'Coimbatore',
    district: 'Coimbatore',
    pincode: '641004',
    landmark: 'Near Medical College Ward B',
    lat: 11.0028,
    lng: 76.9691,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationConfirmed = (loc: any) => {
    setLocationData(loc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.createEmergencyRequest({
        patient_name: patientName,
        blood_group: bloodGroup,
        units_needed: unitsNeeded,
        urgency,
        hospital_name: hospitalName,
        address: locationData.address,
        area: locationData.area,
        city: locationData.city,
        district: locationData.district,
        pincode: locationData.pincode,
        landmark: locationData.landmark,
        latitude: locationData.lat,
        longitude: locationData.lng,
        description
      });

      router.push(`/requests/${res.request_code}`);
    } catch (err: any) {
      setError(err.message || (ta ? 'அவசர கோரிக்கை உருவாக்க முடியவில்லை.' : 'Failed to create emergency blood request.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {ta ? 'அவசர இரத்தக் கோரிக்கை பதிவு' : 'Create Emergency Blood Request'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {ta
            ? 'நிகழ்நேர ABO/Rh பொருத்தம், மாவட்ட கண்டுபிடிப்பு மற்றும் செயின் ரெஸ்க்யூ மீட்பு முறைமையை செயல்படுத்துகிறது'
            : 'Initiates real-time ABO/Rh matching, proximity district discovery, and progressive Chain Rescue escalation'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Patient & Clinical Information */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Droplet className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {ta ? '1. நோயாளி மற்றும் மருத்துவ தேவைகள்' : '1. Clinical & Patient Requirements'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'நோயாளி பெயர் / மருத்துவ அடையாள எண் *' : 'Patient Name / Clinical ID *'}
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. K. Meenakshi (Trauma Wing)"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'மருத்துவமனை பெயர் *' : 'Hospital / Clinical Facility *'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Coimbatore Medical College Hospital"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Blood Group & Units */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {ta ? 'தேவைப்படும் இரத்த வகை *' : 'Required Blood Group *'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'தேவைப்படும் அலகுகள் (Units) *' : 'Units Required *'}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {ta ? 'அவசர நிலை *' : 'Urgency Level *'}
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {urgencies.map((u) => (
                  <option key={u.val} value={u.val}>
                    {ta ? u.label_ta : u.label_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {ta ? 'மருத்துவ குறிப்பு / அவசர விவரங்கள் *' : 'Clinical Summary & Details *'}
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Step 2: Location Picker with Coordinates and Auto District Detection */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {ta ? '2. துல்லியமான இருப்பிட தேர்வு' : '2. Facility Location & Proximity Anchor'}
            </h2>
          </div>

          <LocationPicker
            initialAddress={locationData.address}
            initialArea={locationData.area}
            initialCity={locationData.city}
            initialDistrict={locationData.district}
            initialPincode={locationData.pincode}
            initialLandmark={locationData.landmark}
            initialLat={locationData.lat}
            initialLng={locationData.lng}
            onLocationConfirmed={handleLocationConfirmed}
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wide shadow-md shadow-rose-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{loading ? (ta ? 'கோரிக்கை சமர்ப்பிக்கப்படுகிறது...' : 'Submitting Emergency Request...') : (ta ? 'அவசர இரத்தக் கோரிக்கையை உருவாக்கவும்' : 'Create Emergency Request')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
