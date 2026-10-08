import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  Wrench,
  Check,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, WorkingHours } from '../types';

interface TechnicianWorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveWorkingHours: (workingHours: WorkingHours, isAvailable: boolean) => void;
  onToggleAvailability: (newAvailability: boolean) => void;
}

const ALL_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

export const TechnicianWorkingHoursModal: React.FC<TechnicianWorkingHoursModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveWorkingHours,
  onToggleAvailability,
}) => {
  const defaultHours: WorkingHours = user.workingHours || {
    enabled: true,
    startTime: '09:00',
    endTime: '19:00',
    days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    autoToggleAvailability: true,
    notes: 'متاح للصيانات الفورية والطارئة',
  };

  const [startTime, setStartTime] = useState(defaultHours.startTime || '09:00');
  const [endTime, setEndTime] = useState(defaultHours.endTime || '19:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    defaultHours.days || ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
  );
  const [autoToggle, setAutoToggle] = useState<boolean>(
    defaultHours.autoToggleAvailability ?? true
  );
  const [notes, setNotes] = useState(defaultHours.notes || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(
    user.isAvailableForWork ?? true
  );

  // Sync internal state whenever modal opens or user profile changes
  React.useEffect(() => {
    if (isOpen) {
      const currentH = user.workingHours || defaultHours;
      setStartTime(currentH.startTime || '09:00');
      setEndTime(currentH.endTime || '19:00');
      setSelectedDays(currentH.days || ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']);
      setAutoToggle(currentH.autoToggleAvailability ?? true);
      setNotes(currentH.notes || '');
      setIsAvailable(user.isAvailableForWork ?? true);
    }
  }, [isOpen, user.isAvailableForWork, user.workingHours]);

  if (!isOpen) return null;

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WorkingHours = {
      enabled: true,
      startTime,
      endTime,
      days: selectedDays,
      autoToggleAvailability: autoToggle,
      notes: notes.trim() || undefined,
    };
    onSaveWorkingHours(updated, isAvailable);
    onClose();
  };

  const handleQuickAvailabilitySwitch = (newVal: boolean) => {
    setIsAvailable(newVal);
    onToggleAvailability(newVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-xs text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">ساعات عمل وتوفر الفني ⏱️</h3>
              <p className="text-[11px] text-blue-100">
                حدد مواعيدك اليومية وتنبيهات العملاء الفورية عند التوفر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Availability Toggle Banner */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-b border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl text-white ${isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}>
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">
                  {isAvailable ? 'حالتك الآن: متاح للعمل 🟢' : 'حالتك الآن: غير متاح / استراحة ⏸️'}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isAvailable ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isAvailable ? 'نشط أونلاين' : 'متوقف مؤقتاً'}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {isAvailable
                  ? 'يتم إشعار العملاء في موقعك بتوفرك لاستقبال طلبات الصيانة فوراً'
                  : 'لن يتم إرسال طلبات جديدة إليك أثناء فترة الاستراحة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleQuickAvailabilitySwitch(!isAvailable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 shrink-0 ${
              isAvailable
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAvailable ? 'إيقاف مؤقت ⏸️' : 'دخول متاح 🟢'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-4 space-y-4 text-xs">
          {/* Notification Explainer */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-slate-700">
            <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              عند تفعيل وضع <strong>"متاح للعمل"</strong>، يرسل النظام تلقائياً إشعار دفع (Push Notification) للعملاء لإبلاغهم بأنك جاهز ومستعد لتنفيذ المهام الآن!
            </p>
          </div>

          {/* Daily Work Hours */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>مواعيد العمل اليومية:</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 block mb-1">وقت البدء (صباحاً):</span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs font-bold bg-white p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 block mb-1">وقت الانتهاء (مساءً):</span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs font-bold bg-white p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Active Work Days */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>أيام العمل الأسبوعية:</span>
            </label>

            <div className="grid grid-cols-4 gap-1.5">
              {ALL_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition active:scale-95 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-schedule option */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                تفعيل وضع التوفر تلقائياً
              </span>
              <span className="text-[10px] text-slate-500 block">
                تحديث حالتك إلى "متاح للعمل" تلقائياً عند حلول موعد بدء العمل اليومي
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoToggle}
              onChange={(e) => setAutoToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Notes / Specialization summary */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              ملاحظات ساعات العمل للعملاء (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثال: متاح للصيانات الفورية والطارئة 24/7 أو خلال ساعات العمل الرسمية"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>حفظ جدول ساعات العمل والتوفر 💾</span>
          </button>
        </form>
      </div>
    </div>
  );
};
