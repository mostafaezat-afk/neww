import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPassword?: string;
  currentPin?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPassword = 'admin2026',
  currentPin = '8899',
}) => {
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpHint, setShowHelpHint] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check credentials against saved or props
    const validPassword = localStorage.getItem('fi_khidma_admin_pwd') || currentPassword;
    const validPin = localStorage.getItem('fi_khidma_admin_pin') || currentPin;

    if (!password.trim()) {
      setErrorMsg('يرجى إدخال كلمة مرور الإدارة');
      return;
    }

    if (!pin.trim()) {
      setErrorMsg('يرجى إدخال الرقم السري الخاص (PIN)');
      return;
    }

    if (password.trim() === validPassword && pin.trim() === validPin) {
      // Success
      setErrorMsg('');
      setPassword('');
      setPin('');
      onSuccess();
    } else {
      setErrorMsg('بيانات الدخول غير صحيحة! تأكد من كلمة المرور والرقم السري الخاص بالإدارة.');
    }
  };

  const handleQuickFillDefaults = () => {
    const validPassword = localStorage.getItem('fi_khidma_admin_pwd') || currentPassword;
    const validPin = localStorage.getItem('fi_khidma_admin_pin') || currentPin;
    setPassword(validPassword);
    setPin(validPin);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg mb-3">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex items-center gap-2">
            <h3 className="text-base font-black tracking-tight">بوابة إدارة النظام</h3>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
              خاص بالمسؤولين
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            بوابة مخصصة لمدير التطبيق للتحكم في الأقسام والخدمات والأسعار والمستخدمين.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Field 1: Admin Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              كلمة مرور الإدارة (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                className="w-full text-xs p-3 pr-10 pl-10 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute left-3 top-2.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 2: Secret PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              الرقم السري الخاص (Secret PIN)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="أدخل الرقم السري..."
                className="w-full text-xs p-3 pr-10 pl-10 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono tracking-widest"
              />
              <ShieldAlert className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute left-3 top-2.5"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Helper for Admin Testing */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>بيانات دخول المسؤول الافتراضية:</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFillDefaults}
                className="text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
              >
                تعبئة تلقائية ⚡
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100">
              <span>كلمة المرور: <strong className="text-slate-800">admin2026</strong></span>
              <span>الرقم السري: <strong className="text-slate-800">8899</strong></span>
            </div>
            <p className="text-[9px] text-slate-400">
              * يمكنك تغيير كلمة المرور والرقم السري لاحقاً من داخل لوحة التحكم بكل سهولة.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>تسجيل الدخول وفتح لوحة الإدارة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
