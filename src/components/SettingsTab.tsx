import React, { useState, useRef } from 'react';
import {
  User,
  Eye,
  MoreHorizontal,
  Check,
  Wallet,
  Settings as SettingsIcon,
  LifeBuoy,
  Shield,
  Fingerprint,
  ChevronLeft,
  Star,
  RefreshCw,
  Smartphone,
  Edit3,
  LogOut,
  Gift,
  Zap,
  Award,
  PhoneCall,
  Sparkles,
  Lock,
  ShieldCheck,
  Bell,
  Clock,
  Wrench,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsTabProps {
  user: UserProfile;
  offersCount: number;
  inProgressCount: number;
  completedCount: number;
  onOpenSettingsModal: () => void;
  onOpenWalletModal: () => void;
  onOpenSupportTab: () => void;
  onOpenPermissionsModal: () => void;
  onOpenRegistrationModal: () => void;
  onOpenInstallShareModal: () => void;
  onOpenAdminRecharge?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenAdminAuth?: () => void;
  onLogoutAdmin?: () => void;
  isAdmin?: boolean;
  onLogout: () => void;
  onToggleFingerprint: () => void;
  onToggleRole: () => void;
  onOpenNotificationsModal?: () => void;
  unreadNotificationsCount?: number;
  onOpenWorkingHoursModal?: () => void;
  onToggleTechnicianAvailability?: (isAvailable: boolean) => void;
  onOpenRoleSelection?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  offersCount,
  inProgressCount,
  completedCount,
  onOpenSettingsModal,
  onOpenWalletModal,
  onOpenSupportTab,
  onOpenPermissionsModal,
  onOpenRegistrationModal,
  onOpenInstallShareModal,
  onOpenAdminRecharge,
  onOpenAdminDashboard,
  onOpenAdminAuth,
  onLogoutAdmin,
  isAdmin = false,
  onLogout,
  onToggleFingerprint,
  onToggleRole,
  onOpenNotificationsModal,
  unreadNotificationsCount = 0,
  onOpenWorkingHoursModal,
  onToggleTechnicianAvailability,
  onOpenRoleSelection,
}) => {
  // Secret Easter Egg Admin Gateway (Hides admin portal completely from regular users)
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [tapHint, setTapHint] = useState<string | null>(null);
  const tapTimerRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);

  const handleSecretVersionTap = () => {
    if (isAdmin) return;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    const nextCount = secretTapCount + 1;
    setSecretTapCount(nextCount);

    if (nextCount >= 5) {
      setSecretTapCount(0);
      setTapHint(null);
      if (onOpenAdminAuth) onOpenAdminAuth();
    } else if (nextCount >= 3) {
      setTapHint(`تبقى ${5 - nextCount}`);
      tapTimerRef.current = setTimeout(() => {
        setSecretTapCount(0);
        setTapHint(null);
      }, 2500);
    } else {
      tapTimerRef.current = setTimeout(() => {
        setSecretTapCount(0);
        setTapHint(null);
      }, 2500);
    }
  };

  const handleTouchStart = () => {
    if (isAdmin) return;
    longPressTimerRef.current = setTimeout(() => {
      if (onOpenAdminAuth) onOpenAdminAuth();
    }, 1800);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  return (
    <div className="flex flex-col min-h-full pb-20 px-4">
      {/* Top Header - Matching Screenshot 2 & 3 */}
      <div className="pt-3 pb-4 flex items-center justify-between">
        {/* Left: Role Pill Badge */}
        <button
          onClick={onOpenRoleSelection || onToggleRole}
          title="اضغط لتحديد صفتك (طالب خدمة أو مقدم خدمة)"
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full shadow-2xs transition active:scale-95 flex items-center gap-1.5 border ${
            user.role === 'فني'
              ? 'bg-slate-900 text-emerald-400 border-slate-800'
              : 'bg-white text-blue-700 border-blue-200/90'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${user.role === 'فني' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-600'}`} />
          <span>{user.role === 'فني' ? 'مقدم خدمة 🔧' : 'طالب خدمة 👤'}</span>
          <span className="text-[10px] text-slate-400">تبديل ⇄</span>
        </button>

        {/* Right: Screen Title "الإعدادات" */}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">الإعدادات</h1>
      </div>

      {/* User Profile Section - Matching Screenshot 2 & 3 */}
      <div className="flex items-center justify-between py-2 mb-4">
        {/* Rating on the Left */}
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-xs font-bold text-slate-700 ml-1">{user.rating > 0 ? user.rating : '0'}</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                user.rating >= star
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 fill-transparent'
              }`}
            />
          ))}
        </div>

        {/* User Info & Avatar on the Right */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-500">
                {user.isOnline ? 'متصل الآن' : 'غير متصل'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* Avatar with green online dot */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#cbd5e1] flex items-center justify-center text-slate-600">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* Rewards & Points Strip */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {user.role === 'عميل' ? (
          <div
            onClick={onOpenWalletModal}
            className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-2 cursor-pointer hover:border-amber-400 transition"
          >
            <div className="p-1.5 bg-amber-500 text-white rounded-xl">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-800 font-bold block">طلباتك المجانية</span>
              <span className="text-xs font-black text-amber-900">{user.freeRequestsLeft || 0} من 3 متبقية</span>
            </div>
          </div>
        ) : (
          <div
            onClick={onOpenWalletModal}
            className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center gap-2 cursor-pointer hover:border-blue-400 transition"
          >
            <div className="p-1.5 bg-blue-600 text-white rounded-xl">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-blue-800 font-bold block">نقاط التواصل (-5)</span>
              <span className="text-xs font-black text-blue-900">{user.technicianPoints || 0} نقطة</span>
            </div>
          </div>
        )}

        <div className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 text-white rounded-xl">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold block">نقاط السمعة والتقييم</span>
            <span className="text-xs font-black text-slate-800">{user.reputationPoints || 100} نقطة ثقة</span>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards - Matching Screenshot 2 & 3 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Card 1: العروض */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-slate-500 mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">العروض</span>
          </div>
          <span className="text-base font-bold text-slate-900">{offersCount}</span>
        </div>

        {/* Card 2: قيد التنفيذ */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-slate-500 mb-1">
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">قيد التنفيذ</span>
          </div>
          <span className="text-base font-bold text-slate-900">{inProgressCount}</span>
        </div>

        {/* Card 3: مكتملة */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-slate-500 mb-1">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">مكتملة</span>
          </div>
          <span className="text-base font-bold text-slate-900">{completedCount}</span>
        </div>
      </div>

      {/* Technician Working Hours & Availability Card - ONLY when role is فني */}
      {user.role === 'فني' && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-4 shadow-md mb-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.isAvailableForWork ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-xs font-black">
                {user.isAvailableForWork ? 'حالتك: متاح للعمل الآن 🟢' : 'حالتك: غير متاح (استراحة) ⏸️'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onToggleTechnicianAvailability) {
                  onToggleTechnicianAvailability(!user.isAvailableForWork);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 ${
                user.isAvailableForWork
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
              }`}
            >
              {user.isAvailableForWork ? 'إيقاف مؤقت ⏸️' : 'دخول متاح 🟢'}
            </button>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-blue-200 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>مواعيد العمل اليومية:</span>
              </div>
              <p className="text-xs font-black text-white mt-0.5 font-mono">
                {user.workingHours?.startTime || '09:00'} إلى {user.workingHours?.endTime || '19:00'}
              </p>
              <p className="text-[10px] text-blue-200 truncate mt-0.5">
                {(user.workingHours?.days || ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']).join('، ')}
              </p>
            </div>

            {onOpenWorkingHoursModal && (
              <button
                type="button"
                onClick={onOpenWorkingHoursModal}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 transition active:scale-95 shadow-xs flex items-center gap-1"
              >
                <span>تعديل الساعات ⏱️</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-blue-200/80 mt-2.5 leading-relaxed">
            🔔 عند الدخول في وضع <strong>"متاح للعمل"</strong>، يرسل النظام تلقائياً إشعار دفع (Push Notification) للعملاء لإبلاغهم بجاهزيتك الفورية.
          </p>
        </div>
      )}

      {/* Balance Card - Matching Screenshot 2 & 3 */}
      <div
        onClick={onOpenWalletModal}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs mb-5 cursor-pointer hover:border-blue-300 transition"
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <span className="text-xs font-medium">الرصيد</span>
            <Wallet className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {user.balance} جنيه
          </div>
        </div>
      </div>

      {/* Section Header: الإعدادات ⚙️ */}
      <div className="flex items-center justify-end gap-1 text-slate-600 text-xs font-bold mb-2 px-1">
        <span>الإعدادات</span>
        <SettingsIcon className="w-3.5 h-3.5" />
      </div>

      {/* First Card: الإعدادات (Single item) */}
      <div
        onClick={onOpenSettingsModal}
        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs mb-3 flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
      >
        <ChevronLeft className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800">الإعدادات</span>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <SettingsIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Second Card: Grouped list (Wallet, Support, Permissions, Fingerprint) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {/* ساعات عمل وتوفر الفني (فقط عند وضع الفني) */}
        {user.role === 'فني' && onOpenWorkingHoursModal && (
          <div
            onClick={onOpenWorkingHoursModal}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition bg-blue-50/20"
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user.isAvailableForWork ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {user.isAvailableForWork ? 'متاح الآن 🟢' : 'استراحة ⏸️'}
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">ساعات العمل والتوفر اليومي</span>
                <span className="text-[10px] text-slate-400">
                  {user.workingHours?.startTime || '09:00'} - {user.workingHours?.endTime || '19:00'} وإشعارات العملاء
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* المحفظة */}
        <div
          onClick={onOpenWalletModal}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">المحفظة</span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* لوحة تحكم الأدمن الكاملة (الأقسام والخدمات والإعدادات) - تظهر للمدير فقط */}
        {isAdmin && onOpenAdminDashboard && (
          <div
            onClick={onOpenAdminDashboard}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition bg-slate-900 text-white rounded-2xl mx-2 my-2 shadow-md border border-amber-400/30"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                Admin Panel
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-black text-white block">لوحة تحكم الإدارة الكاملة</span>
                <span className="text-[10px] text-amber-300">إضافة/حذف أقسام، خدمات، وإعدادات التطبيق</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <SettingsIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* شحن رصيد مستخدم (لوحة الدعم الفني والإدارة) - تظهر للمدير فقط */}
        {isAdmin && onOpenAdminRecharge && (
          <div
            onClick={onOpenAdminRecharge}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition bg-gradient-to-r from-blue-50/30 to-transparent"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>لوحة الدعم</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-blue-950 block">شحن رصيد مستخدم</span>
                <span className="text-[10px] text-blue-600">لوحة الدعم الفني لشحن الرصيد والنقاط</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* التواصل مع الدعم */}
        <div
          onClick={onOpenSupportTab}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">التواصل مع الدعم</span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* الصلاحيات */}
        <div
          onClick={onOpenPermissionsModal}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">الصلاحيات</span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* التنبيهات الفورية (Push Notifications FCM) */}
        {onOpenNotificationsModal && (
          <div
            onClick={onOpenNotificationsModal}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-1.5">
              {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 ? (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                  {unreadNotificationsCount} جديد
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  FCM نشط ⚡
                </span>
              )}
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">التنبيهات الفورية (FCM)</span>
                <span className="text-[10px] text-slate-400">إشعارات عروض الفنيين وتحديثات الطلبات</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Bell className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* تثبيت ومشاركة التطبيق (Web vs APK) */}
        <div
          onClick={onOpenInstallShareModal}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition bg-blue-50/40"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
              PWA / APK
            </span>
            <ChevronLeft className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-blue-900 block">تثبيت ومشاركة التطبيق</span>
              <span className="text-[10px] text-blue-600">واتساب، جوجل درايف، وشاشة الهاتف</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* تعديل الاسم ورقم الهاتف */}
        <div
          onClick={onOpenRegistrationModal}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">تعديل الاسم ورقم الهاتف (بالعربية)</span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* فتح التطبيق ببصمة الإصبع (with toggle switch) */}
        <div className="p-3.5 flex items-center justify-between">
          {/* Custom iOS/Android Toggle Switch */}
          <button
            type="button"
            onClick={onToggleFingerprint}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              user.fingerprintAuth ? 'bg-[#173b61]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                user.fingerprintAuth ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">فتح التطبيق ببصمة الإصبع</span>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* تسجيل الخروج والدخول باسم عضو آخر */}
        <div
          onClick={onLogout}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-50 transition"
        >
          <div className="flex items-center gap-1 text-rose-500">
            <span className="text-[11px] font-bold">خروج</span>
            <ChevronLeft className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-rose-600 block">تسجيل الخروج</span>
              <span className="text-[10px] text-slate-400">والتسجيل باسم عضو آخر</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Admin Session Status - ONLY visible to authenticated admin */}
      {isAdmin && (
        <div className="mt-4 pt-2 border-t border-slate-200/70">
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex items-center justify-between border border-amber-400/40 shadow-sm">
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>قفل وخروج الإدارة</span>
            </button>
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-xs font-black text-amber-300 block">جلسة المشرف نشطة 👑</span>
                <span className="text-[10px] text-slate-300">أنت في وضع التحكم الكامل</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Discreet App Version Footer with Easter Egg Secret Admin Gateway */}
      <div className="mt-6 pb-2 text-center select-none">
        <div
          onClick={handleSecretVersionTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          className="inline-flex flex-col items-center justify-center cursor-default py-1.5 px-4 rounded-xl hover:bg-slate-100/60 active:opacity-75 transition"
          title="معلومات التطبيق"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>تطبيق فى الخدمة</span>
            <span>•</span>
            <span>الإصدار 1.4.0</span>
            {tapHint && (
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-md font-bold animate-pulse">
                {tapHint}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400/80 mt-0.5">
            جميع الحقوق محفوظة للمنصة © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
};
