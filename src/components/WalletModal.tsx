import React, { useState } from 'react';
import { Wallet, Plus, CreditCard, ArrowDownRight, ArrowUpRight, Check, X, Tag, PhoneCall, Gift, Zap, ShieldCheck } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  freeRequestsLeft: number;
  technicianPoints: number;
  role: 'عميل' | 'فني';
  onUpdateBalance: (newBalance: number) => void;
  onUpdateTechPoints?: (newPoints: number) => void;
  onContactSupportForRecharge?: (amount: number) => void;
  onOpenAdminRecharge?: () => void;
  isAdmin?: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  freeRequestsLeft,
  technicianPoints,
  role,
  onUpdateBalance,
  onUpdateTechPoints,
  onContactSupportForRecharge,
  onOpenAdminRecharge,
  isAdmin = false,
}) => {
  const [rechargeAmount, setRechargeAmount] = useState<number>(200);
  const [supportRechargeSuccess, setSupportRechargeSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'balance' | 'support_recharge' | 'voucher'>('balance');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');

  if (!isOpen) return null;

  const handleSupportRechargeSimulate = (amount: number) => {
    onUpdateBalance(balance + amount);
    setSupportRechargeSuccess(`تم تواصلك مع الدعم الفني وقام ممثل الخدمة بشحن ${amount} جنيه في محفظتك بنجاح! 🎉`);
    setTimeout(() => {
      setSupportRechargeSuccess('');
    }, 4000);
  };

  const handleTechPointsRecharge = (points: number) => {
    if (onUpdateTechPoints) {
      onUpdateTechPoints(technicianPoints + points);
      setSupportRechargeSuccess(`تم تزويد باقة النقاط بـ ${points} نقطة عبر الدعم الفني بنجاح! ⚡`);
      setTimeout(() => {
        setSupportRechargeSuccess('');
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {role === 'فني' ? 'محفظة ونقاط الفني' : 'محفظة ورصيد العميل'}
              </h3>
              <p className="text-[10px] text-slate-400">الشحن المعتمد عبر الاتصال بالدعم الفني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'balance' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            الرصيد
          </button>
          <button
            onClick={() => setActiveTab('support_recharge')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'support_recharge' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>باقات الشحن</span>
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'voucher' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>كود هدية</span>
          </button>
        </div>

        {supportRechargeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 font-bold mb-2 animate-in zoom-in-95">
            {supportRechargeSuccess}
          </div>
        )}

        {activeTab === 'balance' ? (
          <div className="space-y-3.5 text-xs">
            {/* Free Requests Banner for Client */}
            {role === 'عميل' && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-200" />
                    <span className="font-extrabold text-xs">باقة العميل الجديد المجانية</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    هدية التسجيل
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black">{freeRequestsLeft}</span>
                    <span className="text-[11px] text-amber-100 mr-1">من أصل 3 طلبات مجاناً متبقية</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-100 mt-1">
                  {freeRequestsLeft > 0
                    ? 'يمكنك طلب الصيانة الآن دون أي خصم من رصيدك حتى تنتهي الـ 3 طلبات!'
                    : 'لقد استهلكت طلباتك المجانية الثلاثة، يمكنك شحن رصيدك عبر الدعم الفني للمتابعة.'}
                </p>
              </div>
            )}

            {/* Technician Points Banner for Tech */}
            {role === 'فني' && (
              <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span className="font-extrabold text-xs">رصيد نقاط التواصل</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    خصم 5 نقاط / عميل
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black">{technicianPoints}</span>
                    <span className="text-[11px] text-blue-100 mr-1">نقطة متاحة</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('support_recharge')}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold"
                  >
                    + شحن نقاط
                  </button>
                </div>
                <p className="text-[10px] text-blue-100 mt-1">
                  يُخصم 5 نقاط تلقائياً عند فتح شات أو اتصال بأي عميل يطلب خدمتك.
                </p>
              </div>
            )}

            {/* Cash Balance Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md">
              <span className="text-[11px] text-slate-300">الرصيد النقدي بالمحفظة</span>
              <div className="text-2xl font-extrabold my-1 flex items-baseline gap-1">
                <span>{balance}</span>
                <span className="text-xs font-normal text-slate-400">جنيه مصري</span>
              </div>
              <button
                onClick={() => setActiveTab('support_recharge')}
                className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>شحن الرصيد عن طريق الدعم الفني</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'support_recharge' ? (
          /* Support Recharge Tab */
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>كيف يعمل الشحن عبر الدعم الفني؟</span>
              </h4>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                تتصل بالدعم الفني المعتمد (19980 أو المحادثة الحية)، وتطلب شحن رصيد بالمبلغ المطلوب، وسيقوم ممثل الدعم بتزويد محفظتك فوراً بالرصيد أو النقاط!
              </p>
            </div>

            {/* Quick Recharge Simulation Buttons */}
            {role === 'عميل' ? (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">اختر باقة الشحن المطلوبة من الدعم:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSupportRechargeSimulate(amt)}
                      className="p-3 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 flex flex-col items-center justify-center transition active:scale-95"
                    >
                      <span className="font-black text-sm text-slate-900">{amt} ج.م</span>
                      <span className="text-[10px] text-blue-600 font-bold mt-0.5">طلب الشحن</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="tel:19980"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>اتصال بالخط الساخن للشحن (19980)</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Tech points packages */
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">باقات شحن نقاط الفني (خصم 5 نقاط / عميل):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTechPointsRecharge(25)}
                    className="p-3 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white flex flex-col items-center transition active:scale-95"
                  >
                    <span className="font-black text-base text-blue-600">+25 نقطة</span>
                    <span className="text-[10px] text-slate-500">تكفي 5 عملاء (50 ج.م)</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">تزويد فوري</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTechPointsRecharge(50)}
                    className="p-3 rounded-2xl border-2 border-blue-600 bg-blue-50/40 flex flex-col items-center transition active:scale-95"
                  >
                    <span className="font-black text-base text-blue-700">+50 نقطة</span>
                    <span className="text-[10px] text-slate-500">تكفي 10 عملاء (90 ج.م)</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">الأكثر طلباً</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct Admin & Support Recharge Panel Trigger - Only for Admin */}
            {isAdmin && onOpenAdminRecharge && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminRecharge();
                  }}
                  className="w-full py-2 bg-slate-900 text-amber-300 hover:bg-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition border border-amber-400/30"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>فتح لوحة الدعم الفني لشحن أي عضو سحابياً ⚡</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Tab 3: Voucher / Gift Code Tab */
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl space-y-1">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>شحن المحفظة عبر كود الهدية أو بطاقات الشحن</span>
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                أدخل كود الشحن الترويجي أو الهدية ليتم شحن رصيدك فوراً في المحفظة.
              </p>
            </div>

            {voucherError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                {voucherError}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">أدخل كود الشحن / القسيمة:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherError('');
                  }}
                  placeholder="مثال: WELCOME100"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center tracking-wider font-bold text-sm uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanCode = voucherCode.trim().toUpperCase();
                    if (!cleanCode) {
                      setVoucherError('يرجى كتابة كود الشحن');
                      return;
                    }
                    if (cleanCode === 'WELCOME100') {
                      onUpdateBalance(balance + 100);
                      setSupportRechargeSuccess('تم شحن 100 جنيه بنجاح باستخدام كود الترحيب WELCOME100! 🎉');
                      setVoucherCode('');
                    } else if (cleanCode === 'FIKHEDMA50') {
                      onUpdateBalance(balance + 50);
                      setSupportRechargeSuccess('تم شحن 50 جنيه بنجاح بكود FIKHEDMA50! 🎉');
                      setVoucherCode('');
                    } else if (cleanCode === 'EGY2026' || cleanCode === 'RAMADAN') {
                      onUpdateBalance(balance + 75);
                      setSupportRechargeSuccess('تم شحن 75 جنيه بنجاح بكود الهدية! 🎉');
                      setVoucherCode('');
                    } else {
                      setVoucherError('عذراً، هذا الكود غير صالح أو منتهي الصلاحية');
                    }
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs active:scale-95 transition"
                >
                  شحن
                </button>
              </div>
            </div>

            {/* Quick Promo Codes for Trial */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">أكواد ترويجية صالحة للتجربة الفورية:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setVoucherCode('WELCOME100')}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-right hover:border-blue-400 font-mono transition"
                >
                  <strong className="text-blue-600 block">WELCOME100</strong>
                  <span className="text-slate-500">رصيد 100 جنيه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherCode('FIKHEDMA50')}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-right hover:border-blue-400 font-mono transition"
                >
                  <strong className="text-blue-600 block">FIKHEDMA50</strong>
                  <span className="text-slate-500">رصيد 50 جنيه</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
