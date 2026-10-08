import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Clock,
  Wallet,
  ChevronLeft,
  ShieldCheck,
  Send,
  Volume2,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  User,
  Wrench,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  isPushNotificationSupported,
} from '../services/notificationService';

export type TestNotificationScenario =
  | 'client_offer'
  | 'client_status'
  | 'tech_available'
  | 'tech_new_order'
  | 'tech_assigned';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  userRole?: 'عميل' | 'فني';
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectTask?: (taskId: string) => void;
  onSendTestNotification: (scenario: TestNotificationScenario) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  userRole = 'عميل',
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectTask,
  onSendTestNotification,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'client' | 'tech' | NotificationType>('all');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    getNotificationPermissionStatus()
  );
  const [isRequestingPerm, setIsRequestingPerm] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEnablePermissions = async () => {
    setIsRequestingPerm(true);
    const result = await requestNotificationPermission();
    setPermissionStatus(result);
    setIsRequestingPerm(false);
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'client') return n.targetRole === 'عميل';
    if (activeFilter === 'tech') return n.targetRole === 'فني';
    return n.type === activeFilter;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'technician_available':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'offer_received':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'order_status':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'wallet_recharge':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case 'technician_available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'offer_received':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'order_status':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wallet_recharge':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeName = (type: NotificationType) => {
    switch (type) {
      case 'technician_available':
        return 'فني متاح للعمل';
      case 'offer_received':
        return 'عرض فني';
      case 'order_status':
        return 'حالة الطلب';
      case 'wallet_recharge':
        return 'شحن رصيد';
      default:
        return 'نظام';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return date.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'مؤخراً';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs relative">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 font-black text-[10px] rounded-full flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white">مركز التنبيهات الفورية (FCM)</h3>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.2 rounded-md font-bold">
                  مباشر ⚡
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-blue-100">
                  إشعارات منفصلة بدقة بين العميل والفني
                </p>
                <span className="text-[9px] bg-amber-400/90 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                  {userRole === 'فني' ? 'حسابك: فني 🔧' : 'حسابك: عميل 👤'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {permissionStatus !== 'granted' && isPushNotificationSupported() && (
          <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-amber-900 block leading-tight">
                  تفعيل إشعارات الهاتف الفورية
                </span>
                <span className="text-[10px] text-amber-700 block">
                  لتصلك إشعارات وتحديثات الطلبات فوراً
                </span>
              </div>
            </div>
            <button
              onClick={handleEnablePermissions}
              disabled={isRequestingPerm}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs shrink-0 active:scale-95 transition"
            >
              {isRequestingPerm ? 'جار الطلب...' : 'تفعيل الآن 🔔'}
            </button>
          </div>
        )}

        {/* Quick Test Bar with Explicit Client vs Technician Scenarios */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/70 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span>تجربة التوجيه الدقيق للإشعارات:</span>
            </span>
            <span className="text-[10px] text-slate-400">فصل إشعار العميل عن الفني</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Client Test: Offer Received */}
            <button
              onClick={() => onSendTestNotification('client_offer')}
              className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              title="إشعار موجه للعميل: استلام عرض جديد من فني"
            >
              <User className="w-3 h-3 text-blue-600 shrink-0" />
              <span>إشعار عميل: عرض جديد 💬</span>
            </button>

            {/* Client Test: Order Status */}
            <button
              onClick={() => onSendTestNotification('client_status')}
              className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              title="إشعار موجه للعميل: الفني قبل الطلب وفي الطريق"
            >
              <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>إشعار عميل: تحديث طلب 🚗</span>
            </button>

            {/* Tech Test: New Order in Area */}
            <button
              onClick={() => onSendTestNotification('tech_new_order')}
              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              title="إشعار موجه للفني: طلب صيانة جديد بمنطقتك"
            >
              <Wrench className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>إشعار فني: طلب جديد 📢</span>
            </button>

            {/* Tech Test: Offer Accepted */}
            <button
              onClick={() => onSendTestNotification('tech_assigned')}
              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              title="إشعار موجه للفني: العميل قبل عرضك وبدء العمل"
            >
              <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
              <span>إشعار فني: قبول عرضك ⚡</span>
            </button>

            {/* Availability Notification Test: Tech Available Broadcast */}
            <button
              onClick={() => onSendTestNotification('tech_available')}
              className="col-span-2 px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-2xs"
              title="إشعار موجه للعملاء: فني معتمد أصبح متاحاً للعمل الآن"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>تجربة إشعار للعملاء: فني دخل وضع "متاح للعمل الآن" 🟢🔧</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Action Controls */}
        <div className="p-2.5 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('client')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'client'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <User className="w-3 h-3" />
              <span>للعميل</span>
            </button>
            <button
              onClick={() => setActiveFilter('tech')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'tech'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>للفني</span>
            </button>
            <button
              onClick={() => setActiveFilter('technician_available')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'technician_available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>توفر الفنيين 🟢</span>
            </button>
            <button
              onClick={() => setActiveFilter('offer_received')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                activeFilter === 'offer_received'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              العروض
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-[11px] font-bold flex items-center gap-1"
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">مقروء</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-[11px] font-bold flex items-center gap-1"
                title="مسح الكل"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-slate-700">لا توجد تنبيهات في هذا القسم</p>
              <p className="text-[11px] text-slate-400 mt-1">
                عند استلام عروض فنيين جديدة أو تحديث حالة أي طلب ستظهر هنا فوراً وموجهة لحسابك بدقة
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) onMarkAsRead(item.id);
                  if (item.taskId && onSelectTask) {
                    onSelectTask(item.taskId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                  item.isRead
                    ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                    : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 shadow-2xs'
                }`}
              >
                {/* Unread dot */}
                {!item.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute top-3.5 left-3 animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(
                          item.type
                        )}`}
                      >
                        {getTypeName(item.type)}
                      </span>

                      {/* Recipient badge */}
                      {item.targetRole === 'عميل' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                          <User className="w-2.5 h-2.5" />
                          <span>للعميل</span>
                        </span>
                      )}
                      {item.targetRole === 'فني' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                          <Wrench className="w-2.5 h-2.5" />
                          <span>للفني</span>
                        </span>
                      )}
                      {(!item.targetRole || item.targetRole === 'all') && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          عام
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 mr-auto">{formatTime(item.timestamp)}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.body}</p>

                    {item.taskId && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                          <span>عرض تفاصيل الطلب</span>
                          <ChevronLeft className="w-3 h-3" />
                        </span>
                        <span className="text-[9px] text-slate-400">رقم الطلب: #{item.taskId.slice(-4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            <span>نغمات تنبيه واهتزاز فوري مدمجة</span>
          </span>
          <span className="text-[10px] text-slate-400">Firebase Cloud Messaging ⚡</span>
        </div>
      </div>
    </div>
  );
};

