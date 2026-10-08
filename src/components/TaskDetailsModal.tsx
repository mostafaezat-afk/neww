import React from 'react';
import {
  X,
  MapPin,
  Clock,
  CheckCircle,
  Ban,
  MessageSquare,
  Navigation,
  ShieldCheck,
  CreditCard,
  Phone,
  Image as ImageIcon,
  Gift,
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onTrackOnMap: (task: Task) => void;
  onOpenChat: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onTrackOnMap,
  onOpenChat,
}) => {
  if (!task) return null;

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">جاري التنفيذ ⚙️</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">في انتظار العروض ⏳</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">مكتملة ومغلقة ✅</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            <span className="text-xs text-slate-400 font-mono">#{task.id}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with smooth scroll */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-snug">{task.title}</h3>
            <span className="text-xs font-semibold text-blue-600 mt-1 inline-block bg-blue-50 px-2 py-0.5 rounded-md">
              {task.category}
            </span>
          </div>

          {/* Description */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 mb-1">تفاصيل العطل والطلب:</h4>
            <p className="text-xs text-slate-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Attached Images (if any) */}
          {task.images && task.images.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>الصور المرفقة للعطل:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {task.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="عطل"
                    className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Location card with map shortcut */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800">موقع طلب الخدمة</h4>
                <p className="text-xs text-slate-700 mt-0.5">{task.location.address}</p>
                {(task.location.buildingNumber || task.location.floor) && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    عقار {task.location.buildingNumber || '-'} • دور {task.location.floor || '-'} • شقة {task.location.apartment || '-'}
                  </p>
                )}
                {task.location.landmark && (
                  <p className="text-[11px] text-blue-700 mt-0.5 font-medium">
                    علامة مميزة: {task.location.landmark}
                  </p>
                )}
              </div>
            </div>
            {task.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTrackOnMap(task);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>تتبع وصول الفني على الخريطة الآن</span>
              </button>
            )}
          </div>

          {/* Schedule & Price Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">موعد الزيارة</span>
              </div>
              <p className="font-bold text-slate-800 text-xs leading-tight">{task.scheduledTime}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">رسوم المعاينة</span>
              </div>
              {task.isFreeRequestUsed ? (
                <div>
                  <p className="font-black text-emerald-600 text-xs">مجاناً (هدية ترحيب) 🎉</p>
                  <p className="text-[9px] text-slate-400">0 ج.م للمعاينة</p>
                </div>
              ) : (
                <p className="font-black text-blue-600 text-sm">{task.price} ج.م</p>
              )}
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>مشمل بضمان صيانة معتمد لمدة 30 يوماً ضد عيوب التركيب والإصلاح.</span>
          </div>

          {/* Assigned Technician */}
          {task.technician && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">الفني المعتمد للطلب</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  فني معتمد ومؤمن
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={task.technician.avatar}
                  alt={task.technician.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">{task.technician.name}</h4>
                  <p className="text-[11px] text-slate-500">{task.technician.specialty}</p>
                  <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                    ⭐ {task.technician.rating} ({task.technician.reviewsCount} تقييم ناجح)
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(task);
                  }}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>محادثة الفني</span>
                </button>
                <a
                  href={`tel:${task.technician.phone}`}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition active:scale-95"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {task.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(task.id, 'in_progress');
                onClose();
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>قبول أقرب عرض وبدء التنفيذ</span>
            </button>
          )}

          {task.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(task.id, 'closed');
                onClose();
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد إتمام الصيانة بنجاح</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
