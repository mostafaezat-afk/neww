import React, { useState } from 'react';
import { MapPin, Camera, Bell, Shield, Check, X } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const [permissions, setPermissions] = useState({
    location: true,
    camera: true,
    notifications: true,
    storage: false,
  });

  if (!isOpen) return null;

  const toggle = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev [key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">صلاحيات التطبيق (Android)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 my-3 leading-relaxed">
          يحتاج تطبيق <strong>فى الخدمة</strong> إلى هذه الأذونات لضمان أفضل تجربة، مثل تحديد موقع الفني وتصوير العطل بدقة.
        </p>

        <div className="space-y-2.5">
          {/* Location */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500 text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">الموقع الجغرافي (GPS)</p>
                <p className="text-[11px] text-slate-400">تحديد عنوان طلب الخدمة ومسار الفني</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.location}
              onChange={() => toggle('location')}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Camera */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">الكاميرا والصور</p>
                <p className="text-[11px] text-slate-400">تصوير مكان العطل لإرساله للفني</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.camera}
              onChange={() => toggle('camera')}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Notifications */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">الإشعارات اللحظية</p>
                <p className="text-[11px] text-slate-400">تنبيهات وصول العروض وتحديثات الطلب</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.notifications}
              onChange={() => toggle('notifications')}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Check className="w-4 h-4" />
          <span>حفظ التفضيلات</span>
        </button>
      </div>
    </div>
  );
};
