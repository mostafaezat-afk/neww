import React, { useState, useEffect } from 'react';
import { User, Phone, CheckCircle, AlertCircle, Sparkles, MapPin, ShieldCheck, ChevronLeft, LogIn, UserPlus, Gift, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { INITIAL_USERS_DIRECTORY } from '../mockData';
import { fetchUsersFromCloud, saveUserToCloud } from '../services/firebaseService';

interface RegistrationModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile, city: string) => void;
  onClose?: () => void;
  canClose?: boolean;
  initialUser?: UserProfile;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  canClose = false,
  initialUser,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'عميل' | 'فني'>('عميل');
  const [city, setCity] = useState('القاهرة');
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginError, setLoginError] = useState('');

  // Get directory of saved users from localStorage or default directory
  const [savedUsers, setSavedUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('fi_khidma_users_dir');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_USERS_DIRECTORY;
  });

  // Sync users with Cloud Firestore
  useEffect(() => {
    fetchUsersFromCloud().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setSavedUsers((prev) => {
          const merged = [...cloudUsers];
          prev.forEach((p) => {
            if (!merged.some((m) => m.phone === p.phone)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });
  }, []);

  if (!isOpen) return null;

  // Validation 1: Only Arabic letters and spaces
  const arabicOnlyRegex = /^[\u0600-\u06FF\s]+$/;
  const isArabicOnly = Boolean(name.trim()) && arabicOnlyRegex.test(name.trim());

  // Validation 2: At least two names (words), each at least 2 chars
  const nameWords = name.trim().split(/\s+/).filter((w) => w.length >= 2);
  const hasAtLeastTwoNames = nameWords.length >= 2;
  const isNameValid = isArabicOnly && hasAtLeastTwoNames;

  // Validation 3: Phone starts with 0
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');
  const startsWithZero = cleanPhone.startsWith('0');

  // Validation 4: Phone at least 11 digits & digits only
  const isDigitsOnly = /^\d+$/.test(cleanPhone);
  const isPhoneLengthValid = cleanPhone.length >= 11;
  const isPhoneValid = startsWithZero && isDigitsOnly && isPhoneLengthValid;

  const isFormValid = isNameValid && isPhoneValid;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);
    if (!isFormValid) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      role: role,
      isOnline: true,
      rating: 5.0,
      reviewsCount: 0,
      balance: 100, // starting balance
      fingerprintAuth: true,
      freeRequestsLeft: role === 'عميل' ? 3 : 0, // 3 free requests for new client!
      technicianPoints: role === 'فني' ? 50 : 0, // 50 points for tech
      reputationPoints: 100,
      city: city,
    };

    // Save to users directory
    const updatedDir = [newUser, ...savedUsers.filter((u) => u.phone !== cleanPhone)];
    setSavedUsers(updatedDir);
    localStorage.setItem('fi_khidma_users_dir', JSON.stringify(updatedDir));
    saveUserToCloud(newUser);

    onComplete(newUser, city);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanLPhone = loginPhone.trim().replace(/[\s-]/g, '');

    // Look up in saved users
    const matched = savedUsers.find(
      (u) => u.phone === cleanLPhone || (loginName.trim() && u.name.includes(loginName.trim()))
    );

    if (matched) {
      onComplete(matched, matched.city || 'القاهرة');
    } else {
      // If not in directory, allow login if valid format
      if (cleanLPhone.startsWith('0') && cleanLPhone.length >= 11 && loginName.trim()) {
        const customUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: loginName.trim(),
          phone: cleanLPhone,
          role: 'عميل',
          isOnline: true,
          rating: 5.0,
          reviewsCount: 1,
          balance: 150,
          fingerprintAuth: true,
          freeRequestsLeft: 3,
          technicianPoints: 0,
          reputationPoints: 100,
          city: 'القاهرة',
        };
        const updatedDir = [customUser, ...savedUsers];
        setSavedUsers(updatedDir);
        localStorage.setItem('fi_khidma_users_dir', JSON.stringify(updatedDir));
        onComplete(customUser, 'القاهرة');
      } else {
        setLoginError('لم يتم العثور على حساب بهذا الهاتف. يرجى التأكد من البيانات أو اختيار "اشتراك عضو جديد"');
      }
    }
  };

  const handleSelectQuickAccount = (user: UserProfile) => {
    onComplete(user, user.city || 'القاهرة');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Top Brand Banner */}
        <div className="p-4 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white text-center relative overflow-hidden">
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 left-3 text-white/80 hover:text-white p-1 rounded-full text-xs"
            >
              إلغاء ✕
            </button>
          )}
          <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md mb-1.5 font-black text-xl">
            ف
          </div>
          <h2 className="text-base font-black tracking-tight">تطبيق فى الخدمة</h2>
          <p className="text-[11px] text-blue-100 mt-0.5">
            {mode === 'register' ? 'اشتراك عضو جديد - أول 3 طلبات صيانة مجاناً' : 'تسجيل الدخول إلى حسابك'}
          </p>
        </div>

        {/* Mode Switch Tabs (اشتراك عضو جديد vs تسجيل الدخول) */}
        <div className="flex bg-slate-100 p-1 mx-4 mt-3 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>اشتراك عضو جديد</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>
        </div>

        {/* Body based on mode */}
        {mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="p-4 space-y-3.5 text-xs">
            {/* Free 3 Requests Incentive Badge */}
            <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-white rounded-xl shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-amber-900 text-xs">هدية العضو الجديد!</p>
                <p className="text-[10px] text-amber-700">لك أول 3 طلبات صيانة مجاناً تماماً فور التسجيل</p>
              </div>
            </div>

            {/* Account Type Tabs */}
            <div>
              <label className="text-slate-700 font-bold block mb-1">نوع الحساب:</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('عميل')}
                  className={`py-1.5 rounded-lg font-bold transition ${
                    role === 'عميل' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  عميل (3 طلبات مجانية)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('فني')}
                  className={`py-1.5 rounded-lg font-bold transition ${
                    role === 'فني' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  فني صيانة معتمد
                </button>
              </div>
            </div>

            {/* Arabic Name Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">الاسم باللغة العربية (اسم ثنائي):</label>
                <span className="text-rose-500 font-bold">*</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: مصطفى عزت أو محمد علي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  dir="rtl"
                  className={`w-full pl-3 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition ${
                    submittedAttempt && !isNameValid
                      ? 'border-rose-400 bg-rose-50/30'
                      : isNameValid
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>

              {/* Live Checklist */}
              <div className="mt-1 space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                    isArabicOnly ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>✓</span>
                  <span className={isArabicOnly ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    حروف عربية فقط
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                    hasAtLeastTwoNames ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>✓</span>
                  <span className={hasAtLeastTwoNames ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    لا يقل عن اسمين (اسم ثنائي)
                  </span>
                </div>
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">رقم التليفون (11 رقم يبدأ بـ 0):</label>
                <span className="text-rose-500 font-bold">*</span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="مثال: 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className={`w-full pr-3 pl-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold tracking-wider text-right focus:outline-none focus:ring-2 transition ${
                    submittedAttempt && !isPhoneValid
                      ? 'border-rose-400 bg-rose-50/30'
                      : isPhoneValid
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Live Checklist */}
              <div className="mt-1 space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                    startsWithZero ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>✓</span>
                  <span className={startsWithZero ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    يبدأ برقم 0 (010, 011, 012, 015)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                    isPhoneLengthValid && isDigitsOnly ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>✓</span>
                  <span className={isPhoneLengthValid && isDigitsOnly ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    مكون من 11 رقماً على الأقل (مكتوب: {cleanPhone.length})
                  </span>
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-slate-700 font-bold block mb-1">المحافظة / المدينة (اكتب أو اختر مدينتك):</label>
              <input
                type="text"
                list="egypt-cities"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: القاهرة، الجيزة، المنصورة، طنطا، أو أي مدينة..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <datalist id="egypt-cities">
                <option value="القاهرة" />
                <option value="الجيزة" />
                <option value="الإسكندرية" />
                <option value="الدقهلية" />
                <option value="الغربية" />
                <option value="الشرقية" />
                <option value="القليوبية" />
                <option value="المنوفية" />
                <option value="البحيرة" />
                <option value="كفر الشيخ" />
                <option value="دمياط" />
                <option value="بورسعيد" />
                <option value="الإسماعيلية" />
                <option value="السويس" />
                <option value="الفيوم" />
                <option value="بني سويف" />
                <option value="المنيا" />
                <option value="أسيوط" />
                <option value="سوهاج" />
                <option value="قنا" />
                <option value="الأقصر" />
                <option value="أسوان" />
                <option value="البحر الأحمر" />
                <option value="مطروح" />
              </datalist>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>تسجيل العضوية والحصول على 3 طلبات مجاناً</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Guest exploration */}
            <button
              type="button"
              onClick={() => {
                const guestUser: UserProfile = {
                  id: `guest-${Date.now()}`,
                  name: 'أحمد محمود (عميل)',
                  phone: '01012345678',
                  role: 'عميل',
                  isOnline: true,
                  rating: 5.0,
                  reviewsCount: 3,
                  balance: 150,
                  fingerprintAuth: true,
                  freeRequestsLeft: 3,
                  technicianPoints: 0,
                  reputationPoints: 100,
                  city: city,
                };
                localStorage.setItem('fi_khidma_user_registered', 'true');
                onComplete(guestUser, city);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>استكشاف وتجربة التطبيق كزائر (بدون تسجيل) 🚀</span>
            </button>
          </form>
        ) : (
          /* Login Form */
          <div className="p-4 space-y-4 text-xs">
            {/* Quick Switch to Known Accounts */}
            <div>
              <label className="text-slate-500 font-bold block mb-2">أو الدخول المباشر بالحسابات المسجلة:</label>
              <div className="space-y-1.5">
                {savedUsers.map((u) => (
                  <div
                    key={u.id || u.phone}
                    onClick={() => handleSelectQuickAccount(u)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {u.name.slice(0, 1)}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        u.role === 'فني' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleLoginSubmit} className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="text-slate-700 font-bold block">تسجيل برقم الهاتف والاسم:</label>
              <div>
                <input
                  type="text"
                  placeholder="الاسم المسجل"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="رقم الهاتف (11 رقم)"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-right"
                />
              </div>

              {loginError && (
                <p className="text-[11px] text-rose-500 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
