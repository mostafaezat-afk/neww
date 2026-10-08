import React from 'react';
import { User, Wrench, CheckCircle2, ChevronLeft, ShieldCheck, Sparkles, Clock, ArrowRight, Zap, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface RoleSelectionModalProps {
  isOpen: boolean;
  currentRole: 'عميل' | 'فني';
  onSelectRole: (role: 'عميل' | 'فني') => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  currentRole,
  onSelectRole,
  onClose,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">تطبيق فى الخدمة للصيانة</span>
            </div>
            {canDismiss && onClose && (
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/10 transition"
              >
                إغلاق
              </button>
            )}
          </div>

          <h2 className="text-lg font-black tracking-tight text-white">
            اختر صفتك للمتابعة 🌟
          </h2>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            حدد طريقة استخدامك للتطبيق لتخصيص الواجهة والطلبات المناسبة لك
          </p>
        </div>

        {/* Roles Options */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Option 1: طالب خدمة (عميل) */}
          <div
            onClick={() => onSelectRole('عميل')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 active:scale-[0.99] ${
              currentRole === 'عميل'
                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                : 'border-slate-200/90 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl text-white ${currentRole === 'عميل' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">طالب خدمة</h3>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                      عميل
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    أبحث عن فني موثوق لصيانة المنزل أو العمل
                  </p>
                </div>
              </div>

              {currentRole === 'عميل' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">✓</span> صيانة طارئة وفورية 24/7
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">✓</span> 3 طلبات صيانة مجاناً
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">✓</span> تتبع حي لمسار الفني
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">✓</span> ضمان 30 يوماً معتمد
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('عميل');
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 mt-1 active:scale-98 ${
                currentRole === 'عميل'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>دخول كـ طالب خدمة 👤</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: مقدم خدمة (فني صيانة معتمد) */}
          <div
            onClick={() => onSelectRole('فني')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 active:scale-[0.99] ${
              currentRole === 'فني'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200/90 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl text-white ${currentRole === 'فني' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">مقدم خدمة</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                      فني / مهندس
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    استقبال طلبات الصيانة وإرسال عروض الأسعار
                  </p>
                </div>
              </div>

              {currentRole === 'فني' && (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span> تصفح طلبات مطلوبة الآن
              </span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span> إشعار العملاء بتوفرك
              </span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span> تحديد ساعات وأيام العمل
              </span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span> محفظة نقاط وأرباح فورية
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('فني');
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 mt-1 active:scale-98 ${
                currentRole === 'فني'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>دخول كـ مقدم خدمة 🔧</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-500">
            💡 يمكنك التبديل بين الصفتين في أي وقت بنقرة واحدة من أعلى الشاشة أو من الإعدادات
          </p>
        </div>
      </div>
    </div>
  );
};
