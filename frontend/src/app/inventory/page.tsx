'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Droplet,
  Search,
  Building2,
  Phone,
  RefreshCw,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BloodGroupBadge } from '@/components/BloodGroupBadge';
import { TAMIL_NADU_DISTRICTS } from '@/lib/districts';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const ALL_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function InventoryDashboardPage() {
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const sumRes = await api.getInventorySummary(selectedDistrict !== 'All' ? selectedDistrict : undefined);
      if (sumRes?.groups) {
        setSummaryData(sumRes.groups);
      }

      const itemsRes = await api.listInventoryItems({
        blood_group: selectedGroup !== 'All' ? selectedGroup : undefined,
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
      });
      setItems(itemsRes || []);
      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroup, selectedDistrict]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.bank_name.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.blood_group.toLowerCase().includes(q)
    );
  });

  // Mock trend data for 7 days
  const trendData = [
    { day: 'Mon', 'O+': 42, 'A+': 35, 'B+': 38, 'O-': 5 },
    { day: 'Tue', 'O+': 48, 'A+': 32, 'B+': 36, 'O-': 4 },
    { day: 'Wed', 'O+': 45, 'A+': 30, 'B+': 40, 'O-': 6 },
    { day: 'Thu', 'O+': 39, 'A+': 28, 'B+': 35, 'O-': 3 },
    { day: 'Fri', 'O+': 52, 'A+': 34, 'B+': 42, 'O-': 5 },
    { day: 'Sat', 'O+': 36, 'A+': 26, 'B+': 31, 'O-': 2 },
    { day: 'Sun', 'O+': 44, 'A+': 30, 'B+': 37, 'O-': 4 },
  ];

  const getStatusLabel = (status: string) => {
    if (status === 'Critical') return ta ? 'தீவிர பற்றாக்குறை' : 'Critical';
    if (status === 'Low') return ta ? 'குறைந்த இருப்பு' : 'Low Stock';
    if (status === 'Moderate') return ta ? 'மிதமான இருப்பு' : 'Moderate';
    return ta ? 'போதுமானது' : 'Sufficient';
  };

  return (
    <div className="space-y-8 py-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {ta ? 'இரத்த இருப்பு டாஷ்போர்டு' : 'Blood Availability Dashboard'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? 'தமிழ்நாடு முழுவதும் பதிவுபெற்ற இரத்த வங்கிகளின் நிகழ்நேர கையிருப்பு நிலவரம்'
              : 'Real-time stock levels, institutional inventory, and shortage alerts across Tamil Nadu'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{ta ? 'புதுப்பிக்கப்பட்டது: ' : 'Updated: '} {lastUpdatedTime}</span>
          </span>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            title={ta ? 'புதுப்பிக்க' : 'Refresh Stock Data'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 8 Blood Groups Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryData.map((item) => {
          const isCritical = item.status === 'Critical';
          const isLow = item.status === 'Low';
          const isSelected = selectedGroup === item.blood_group;

          return (
            <div
              key={item.blood_group}
              onClick={() => setSelectedGroup(item.blood_group)}
              className={`p-4 rounded-2xl border text-center cursor-pointer transition-all hover:scale-105 bg-white dark:bg-slate-900 ${
                isSelected
                  ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
                  : isCritical
                  ? 'border-rose-300 dark:border-rose-900 shadow-sm'
                  : isLow
                  ? 'border-amber-300 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <BloodGroupBadge group={item.blood_group} size="md" status={item.status} />
              <p className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {item.units_available}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                {ta ? 'கையிருப்பு அலகுகள்' : 'Available Units'}
              </p>
              <span className={`inline-block px-2 py-0.5 mt-1.5 rounded-full text-[9px] font-bold ${
                isCritical
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : isLow
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Availability & 7-Day Movement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Bar Chart */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>{ta ? 'மாநில அளவிலான அலகுகள் பகிர்வு' : 'Statewide Units Distribution'}</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">{ta ? 'இரத்த வகைப்படி' : 'By Blood Group'}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData}>
                <XAxis dataKey="blood_group" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="units_available" radius={[6, 6, 0, 0]}>
                  {summaryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.status === 'Critical' ? '#e11d48' : entry.status === 'Low' ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>{ta ? '7-நாள் இருப்பு போக்குகள்' : '7-Day Inventory Trends'}</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">{ta ? 'முக்கிய இரத்த வகைகள்' : 'Key Groups'}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="O+" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="B+" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="O-" stroke="#e11d48" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Controls & Granular Facility Table */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ta ? 'இரத்த வங்கி அல்லது மருத்துவமனை தேட...' : 'Search blood bank or facility...'}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Blood Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {ALL_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {ta ? `இரத்த வகை: ${g === 'All' ? 'அனைத்தும்' : g}` : `Filter Blood Group: ${g}`}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">{ta ? 'அனைத்து 38 மாவட்டங்கள்' : 'All 38 Districts'}</option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d.name_en} value={d.name_en}>
                  {ta ? d.name_ta : `${d.name_en} (${d.name_ta})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{ta ? 'இரத்த வங்கி / மையம்' : 'Blood Bank / Facility'}</th>
                  <th className="px-6 py-4">{ta ? 'மாவட்டம்' : 'District'}</th>
                  <th className="px-6 py-4">{ta ? 'இரத்த வகை' : 'Blood Group'}</th>
                  <th className="px-6 py-4">{ta ? 'கையிருப்பு (அலகுகள்)' : 'Stock (Units)'}</th>
                  <th className="px-6 py-4">{ta ? 'நிலை' : 'Status'}</th>
                  <th className="px-6 py-4">{ta ? 'தொடர்பு எண்' : 'Emergency Contact'}</th>
                  <th className="px-6 py-4">{ta ? 'கடைசி புதுப்பிப்பு' : 'Last Updated'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{item.bank_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {tDistrict(item.district)}
                    </td>
                    <td className="px-6 py-4 font-black font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                      {item.units_available}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : item.status === 'Low'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                      <a href={`tel:${item.contact_phone}`} className="hover:text-emerald-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.contact_phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(item.last_updated).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
