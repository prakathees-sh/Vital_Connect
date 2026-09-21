'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Droplet,
  Shield,
  PhoneCall,
  MapPin,
  MessageSquare,
  BarChart3,
  Globe,
  Sun,
  Moon,
  User,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t.nav.findBlood, href: '/inventory', icon: Droplet },
    { name: t.nav.emergencyRequests, href: '/requests', icon: AlertCircle },
    { name: t.nav.chainRescue, href: '/chain-rescue', icon: Activity },
    { name: t.nav.map, href: '/map', icon: MapPin },
    { name: t.nav.forecast, href: '/forecast', icon: BarChart3 },
    { name: t.nav.chat, href: '/chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Hotline Bar */}
      <div className="bg-vital-600 dark:bg-vital-900 text-white text-xs py-1 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 text-center font-medium flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse text-vital-200" />
          <span>{t.emergencyHelpline}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-vital-100 text-[11px]">
          <span>Tamil Nadu Emergency Blood Coordination Network</span>
          <span>•</span>
          <span>All 38 Districts Connected</span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vital-500 to-vital-700 flex items-center justify-center text-white shadow-md shadow-vital-500/30 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-current animate-heartbeat text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                VITAL<span className="text-vital-600 dark:text-vital-400">CONNECT</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 hidden md:block tracking-tighter">
                Emergency Blood Coordination
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-vital-50 dark:bg-vital-950/60 text-vital-600 dark:text-vital-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-vital-600 dark:hover:text-vital-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Request Blood Button */}
            <Link
              href="/requests/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-vital-600 hover:bg-vital-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-vital-600/25 transition-all hover:scale-102"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t.nav.requestBlood}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-1 transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-vital-600 dark:text-vital-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Session status */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/donor/dashboard'}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:ring-1 hover:ring-vital-500"
                >
                  <User className="w-3.5 h-3.5 text-vital-600 dark:text-vital-400" />
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.full_name}</span>
                  <span className="text-[10px] uppercase font-bold px-1 py-0.5 rounded bg-vital-100 dark:bg-vital-900 text-vital-700 dark:text-vital-300">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 pt-2 pb-6 space-y-1">
          <Link
            href="/requests/new"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-2 rounded-xl bg-vital-600 text-white font-bold text-sm shadow-md"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{t.nav.requestBlood}</span>
          </Link>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-vital-50 dark:bg-vital-950/80 text-vital-600 dark:text-vital-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-vital-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
