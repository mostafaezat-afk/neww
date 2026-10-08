import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Phone,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  HelpCircle,
  Send,
  CheckCircle,
  PhoneCall,
  Gift,
  Zap,
} from 'lucide-react';

interface SupportTabProps {
  onOpenLiveChat: () => void;
  onOpenSupportRecharge?: () => void;
  onOpenAdminRecharge?: () => void;
  onOpenAdminDashboard?: () => void;
  isAdmin?: boolean;
}

const FAQS = [
  {
    q: 'كيف يحصل العضو الجديد على أول 3 طلبات مجاناً؟',
    a: 'بمجرد تسجيل حسابك الجديد بالاسم ورقم الهاتف، يتم تفعيل باقة العضو الجديد تلقائياً وفيها 3 طلبات صيانة مجانية تماماً بدون أي مصاريف أو خصم من رصيدك.',
  },
  {
    q: 'كيف أشحن رصيدي بعد انتهاء الـ 3 طلبات المجانية؟',
    a: 'يمكنك شحن الرصيد مباشرة عن طريق الاتصال بفريق الدعم الفني أو المحادثة الفورية، وسيقوم ممثل الدعم بتزويد محفظتك فوراً بالرصيد المطلوب (50، 100، 200، 500 جنيه).',
  },
  {
    q: 'كيف تُحسب نقاط الفني وخصم الـ 5 نقاط؟',
    a: 'يحصل كل فني معتمد على رصيد نقاط، ويتم خصم 5 نقاط فقط عند فتح بيانات التواصل مع أي عميل جديد يطلب خدمته، ويمكن للفني شحن باقات نقاط جديدة عبر الاتصال بالدعم الفني.',
  },
  {
    q: 'كيف يعمل نظام تقييم العملاء والفنيين؟',
    a: 'بعد انتهاء كل طلب صيانة، يظهر لك نظام تقييم بالنجوم وملاحظات الجودة، ويحصل الطرفان على +10 نقاط سمعة وثقة ترفع من ترتيبهما في التطبيق.',
  },
  {
    q: 'كيف يعمل تحديد المكان عبر الخرائط داخل التطبيق؟',
    a: 'تحدد موقعك بسهولة بالسحب على الخريطة أو عبر GPS اللحظي، مما يضمن وصول الفني الصحيح إلى باب منزلك دون أي تأخير.',
  },
];

export const SupportTab: React.FC<SupportTabProps> = ({
  onOpenLiveChat,
  onOpenSupportRecharge,
  onOpenAdminRecharge,
  onOpenAdminDashboard,
  isAdmin = false,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSent(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-full pb-20 px-4 space-y-4">
      {/* Header */}
      <div className="pt-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          متاحون 24/7
        </span>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">مركز الدعم والمساعدة</h1>
      </div>

      {/* Support Recharge Promo Banner */}
      {onOpenSupportRecharge && (
        <div
          onClick={onOpenSupportRecharge}
          className="p-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition active:scale-[0.99] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <PhoneCall className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-xs">خدمة شحن الرصيد عبر الدعم الفني</h3>
              <p className="text-[10px] text-blue-100 mt-0.5">
                تواصل مع ممثل الدعم وسيزود محفظتك بالرصيد والنقاط فوراً
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2.5 py-1 rounded-lg shrink-0">
            شحن الآن
          </span>
        </div>
      )}

      {/* Fast Contact Options */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenLiveChat}
          className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-1.5 active:scale-95 transition"
        >
          <div className="p-2 rounded-xl bg-white/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold">محادثة حية فورية</span>
          <span className="text-[10px] text-blue-100">فريق الدعم متاح الآن</span>
        </button>

        <a
          href="tel:19980"
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 active:scale-95 transition"
        >
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">الخط الساخن (19980)</span>
          <span className="text-[10px] text-slate-400">مكالمة هاتفية مباشرة للشحن</span>
        </a>
      </div>

      {/* Admin Quick Panels - ONLY shown if logged in as Admin */}
      {isAdmin && (
        <div className="space-y-2.5 p-3 bg-slate-900 text-white rounded-2xl border border-amber-400/40 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-amber-300 px-1">
            <span>أدوات إدارة النظام (المدير فقط) 👑</span>
            <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full font-mono">
              Admin Mode
            </span>
          </div>

          {onOpenAdminRecharge && (
            <button
              onClick={onOpenAdminRecharge}
              className="w-full p-2.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl flex items-center justify-between shadow-xs transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">شحن رصيد ونقاط أي مستخدم سحابياً</span>
              </div>
              <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-md">
                فتح ⚡
              </span>
            </button>
          )}

          {onOpenAdminDashboard && (
            <button
              onClick={onOpenAdminDashboard}
              className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-between shadow-xs transition active:scale-[0.99] border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">لوحة تحكم الأقسام والخدمات والتسعير</span>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                إدارة ⚙️
              </span>
            </button>
          )}
        </div>
      )}

      {/* FAQs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900">الأسئلة الشائعة</h3>
        </div>

        <div className="space-y-1.5">
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-100 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-right gap-2 text-xs font-bold text-slate-800 transition"
                >
                  <span className="flex-1">{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Send Ticket Form */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900">إرسال استفسار أو شكوى لإدارة التطبيق</h3>
        </div>

        {ticketSent ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs space-y-1 text-emerald-800">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-bold">تم إرسال تذكرتك بنجاح!</p>
            <p className="text-[11px] text-emerald-600">سيقوم فريق خدمة العملاء بالتواصل معك خلال 15 دقيقة.</p>
          </div>
        ) : (
          <form onSubmit={handleSendTicket} className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">موضوع الرسالة:</label>
              <input
                type="text"
                placeholder="مثال: استفسار عن فاتورة أو طلب خدمة مخصصة"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">تفاصيل الرسالة:</label>
              <textarea
                rows={3}
                placeholder="اكتب استفسارك بالتفصيل..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>إرسال التذكرة الآن</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
