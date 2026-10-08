import React, { useState } from 'react';
import { Star, X, Check, Award, ThumbsUp, ShieldCheck } from 'lucide-react';
import { Task } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  userRole: 'عميل' | 'فني';
  onSubmitRating: (taskId: string, stars: number, comment: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  task,
  userRole,
  onSubmitRating,
}) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['دقة في المواعيد', 'احترافية عالية']);

  if (!isOpen) return null;

  const targetName = userRole === 'عميل'
    ? (task.technician?.name || 'الفني')
    : (task.clientName || 'العميل');

  const availableTags = userRole === 'عميل'
    ? ['دقة في المواعيد', 'شغل نظيف ومتقن', 'سعر مناسب ومحترم', 'أمانة وحسن خلق', 'سرعة إنجاز']
    : ['عميل محترم', 'استقبال طيب', 'وضوح في شرح العطل', 'التزام بالموعد والدفع'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const fullComment = `${comment.trim()} ${selectedTags.length > 0 ? `(${selectedTags.join('، ')})` : ''}`.trim();
    onSubmitRating(task.id, stars, fullComment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800">تقييم الخدمة ونقاط الثقة</h3>
              <p className="text-[10px] text-slate-400">تقييمك يبني سمعة الطرفين ويزيد نقاط المكافآت</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs text-center">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">أنت تقيّم الآن:</span>
            <h4 className="font-black text-sm text-slate-900 mt-0.5">{targetName}</h4>
            <p className="text-[11px] text-blue-600">{task.title}</p>
          </div>

          {/* Interactive Stars */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                className="p-1 transform hover:scale-125 transition active:scale-95"
              >
                <Star
                  className={`w-8 h-8 ${
                    stars >= s
                      ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-600 block">
            {stars === 5 ? 'ممتاز جداً 🌟🌟🌟🌟🌟' : stars === 4 ? 'جيد جداً ⭐⭐⭐⭐' : stars === 3 ? 'متوسط ⭐⭐⭐' : 'يحتاج تحسين ⭐⭐'}
          </span>

          {/* Tags */}
          <div className="space-y-1.5 text-right">
            <label className="font-bold text-slate-700 block text-[11px]">ملاحظات مميزة:</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written comment */}
          <div className="text-right">
            <label className="font-bold text-slate-700 block text-[11px] mb-1">تعليق إضافي (اختياري):</label>
            <textarea
              rows={2}
              placeholder="اكتب كلمة شكر أو أي ملاحظات للمتابعة..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Reward Points Callout */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-[11px] text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مكافأة التقييم المتبادل:</span>
            </span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">+10 نقاط سمعة</span>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4" />
            <span>إرسال التقييم واعتماد النقاط</span>
          </button>
        </div>
      </div>
    </div>
  );
};
