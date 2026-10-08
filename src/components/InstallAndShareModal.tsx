import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Globe,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAndShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAndShareModal: React.FC<InstallAndShareModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, activeSetTab] = useState<'compare' | 'install' | 'share'>('compare');

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;
  const shareMessage = `تطبيق "فى الخدمة" لصيانة المنازل وتحديد موقعك عبر الخرائط التفاعلية:\n${currentAppUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800">تثبيت التطبيق ومشاركته (PWA)</h3>
              <p className="text-[10px] text-slate-400">دليل التثبيت السريع على الهاتف ومشاركة الرابط</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 m-4 mb-2 rounded-xl text-xs font-semibold">
          <button
            onClick={() => activeSetTab('compare')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'compare' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            مميزات تطبيق الويب
          </button>
          <button
            onClick={() => activeSetTab('install')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'install' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            طريقة التثبيت
          </button>
          <button
            onClick={() => activeSetTab('share')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'share' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            مشاركة التطبيق
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'compare' && (
            <div className="space-y-3">
              {/* Verdict Banner */}
              <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-sm">
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>الخلاصة: نسخة الويب (PWA) هي الأسهل والأصلح بامتياز!</span>
                </div>
                <p className="text-[11px] text-blue-100 leading-relaxed">
                  لماذا؟ لأن رابط الويب ترسله للزبون أو الفني على الواتساب، يفتحه فوراً دون تحميل أي ملفات ثقيلة أو مواجهة تحذيرات أمان أندرويد، وبضغطة زر يثبته كأيقونة على الشاشة الرئيسية!
                </p>
              </div>

              {/* Comparison table */}
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>ميزات نسخة الويب وتطبيق PWA (المثبت حالياً):</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-emerald-900 list-disc list-inside">
                    <li>يعمل فوراً على أي هاتف (أندرويد، آيفون، كمبيوتر) عبر رابط مباشر.</li>
                    <li>سهل المشاركة على الواتساب والفيسبوك وجوجل درايف.</li>
                    <li>لا يطلب أذونات خطيرة أو رسائل "قد يكون الملف ضاراً".</li>
                    <li>يمكن تثبيته على الشاشة الرئيسية كأيقونة مستقلة تفتح ملء الشاشة.</li>
                    <li>تحديثات فورية دون حاجة لأن يعيد المستخدم تسطيب ملف جديد.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                    <span>ملف الـ APK التقليدي:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                    <li>يحتاج من العميل تفعيل خيار "تثبيت التطبيقات من مصادر غير معروفة".</li>
                    <li>قد يحذره نظام حماية Google Play Protect من فتح الملف.</li>
                    <li>لا يعمل على هواتف آيفون إطلاقاً (فقط أندرويد).</li>
                    <li>يحتاج لإعادة إرسال الملف كلما قمت بأي تعديل على الكود.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-3">
              {/* Native install button if supported */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Download className="w-4 h-4" />
                  <span>اضغط هنا لتثبيت تطبيق "فى الخدمة" على هاتفك الآن</span>
                </button>
              )}

              {isInstalled && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>التطبيق مثبت بالفعل على جهازك ويعمل بنجاح!</span>
                </div>
              )}

              {/* Step by step for Android */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>طريقة التثبيت على أي هاتف أندرويد (Chrome):</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>افتح الرابط في متصفح جوجل كروم (Chrome).</li>
                  <li>اضغط على زر الخيارات (الثلاث نقاط ⋮) في أعلى أو أسفل المتصفح.</li>
                  <li>اختر <strong>"التثبيت على الشاشة الرئيسية"</strong> أو <strong>"تثبيت التطبيق"</strong>.</li>
                  <li>ستظهر أيقونة تطبيق "فى الخدمة" على شاشة هاتفك مثل أي تطبيق من المتجر تماماً.</li>
                </ol>
              </div>

              {/* Step by step for iOS */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-600" />
                  <span>طريقة التثبيت على هواتف آيفون (Safari):</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>افتح الرابط في متصفح سفاري (Safari).</li>
                  <li>اضغط على زر المشاركة (مربع بسهم لأعلى ⎋).</li>
                  <li>اختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <label className="font-bold text-slate-700 block">رابط التطبيق المباشر:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentAppUrl}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono select-all text-slate-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>إرسال عبر واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span>نسخ الرابط للمشاركة</span>
                </button>
              </div>

              {/* QR Code Section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="font-bold text-slate-800 text-xs mb-1">امسح الباركود بكاميرا الهاتف لفتح وتثبيت التطبيق فوراً:</span>
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 my-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentAppUrl)}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <span className="text-[10px] text-slate-400">يعمل على كاميرا أي هاتف أندرويد أو آيفون مجاناً</span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                <strong>نصيحة للمشاركة:</strong> يمكنك مشاركة هذا الرابط أو الباركود مع أصدقائك أو عملائك عبر واتساب أو وسائل التواصل لتجربة طلب صيانة سريعة وموثوقة.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
