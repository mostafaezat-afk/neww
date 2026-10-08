import React, { useState } from 'react';
import {
  Home,
  MessageSquarePlus,
  LifeBuoy,
  Settings as SettingsIcon,
  Smartphone,
  Maximize2,
  Briefcase,
  Wrench,
  ArrowRightLeft,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export type ActiveNavTab = 'home' | 'tasks' | 'tech_market' | 'tech_services' | 'support' | 'settings';

interface AndroidLayoutProps {
  children: React.ReactNode;
  activeTab: ActiveNavTab;
  onChangeTab: (tab: ActiveNavTab) => void;
  onBackPress?: () => void;
  userRole?: 'عميل' | 'فني';
  onOpenRoleSelection?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const AndroidLayout: React.FC<AndroidLayoutProps> = ({
  children,
  activeTab,
  onChangeTab,
  userRole = 'عميل',
  onOpenRoleSelection,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) => {
  // Default to wide desktop view on large screens for a professional experience, while allowing mobile frame view
  const [isDeviceFrame, setIsDeviceFrame] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-900/95 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950/80 to-slate-950 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 md:p-6 select-none transition-colors duration-300">
      {/* Top Desktop Frame Control Switcher */}
      <aside aria-label="شريط التحكم في نمط العرض" className="hidden sm:flex items-center justify-between w-full max-w-5xl mb-3 px-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>منصة فى الخدمة للصيانة المعتمدة</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            مباشر 24/7
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-semibold transition border border-slate-700/80 shadow-sm hover:border-slate-600 active:scale-95"
            title="التبديل بين وضع سطح المكتب الكامل ومعاينة الجوال"
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5 text-blue-400" /> : <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isDeviceFrame ? 'توسيع الشاشة (كامل العرض)' : 'معاينة وضع الجوال (Mobile)'}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full flex flex-col bg-[#f8fafc] overflow-hidden transition-all duration-300 ${
          isDeviceFrame
            ? 'w-full h-screen sm:max-w-[430px] sm:h-[92vh] sm:max-h-[890px] sm:rounded-[38px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] sm:border-[6px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 relative'
            : 'w-full max-w-5xl min-h-screen sm:min-h-[88vh] sm:rounded-3xl shadow-2xl border border-slate-200/80'
        }`}
      >
        {/* Professional Top Navigation Header */}
        <header className="w-full bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between text-slate-800 z-30 shrink-0 border-b border-slate-200/80 shadow-xs">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">فى الخدمة</span>
                <span className="hidden sm:inline-block text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded-md font-bold">
                  الصيانة المنزلية
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">فنيون معتمدون بضمان معتمد</p>
            </div>
          </div>

          {/* Center / Right Actions: Role Switcher & Notifications */}
          <div className="flex items-center gap-2">
            {/* Role Switcher Pill */}
            {onOpenRoleSelection && (
              <button
                onClick={onOpenRoleSelection}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs border ${
                  userRole === 'فني'
                    ? 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800 hover:text-emerald-300'
                    : 'bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100/80'
                }`}
                title="انقر للتبديل بين وضع العميل ومقدم الخدمة"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    userRole === 'فني' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-600'
                  }`}
                />
                <span className="text-[11px] sm:text-xs">
                  {userRole === 'فني' ? 'حساب فني 🔧' : 'طالب خدمة 👤'}
                </span>
                <ArrowRightLeft className="w-3 h-3 text-slate-400 mr-0.5" />
              </button>
            )}

            {/* Notification Bell */}
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition active:scale-95 border border-slate-200/60"
                title="التنبيهات والإشعارات"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Screen Content Viewport */}
        <main className="flex-1 overflow-y-auto relative no-scrollbar bg-[#f8fafc]">
          {children}
        </main>

        {/* Modern Bottom Navigation Bar */}
        <nav aria-label="شريط التنقل السفلي" className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 flex items-center justify-around z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          {userRole === 'فني' ? (
            /* --- Technician (مقدم خدمة) Bottom Navigation --- */
            <>
              {/* 1. خدمات مطلوبة الآن */}
              <button
                type="button"
                onClick={() => onChangeTab('tech_market')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'tech_market'
                      ? 'bg-slate-900 text-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase
                    className={`w-4 h-4 ${activeTab === 'tech_market' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'tech_market' ? 'text-slate-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الطلبات المتاحة
                </span>
              </button>

              {/* 2. خدماتي الحالية */}
              <button
                type="button"
                onClick={() => onChangeTab('tech_services')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'tech_services'
                      ? 'bg-slate-900 text-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Wrench
                    className={`w-4 h-4 ${activeTab === 'tech_services' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'tech_services' ? 'text-slate-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  خدماتي وأسعاري
                </span>
              </button>

              {/* 3. الدعم */}
              <button
                type="button"
                onClick={() => onChangeTab('support')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'support'
                      ? 'bg-slate-900 text-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LifeBuoy
                    className={`w-4 h-4 ${activeTab === 'support' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'support' ? 'text-slate-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الدعم الفني
                </span>
              </button>

              {/* 4. الإعدادات */}
              <button
                type="button"
                onClick={() => onChangeTab('settings')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-slate-900 text-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <SettingsIcon
                    className={`w-4 h-4 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'settings' ? 'text-slate-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الإعدادات
                </span>
              </button>
            </>
          ) : (
            /* --- Customer (طالب خدمة) Bottom Navigation --- */
            <>
              {/* 1. الرئيسية */}
              <button
                type="button"
                onClick={() => onChangeTab('home')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'home'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home
                    className={`w-4 h-4 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'home' ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الرئيسية
                </span>
              </button>

              {/* 2. طلباتي */}
              <button
                type="button"
                onClick={() => onChangeTab('tasks')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'tasks'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquarePlus
                    className={`w-4 h-4 ${activeTab === 'tasks' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'tasks' ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  طلباتي
                </span>
              </button>

              {/* 3. الدعم */}
              <button
                type="button"
                onClick={() => onChangeTab('support')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'support'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LifeBuoy
                    className={`w-4 h-4 ${activeTab === 'support' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'support' ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الدعم الفني
                </span>
              </button>

              {/* 4. الإعدادات */}
              <button
                type="button"
                onClick={() => onChangeTab('settings')}
                className="flex flex-col items-center justify-center py-1 px-3 group transition-transform active:scale-95"
              >
                <div
                  className={`p-1.5 px-3.5 rounded-full transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <SettingsIcon
                    className={`w-4 h-4 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition ${
                    activeTab === 'settings' ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  الإعدادات
                </span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};
