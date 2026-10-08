import React, { useState } from 'react';
import { X, Send, Bot, PhoneCall, CheckCheck } from 'lucide-react';
import { SupportMessage } from '../types';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  technicianName?: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  title = 'خدمة عملاء فى الخدمة',
  technicianName,
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: '1',
      sender: 'support',
      text: technicianName
        ? `أهلاً بك يا فندم، أنا ${technicianName}. أنا في طريقي إليك وبإمكانك إرسال أي استفسار هنا.`
        : 'أهلاً بك في الدعم الفني لتطبيق "فى الخدمة". كيف يمكننا مساعدتك اليوم؟',
      time: '11:00 ص',
    },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: SupportMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: 'الآن',
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.trim();
    setInputText('');

    // Simulated automated response
    setTimeout(() => {
      let reply = 'شكراً لتواصلك، طلبك قيد المتابعة من فريق الدعم الفني وسنوافيك بالرد فوراً.';
      if (query.includes('سعر') || query.includes('تكلفة')) {
        reply = 'الأسعار في تطبيق فى الخدمة معتمدة وثابتة مع ضمان 30 يوماً على كافة قطع الغيار والمصنعية.';
      } else if (query.includes('تأخير') || query.includes('الفني فين') || query.includes('تتبع')) {
        reply = 'يمكنك تتبع موقع الفني لحظة بلحظة عبر الخريطة من شاشة المهام، وهو يلتزم بالموعد المحدد.';
      } else if (technicianName) {
        reply = `تمام يا فندم، تم استلام رسالتك. أنا قريب جداً من موقعك المحدد على الخريطة وسأصل قريباً.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'support',
          text: reply,
          time: 'الآن',
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {technicianName ? '👷' : '🎧'}
            </div>
            <div>
              <h3 className="font-bold text-xs">{technicianName || title}</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>متواجد الآن للرد السريع</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-bl-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-br-xs shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{m.time}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب رسالتك هنا..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
