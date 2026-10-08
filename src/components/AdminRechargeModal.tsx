import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Wallet,
  Zap,
  Gift,
  CheckCircle2,
  PhoneCall,
  User,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  subscribeToAllUsers,
  rechargeUserInCloud,
} from '../services/firebaseService';

interface AdminRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserRecharged?: (updatedUser: UserProfile) => void;
}

export const AdminRechargeModal: React.FC<AdminRechargeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserRecharged,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Recharge inputs
  const [balanceAmount, setBalanceAmount] = useState<number>(100);
  const [customBalance, setCustomBalance] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<number>(50);
  const [freeRequestsAmount, setFreeRequestsAmount] = useState<number>(3);

  // Status
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToAllUsers((cloudUsers) => {
      setUsers(cloudUsers);
      // If none selected, default to current user
      if (!selectedUser && cloudUsers.length > 0) {
        const foundCurrent = cloudUsers.find(
          (u) => u.phone === currentUser.phone || u.id === currentUser.id
        );
        setSelectedUser(foundCurrent || cloudUsers[0]);
      } else if (selectedUser) {
        const updated = cloudUsers.find(
          (u) => u.phone === selectedUser.phone || u.id === selectedUser.id
        );
        if (updated) setSelectedUser(updated);
      }
    });

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.role && u.role.includes(q))
    );
  });

  const handleSelectUser = (u: UserProfile) => {
    setSelectedUser(u);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleRechargeSubmit = async (type: 'balance' | 'points' | 'free_requests') => {
    if (!selectedUser) {
      setErrorMessage('يرجى اختيار المستخدم أولاً.');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const targetKey = selectedUser.phone || selectedUser.id;
    let bDelta = 0;
    let pDelta = 0;
    let rDelta = 0;

    if (type === 'balance') {
      const amt = customBalance ? parseFloat(customBalance) : balanceAmount;
      if (isNaN(amt) || amt <= 0) {
        setErrorMessage('يرجى تحديد مبلغ شحن صحيح أكبر من صفر.');
        setLoading(false);
        return;
      }
      bDelta = amt;
    } else if (type === 'points') {
      pDelta = pointsAmount;
    } else if (type === 'free_requests') {
      rDelta = freeRequestsAmount;
    }

    const res = await rechargeUserInCloud(targetKey, bDelta, pDelta, rDelta);
    setLoading(false);

    if (res.success && res.updatedUser) {
      setSuccessMessage(res.message);
      setSelectedUser(res.updatedUser);
      if (onUserRecharged && (res.updatedUser.phone === currentUser.phone || res.updatedUser.id === currentUser.id)) {
        onUserRecharged(res.updatedUser);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/80 text-white">
              <PhoneCall className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm">لوحة الدعم الفني: شحن رصيد المستخدمين</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  سحابي فوري ⚡
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                تزويد المحفظة بالجنيه والنقاط والطلبات المجانية وتحديثها لحظياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold flex items-start gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-bold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* User Search & Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>١. اختر أو ابحث عن العضو المراد شحن حسابه:</span>
              <span className="text-[10px] text-slate-400">
                {users.length} أعضاء مسجلين سحابياً
              </span>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو برقم التليفون (مثال: 010...)"
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Quick List of registered users */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 bg-slate-50/70 rounded-2xl border border-slate-100">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-[11px]">
                  لا يوجد مستخدم مطابق لبيانات البحث
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected =
                    selectedUser?.phone === u.phone || selectedUser?.id === u.id;
                  return (
                    <div
                      key={u.phone || u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.name.slice(0, 1)}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold truncate text-[11px]">
                              {u.name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                isSelected
                                  ? 'bg-white/25 text-white'
                                  : u.role === 'فني'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {u.phone}
                          </span>
                        </div>
                      </div>

                      <div className="text-left shrink-0 pl-1">
                        <span className="font-black text-xs block">
                          {u.balance || 0} ج.م
                        </span>
                        <span
                          className={`text-[9px] ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {u.role === 'فني'
                            ? `${u.technicianPoints || 0} نقطة`
                            : `${u.freeRequestsLeft || 0} مجاناً`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected User Details Card */}
          {selectedUser && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-600 font-bold block">
                    الحساب المحدد للشحن الآن:
                  </span>
                  <h4 className="font-black text-sm text-slate-900">
                    {selectedUser.name} ({selectedUser.phone})
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {selectedUser.role}
                </span>
              </div>

              {/* Balances Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white p-2 rounded-xl border border-blue-100">
                  <span className="text-[9px] text-slate-400 font-bold block">
                    رصيد المحفظة
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {selectedUser.balance || 0} ج.م
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-100">
                  <span className="text-[9px] text-slate-400 font-bold block">
                    نقاط الفني
                  </span>
                  <span className="text-xs font-black text-indigo-700">
                    {selectedUser.technicianPoints || 0} نقطة
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-100">
                  <span className="text-[9px] text-slate-400 font-bold block">
                    طلبات مجانية
                  </span>
                  <span className="text-xs font-black text-amber-700">
                    {selectedUser.freeRequestsLeft || 0} طلب
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action 1: Cash Balance Recharge */}
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>شحن رصيد نقدي (جنيه مصري)</span>
              </label>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                للمحفظة
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setBalanceAmount(amt);
                    setCustomBalance('');
                  }}
                  className={`py-2 rounded-xl font-black text-xs transition border ${
                    balanceAmount === amt && !customBalance
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  +{amt} ج.م
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={customBalance}
                onChange={(e) => setCustomBalance(e.target.value)}
                placeholder="أو اكتب مبلغاً مخصصاً (مثال: 350)"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRechargeSubmit('balance')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm active:scale-95 transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>شحن الرصيد</span>
              </button>
            </div>
          </div>

          {/* Action 2: Technician Points Recharge */}
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>تزويد باقة نقاط الفني (خصم 5 نقاط / عميل)</span>
              </label>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                للفنيين
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 100].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setPointsAmount(pts)}
                  className={`py-2 rounded-xl font-black text-xs transition border ${
                    pointsAmount === pts
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  +{pts} نقطة
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleRechargeSubmit('points')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>تزويد باقة النقاط (+{pointsAmount} نقطة)</span>
            </button>
          </div>

          {/* Action 3: Free Requests Booster */}
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>إضافة طلبات صيانة مجانية للعميل</span>
              </label>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                للعملاء
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((reqs) => (
                <button
                  key={reqs}
                  type="button"
                  onClick={() => setFreeRequestsAmount(reqs)}
                  className={`py-2 rounded-xl font-black text-xs transition border ${
                    freeRequestsAmount === reqs
                      ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  +{reqs} {reqs === 1 ? 'طلب' : 'طلبات'}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleRechargeSubmit('free_requests')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
              <span>إضافة طلبات مجانية (+{freeRequestsAmount} طلبات)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>مربوط مباشرة بقاعدة بيانات Firebase</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
