import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, X } from 'lucide-react';

interface BiometricsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BiometricsDialog: React.FC<BiometricsDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setScanned(false);
      }, 700);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl border border-slate-100 flex flex-col items-center">
        <button
          onClick={onClose}
          className="self-end p-1 text-slate-400 hover:text-slate-600 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-2 mb-4">
          <div
            onClick={handleSimulateScan}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-all duration-300 ${
              scanned
                ? 'bg-emerald-100 text-emerald-600 scale-105'
                : scanning
                ? 'bg-blue-100 text-blue-600 animate-pulse ring-4 ring-blue-300'
                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {scanned ? (
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in" />
            ) : (
              <Fingerprint className={`w-10 h-10 ${scanning ? 'animate-bounce' : ''}`} />
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-800">
          {scanned ? 'تم التحقق بنجاح!' : 'التحقق ببصمة الإصبع'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {scanning
            ? 'جاري فحص المستشعر البيومتري...'
            : scanned
            ? 'تم تأكيد هويتك'
            : 'المس مستشعر البصمة أو اضغط على الأيقونة للمحاكاة'}
        </p>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleSimulateScan}
            disabled={scanning || scanned}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
          >
            {scanning ? 'جاري المسح...' : 'مسح البصمة الآن'}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
