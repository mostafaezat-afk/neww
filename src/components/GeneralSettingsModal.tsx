import React, { useState } from 'react';
import { X, User, Phone, Bell, Globe, Moon, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateUser({ name: name.trim() || user.name, phone: phone.trim() || user.phone });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">إعدادات الحساب والتطبيق</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">الاسم الكامل:</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">رقم الهاتف:</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-700 text-xs">تفضيلات عامة</h4>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>لغة التطبيق</span>
              </div>
              <span className="font-bold text-slate-700">العربية (مصر)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>نغمات تنبيهات المهام</span>
              </div>
              <span className="font-bold text-emerald-600">مفعلة</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>{saved ? 'تم الحفظ!' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
