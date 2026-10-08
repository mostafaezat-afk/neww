import React from 'react';
import { Plus, MapPin, Clock, Calendar, CheckCircle, Navigation, MessageSquare, ChevronLeft, Wrench, Zap, Wind, Hammer, Cpu, Sparkles, Paintbrush, Truck, Star, Gift } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TasksTabProps {
  tasks: Task[];
  activeStatusTab: TaskStatus;
  onChangeStatusTab: (tab: TaskStatus) => void;
  onOpenCreateTask: () => void;
  onSelectTask: (task: Task) => void;
  onTrackTechnician: (task: Task) => void;
  onChatWithTechnician: (task: Task) => void;
  onOpenRateTask?: (task: Task) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  activeStatusTab,
  onChangeStatusTab,
  onOpenCreateTask,
  onSelectTask,
  onTrackTechnician,
  onChatWithTechnician,
  onOpenRateTask,
}) => {
  const filteredTasks = tasks.filter((t) => t.status === activeStatusTab);

  const getEmptyMessage = () => {
    switch (activeStatusTab) {
      case 'in_progress':
        return 'لا توجد مهام جاري تنفيذها حالياً';
      case 'pending':
        return 'لا توجد مهام في انتظار الموافقة حالياً';
      case 'closed':
        return 'لا توجد مهام مغلقة أو منتهية حالياً';
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Wind': return <Wind className="w-4 h-4" />;
      case 'Hammer': return <Hammer className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Paintbrush': return <Paintbrush className="w-4 h-4" />;
      case 'Truck': return <Truck className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Top Header - Matching Screenshot 1 */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between">
        {/* Left: + Add Button */}
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-full text-sm font-bold shadow-xs active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة</span>
        </button>

        {/* Right: Screen Title */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80">
            {filteredTasks.length} {activeStatusTab === 'in_progress' ? 'طلبات جارية' : activeStatusTab === 'pending' ? 'في الانتظار' : 'طلبات منتهية'}
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">المهام</h1>
        </div>
      </div>

      {/* Segmented Control Tabs - Matching Screenshot 1 */}
      <div className="px-4 mb-4">
        <div className="bg-[#e4ebf3] p-1 rounded-2xl flex items-center justify-between gap-1 shadow-2xs">
          <button
            onClick={() => onChangeStatusTab('closed')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeStatusTab === 'closed'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            مغلقة
          </button>
          <button
            onClick={() => onChangeStatusTab('pending')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeStatusTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            في انتظار الموافقة
          </button>
          <button
            onClick={() => onChangeStatusTab('in_progress')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeStatusTab === 'in_progress'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            جاري التنفيذ
          </button>
        </div>
      </div>

      {/* Task Content List or Empty State */}
      <div className="px-4 flex-1 flex flex-col">
        {filteredTasks.length === 0 ? (
          // Matching screenshot 1 empty state
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-400 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 opacity-70" />
            </div>
            <p className="text-base font-semibold text-slate-700 tracking-wide">
              {getEmptyMessage()}
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              اضغط على زر "إضافة" بالأعلى لطلب خدمة جديدة وتحديد موقعك بدقة على الخريطة
            </p>
            <button
              onClick={onOpenCreateTask}
              className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>طلب خدمة الآن</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer flex flex-col gap-3 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      {getCategoryIcon(task.categoryIcon)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500">{task.category}</span>
                        {task.isFreeRequestUsed && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Gift className="w-2.5 h-2.5" />
                            <span>طلب مجاني</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl block">
                      {task.isFreeRequestUsed ? 'مجاناً' : `${task.price} ج.م`}
                    </span>
                  </div>
                </div>

                {/* Location indicator with map pinpoint */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-slate-600 text-[11px] truncate">{task.location.address}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold shrink-0">
                    {task.location.district}
                  </span>
                </div>

                {/* Technician snippet if assigned */}
                {task.technician ? (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.technician.avatar}
                        alt={task.technician.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">{task.technician.name}</p>
                        <p className="text-[10px] text-amber-600">⭐ {task.technician.rating}</p>
                      </div>
                    </div>

                    {task.status === 'in_progress' && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onTrackTechnician(task)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                          title="تتبع على الخريطة"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>تتبع</span>
                        </button>
                        <button
                          onClick={() => onChatWithTechnician(task)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs transition"
                          title="محادثة"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {task.status === 'closed' && onOpenRateTask && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {task.isRated ? (
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                            ⭐ تم التقييم ({task.ratingStars || 5} نجوم)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenRateTask(task)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition"
                          >
                            <Star className="w-3 h-3 fill-white" />
                            <span>تقييم الخدمة (+10 نقاط)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                    <span className="text-[11px]">عدد العروض المقدمة: {task.offersCount}</span>
                    <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                      <span>عرض التفاصيل</span>
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
