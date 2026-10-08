import React, { useEffect } from 'react';
import { Bell, X, ChevronLeft, Sparkles, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';

interface PushNotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onOpenNotification: (notification: AppNotification) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onOpenNotification,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'technician_available':
        return <CheckCircle2 className="w-4 h-4 text-emerald-300" />;
      case 'offer_received':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'order_status':
        return <Clock className="w-4 h-4 text-blue-300" />;
      case 'wallet_recharge':
        return <Wallet className="w-4 h-4 text-emerald-300" />;
      default:
        return <Bell className="w-4 h-4 text-blue-300" />;
    }
  };

  const getTypeBadge = () => {
    switch (notification.type) {
      case 'technician_available':
        return 'فني متاح للعمل 🟢';
      case 'offer_received':
        return 'عرض فني جديد 💬';
      case 'order_status':
        return 'تحديث حالة الطلب 🔄';
      case 'wallet_recharge':
        return 'شحن المحفظة 💰';
      default:
        return 'إشعار فوري 🔔';
    }
  };

  return (
    <div className="fixed top-3 inset-x-3 max-w-md mx-auto z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        onClick={() => onOpenNotification(notification)}
        className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 cursor-pointer hover:bg-slate-900 transition flex items-start gap-3 relative overflow-hidden"
      >
        {/* Glow accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400" />

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1 text-right">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                {getTypeBadge()}
              </span>
              {notification.targetRole && notification.targetRole !== 'all' && (
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                  notification.targetRole === 'عميل' ? 'bg-blue-500/30 text-blue-200' : 'bg-emerald-500/30 text-emerald-200'
                }`}>
                  {notification.targetRole === 'عميل' ? 'للعميل 👤' : 'للفني 🔧'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">الآن</span>
          </div>

          <h4 className="text-xs font-black text-white leading-tight">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>

          <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mt-2">
            <span>اضغط هنا للتفاصيل</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded-full shrink-0"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
