import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronLeft,
  Wrench,
  Wind,
  Hammer,
  Cpu,
  Paintbrush,
  Truck,
  Star,
  Navigation,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { LocationData, ServiceCategory } from '../types';
import { SERVICE_CATEGORIES } from '../mockData';

interface HomeTabProps {
  currentLocation: LocationData;
  onOpenLocationPicker: () => void;
  onSelectService: (category: ServiceCategory) => void;
  onOpenEmergencyRequest: () => void;
  onOpenInstallShare?: () => void;
  categories?: ServiceCategory[];
  onRequestCurrentLocation?: () => void;
  isLocatingGPS?: boolean;
  isCurrentLocationSelected?: boolean;
  onOpenAdminDashboard?: () => void;
  isAdmin?: boolean;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  userRole?: 'عميل' | 'فني';
  isAvailableForWork?: boolean;
  onToggleTechnicianAvailability?: (isAvailable: boolean) => void;
  onOpenWorkingHours?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentLocation,
  onOpenLocationPicker,
  onSelectService,
  onOpenEmergencyRequest,
  onOpenInstallShare,
  categories = SERVICE_CATEGORIES,
  onRequestCurrentLocation,
  isLocatingGPS = false,
  isCurrentLocationSelected = true,
  onOpenAdminDashboard,
  isAdmin = false,
  userRole = 'عميل',
  isAvailableForWork = true,
  onToggleTechnicianAvailability,
  onOpenWorkingHours,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Hammer': return <Hammer className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredCategories = categories.filter((c) =>
    searchQuery ? c.name.includes(searchQuery) || c.description.includes(searchQuery) : true
  );

  return (
    <div className="flex flex-col min-h-full pb-20 px-3 sm:px-5 space-y-4 max-w-5xl mx-auto w-full">
      {/* 1. Technician Status Header Bar (Only if user is a technician) */}
      {userRole === 'فني' && (
        <div className="mt-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-blue-500/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-3 h-3 rounded-full ${isAvailableForWork ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'} shrink-0`} />
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold block truncate">
                {isAvailableForWork ? 'حالة العمل: متاح لاستقبال الطلبات 🟢' : 'حالة العمل: غير متاح (استراحة مؤقتة) ⏸️'}
              </span>
              <span className="text-[11px] text-blue-200 truncate block">
                {isAvailableForWork ? 'تتلقى الآن إشعارات بطلبات الصيانة القريبة منك فوراً' : 'اضغط على الزر لتفعيل استقبال الطلبات'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleTechnicianAvailability && onToggleTechnicianAvailability(!isAvailableForWork)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm ${
                isAvailableForWork
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
              }`}
            >
              {isAvailableForWork ? 'أخذ استراحة ⏸️' : 'تفعيل الاستقبال 🟢'}
            </button>
            {onOpenWorkingHours && (
              <button
                type="button"
                onClick={onOpenWorkingHours}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                title="جدول ساعات العمل"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">ساعات العمل</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Unified, Elegant Location Selector Bar */}
      <div className="pt-3">
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-400/80 transition-all">
          <div
            onClick={onOpenLocationPicker}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">موقع طلب الصيانة</span>
                <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full flex items-center gap-1 ${
                  isCurrentLocationSelected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                }`}>
                  {isCurrentLocationSelected ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>موقعي الحالي (GPS)</span>
                    </>
                  ) : (
                    'عنوان محدد يدوياً'
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5">
                {currentLocation.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onRequestCurrentLocation && (
              <button
                type="button"
                onClick={onRequestCurrentLocation}
                disabled={isLocatingGPS}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center active:scale-95"
                title="تحديث موقعي عبر GPS"
              >
                <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocatingGPS ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs active:scale-95"
            >
              تغيير ⌵
            </button>
          </div>
        </div>
      </div>

      {/* 3. Non-intrusive App Install Banner (Optional / Dismissible) */}
      {!dismissInstallBanner && onOpenInstallShare && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/70 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-950 truncate">
                ثبّت تطبيق فى الخدمة على هاتفك
              </p>
              <p className="text-[10px] text-blue-700 truncate">
                لتجربة أسرع بدون متصفح وتنبيهات فورية عند وصول الفني
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenInstallShare}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
            >
              تثبيت
            </button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
              title="إخفاء"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4. Admin Access Banner (Visible Only to Admins) */}
      {isAdmin && onOpenAdminDashboard && (
        <div
          onClick={onOpenAdminDashboard}
          className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:opacity-95 shadow-md border border-amber-400/40 transition"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">⚙️ الإدارة</span>
            <div>
              <span className="text-xs font-black text-amber-300 block">
                لوحة تحكم المسؤول (نشطة)
              </span>
              <span className="text-[10px] text-slate-300">
                إدارة الأقسام والخدمات والأسعار ومراجعة الفنيين
              </span>
            </div>
          </div>
          <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-xl">
            فتح اللوحة
          </span>
        </div>
      )}

      {/* 5. Hero Banner & Emergency Callout */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 shadow-lg border border-slate-800/80">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 mb-2 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ضمان جودة معتمد 30 يوماً</span>
          </div>
          <h2 className="text-base sm:text-xl font-black leading-snug tracking-tight text-white">
            عطل مفاجئ في البيت أو العمل؟ <br />
            فنيون معتمدون يصلون لموقعك في دقائق ⚡
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg leading-relaxed">
            اختر الخدمة المطلوبة، وحدد موعد الزيارة، وتتبع مسار الفني على الخريطة مباشرة مع تسعير واضح وضمان صيانة معتمد.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <button
              onClick={onOpenEmergencyRequest}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>طلب طوارئ فوري 🚨</span>
            </button>
            <button
              onClick={onOpenLocationPicker}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>موقعي على الخريطة</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Quick Guarantee Badges Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
          <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
          <h5 className="font-bold text-slate-800 text-[11px] sm:text-xs">ضمان 30 يوم</h5>
          <p className="text-[10px] text-slate-400">على كل أعمال الصيانة</p>
        </div>
        <div className="p-2 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
          <Clock className="w-5 h-5 text-emerald-600 mb-1" />
          <h5 className="font-bold text-slate-800 text-[11px] sm:text-xs">دقة في المواعيد</h5>
          <p className="text-[10px] text-slate-400">وصول سريع وتتبع حي</p>
        </div>
        <div className="p-2 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
          <Star className="w-5 h-5 text-amber-500 mb-1" />
          <h5 className="font-bold text-slate-800 text-[11px] sm:text-xs">فنيون معتمدون</h5>
          <p className="text-[10px] text-slate-400">فحص هوية وخبرة عملية</p>
        </div>
      </div>

      {/* 7. Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن سباك، تكييف، كهربائي، نجارة، أجهزة منزلية..."
          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {/* 8. Service Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">الخدمات المتاحة</h3>
          <span className="text-[11px] sm:text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
            {categories.length} خدمات معتمدة
          </span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">لا توجد خدمة تطابق: "{searchQuery}"</p>
            <p className="text-[11px] text-slate-400 mt-1">جرب البحث بكلمات أخرى أو استعرض الأقسام الشائعة</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-xs"
            >
              عرض جميع الخدمات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => onSelectService(category)}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-xl text-white ${category.color} group-hover:scale-105 transition-transform shadow-2xs`}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>
                  {category.badge && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md">
                      {category.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">
                    {category.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-extrabold text-blue-700">من {category.basePrice} ج.م</span>
                    <span className="text-slate-400 group-hover:text-blue-600 transition flex items-center gap-0.5 font-bold text-[11px]">
                      اطلب <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. Nearby Active Technicians */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              فنيون معتمدون متواجدون الآن بالقرب من {currentLocation.district || 'موقعك'}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            جاهزون للخدمة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80"
              alt="tech"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 text-xs truncate">م/ أحمد حسني</p>
                <span className="text-amber-500 font-bold text-[10px]">⭐ 4.9</span>
              </div>
              <p className="text-[11px] text-slate-500">سباكة وصيانة مضخات • 1.8 كم</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="tech"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 text-xs truncate">م/ محمود رحيم</p>
                <span className="text-amber-500 font-bold text-[10px]">⭐ 4.8</span>
              </div>
              <p className="text-[11px] text-slate-500">كهرباء منازل وأجهزة • 2.5 كم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
