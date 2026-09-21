'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  Building2,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin
} from 'lucide-react';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES = ["All", "EMERGENCY", "CRITICAL", "URGENT", "NORMAL"];

export default function RequestsListPage() {
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRequests = () => {
    setLoading(true);
    const filters: any = {};
    if (selectedGroup !== 'All') filters.blood_group = selectedGroup;
    if (selectedDistrict !== 'All') filters.district = selectedDistrict;
    if (selectedUrgency !== 'All') filters.urgency = selectedUrgency;

    api.listEmergencyRequests(filters)
      .then((res) => {
        setRequests(res || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [selectedGroup, selectedDistrict, selectedUrgency]);

  const filtered = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.request_code.toLowerCase().includes(q) ||
      r.hospital_name.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const getUrgencyBadge = (u: string) => {
    if (u === 'EMERGENCY') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] uppercase border border-rose-200 dark:border-rose-900">
          {ta ? 'உடனடி அவசரம்' : 'Emergency'}
        </span>
      );
    }
    if (u === 'CRITICAL') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase border border-amber-200 dark:border-amber-900">
          {ta ? 'தீவிர நிலை' : 'Critical'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-900">
        {ta ? 'அவசரம்' : u}
      </span>
    );
  };

  return (
    <div className="space-y-6 py-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {ta ? 'அவசர இரத்த கோரிக்கைகள்' : 'Emergency Blood Requests'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? 'தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ள தீவிர மருத்துவமனைகளின் நேரடித் தேவைகள்'
              : 'Live emergency requirements across clinical facilities in all 38 Tamil Nadu districts'}
          </p>
        </div>

        <Link
          href="/requests/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{ta ? 'புதிய அவசர கோரிக்கை' : 'Create Emergency Request'}</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={ta ? 'குறியீடு, மருத்துவமனை, மாவட்டம்...' : 'Search code, hospital, district...'}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Blood Group Filter */}
        <div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {ta ? `இரத்த வகை: ${g === 'All' ? 'அனைத்தும்' : g}` : `Blood Group: ${g}`}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">{ta ? 'அனைத்து 38 மாவட்டங்கள்' : 'All 38 Districts'}</option>
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d.name_en} value={d.name_en}>
                {ta ? d.name_ta : `${d.name_en} (${d.name_ta})`}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {ta ? `தீவிர நிலை: ${u === 'All' ? 'அனைத்தும்' : u}` : `Urgency: ${u}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          {ta ? 'அவசர கோரிக்கைகள் ஏற்றப்படுகின்றன...' : 'Loading emergency requests...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {ta ? 'பொருந்தும் கோரிக்கைகள் எதுவும் இல்லை' : 'No matching requests found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {ta
              ? 'அனைத்து தமிழ்நாடு கோரிக்கைகளையும் காண வடிகட்டிகளை மீட்டமைக்கவும்.'
              : 'Try resetting your blood group or district filters to view all active statewide coordination requests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-sm bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <BloodGroupBadge group={req.blood_group} size="md" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {req.request_code}
                    </span>
                    {getUrgencyBadge(req.urgency)}
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      {req.units_needed} {ta ? 'அலகுகள் தேவை' : 'Units Needed'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.hospital_name}</span>
                    <span className="text-slate-400 font-normal">•</span>
                    <span className="text-xs text-slate-500 font-medium">{tDistrict(req.district)}</span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                    {req.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <Link
                  href={`/requests/${req.request_code}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>{ta ? 'பதிலளிக்கவும்' : 'View & Respond'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
