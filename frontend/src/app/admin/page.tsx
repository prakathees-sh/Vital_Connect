'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Activity,
  Droplet,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  RefreshCw,
  Building2,
  Lock,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminCommandPage() {
  const { t, language, tDistrict } = useLanguage();
  const ta = language === 'ta';

  const [overview, setOverview] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, uRes, lRes] = await Promise.all([
        api.getAdminOverview(),
        api.listAdminUsers({ role: roleFilter !== 'All' ? roleFilter : undefined }),
        api.getAdminAuditLogs()
      ]);
      setOverview(ovRes);
      setUsers(uRes || []);
      setAuditLogs(lRes || []);
    } catch (err) {
      console.error("Admin load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [roleFilter]);

  const handleToggleVerification = async (userId: string) => {
    try {
      const res = await api.toggleUserVerification(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: res.is_verified } : u));
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.district.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 py-6 px-2 sm:px-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {ta ? 'நிர்வாக கட்டுப்பாட்டு மையம்' : 'Admin Command Center'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {ta
              ? 'அமைப்பு நிர்வாகம், நிறுவன சான்றிதழ் சரிபார்ப்பு, நிகழ்நேர தணிக்கை பதிவுகள்'
              : 'System governance, verification oversight, real-time audit logs, and PDF dispatch'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getAdminInventoryPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{ta ? 'இருப்பு PDF அறிக்கை பதிவிறக்குக' : 'Generate Inventory PDF Report'}</span>
          </a>
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'மொத்த கணக்குகள்' : 'Total Accounts'}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {overview.metrics.total_users}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'பதிவுபெற்ற தானியர்கள்' : 'Registered Donors'}</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {overview.metrics.total_donors}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'மருத்துவமனைகள்' : 'Partner Hospitals'}</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {overview.metrics.total_hospitals}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'இரத்த வங்கிகள்' : 'Blood Banks'}</p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {overview.metrics.total_blood_banks}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'கையிருப்பு அலகுகள்' : 'Total Stock Units'}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {overview.metrics.total_units_in_stock}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold">{ta ? 'நிறைவேற்ற விகிதம்' : 'Fulfillment Rate'}</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {overview.metrics.fulfillment_rate_percent}%
            </p>
          </div>
        </div>
      )}

      {/* User Management & Verification Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{ta ? 'பயனர் நற்சான்றிதழ் & சரிபார்ப்பு மேலாண்மை' : 'User Credential & Verification Management'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {ta ? 'மருத்துவமனை உரிமங்கள், இரத்த வங்கி சான்றுகள் மற்றும் தானியர் சரிபார்ப்பு' : 'Verify healthcare licenses, blood bank credentials, and donor accounts'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ta ? 'தேடு...' : 'Search user or district...'}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{ta ? 'அனைத்து பாத்திரங்கள்' : 'All Roles'}</option>
              <option value="DONOR">{ta ? 'தானியர்கள்' : 'Donors'}</option>
              <option value="HOSPITAL">{ta ? 'மருத்துவமனைகள்' : 'Hospitals'}</option>
              <option value="BLOOD_BANK">{ta ? 'இரத்த வங்கிகள்' : 'Blood Banks'}</option>
              <option value="RECIPIENT">{ta ? 'நோயாளி / குடும்பம்' : 'Recipients'}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{ta ? 'பயனர் / நிறுவனம்' : 'User / Facility'}</th>
                <th className="px-4 py-3">{ta ? 'பங்கு' : 'Role'}</th>
                <th className="px-4 py-3">{ta ? 'மாவட்டம்' : 'District'}</th>
                <th className="px-4 py-3">{ta ? 'மின்னஞ்சல்' : 'Contact Email'}</th>
                <th className="px-4 py-3">{ta ? 'சரிபார்ப்பு நிலை' : 'Verification'}</th>
                <th className="px-4 py-3 text-right">{ta ? 'செயல்கள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {u.full_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {tDistrict(u.district)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ta ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{ta ? 'சரிபார்க்கப்படவில்லை' : 'Unverified'}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleVerification(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        u.is_verified
                          ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {u.is_verified ? (ta ? 'ரத்துசெய்' : 'Revoke') : (ta ? 'சரிபார்க்கவும்' : 'Verify')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>{ta ? 'கணினி தணிக்கை பதிவுகள்' : 'Immutable System Audit Logs'}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">{ta ? 'நேரம்' : 'Timestamp'}</th>
                <th className="px-4 py-2.5">{ta ? 'செயல்' : 'Action'}</th>
                <th className="px-4 py-2.5">{ta ? 'வகை' : 'Resource Type'}</th>
                <th className="px-4 py-2.5">{ta ? 'விவரங்கள்' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[11px]">
                  <td className="px-4 py-2 text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {log.resource_type}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
