import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  Wind,
  Hammer,
  Cpu,
  Sparkles,
  Paintbrush,
  Truck,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ChevronLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Navigation,
  X,
  Sliders,
  DollarSign,
  User,
} from 'lucide-react';
import { Task, ServiceCategory, LocationData, UserProfile } from '../types';
import { SERVICE_CATEGORIES } from '../mockData';

interface TechnicianMarketplaceTabProps {
  tasks: Task[];
  user: UserProfile;
  currentLocation: LocationData;
  onAcceptTask: (task: Task) => void;
  onSubmitOffer: (task: Task, offerAmount: number, etaMinutes: number, notes: string) => void;
  onChatWithClient: (task: Task) => void;
  onTrackLocation: (task: Task) => void;
  onToggleAvailability: (isAvailable: boolean) => void;
  onOpenWorkingHours: () => void;
  categories?: ServiceCategory[];
}

export const TechnicianMarketplaceTab: React.FC<TechnicianMarketplaceTabProps> = ({
  tasks,
  user,
  currentLocation,
  onAcceptTask,
  onSubmitOffer,
  onChatWithClient,
  onTrackLocation,
  onToggleAvailability,
  onOpenWorkingHours,
  categories = SERVICE_CATEGORIES,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);

  // Offer Modal State
  const [activeOfferTask, setActiveOfferTask] = useState<Task | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(150);
  const [offerEta, setOfferEta] = useState<number>(30);
  const [offerNotes, setOfferNotes] = useState<string>('مستعد للوصول فوراً ومعاينة العطل مع تقديم ضمان على الصيانة.');

  // Only show tasks that are pending or looking for technician offers
  const pendingRequests = tasks.filter((t) => t.status === 'pending');

  const filteredRequests = pendingRequests.filter((task) => {
    if (isUrgentOnly && !task.isUrgent) return false;
    if (selectedCategoryFilter !== 'all' && task.category !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchAddress = task.location.address.toLowerCase().includes(q);
      const matchDistrict = task.location.district.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAddress || matchDistrict;
    }
    return true;
  });

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

  const handleOpenOfferModal = (task: Task) => {
    setActiveOfferTask(task);
    setOfferPrice(task.price || 150);
    setOfferEta(task.isUrgent ? 25 : 45);
    setOfferNotes('مستعد لتنفيذ الصيانة فوراً بأعلى جودة مع ضمان 30 يوماً.');
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfferTask) return;
    onSubmitOffer(activeOfferTask, offerPrice, offerEta, offerNotes);
    setActiveOfferTask(null);
  };

  return (
    <div className="flex flex-col min-h-full pb-20 px-4 space-y-3.5 text-right">
      {/* Top Welcome & Availability Bar */}
      <div className="pt-3">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 shadow-sm border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.isAvailableForWork ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'} shrink-0`} />
              <div>
                <span className="text-xs font-black block">
                  {user.isAvailableForWork ? 'حالتك: متاح للعمل الآن 🟢' : 'حالتك: غير متاح (استراحة) ⏸️'}
                </span>
                <span className="text-[10px] text-slate-300">
                  {user.isAvailableForWork ? 'يتم إشعار العملاء بجاهزيتك للخدمة' : 'لن تستقبل طلبات جديدة في فترة الاستراحة'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleAvailability(!user.isAvailableForWork)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 ${
                  user.isAvailableForWork
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                }`}
              >
                {user.isAvailableForWork ? 'أخذ استراحة ⏸️' : 'تفعيل الاستقبال 🟢'}
              </button>
              <button
                type="button"
                onClick={onOpenWorkingHours}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition"
                title="ساعات العمل"
              >
                <Clock className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
            <span>موقعك المعتمد: <strong className="text-white">{currentLocation.district || 'المعادي'}</strong></span>
            <span className="text-amber-300 font-bold">نقاط التواصل: {user.technicianPoints || 0} نقطة</span>
          </div>
        </div>
      </div>

      {/* Screen Title & Live Stats */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">خدمات مطلوبة الآن</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            طلبات حية من العملاء تبحث عن فنيين معتمدين
          </p>
        </div>

        <div className="text-left bg-white border border-slate-200/80 px-3 py-1.5 rounded-2xl shadow-2xs">
          <span className="text-[10px] text-slate-400 block font-medium">متاحة حالياً</span>
          <span className="text-sm font-black text-blue-600">{filteredRequests.length} طلبات</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالشارع، الحي، أو نوع المشكلة..."
          className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-2.5 text-xs bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {/* Categories & Urgency Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedCategoryFilter === 'all' && !isUrgentOnly
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          الكل ({pendingRequests.length})
        </button>

        <button
          type="button"
          onClick={() => setIsUrgentOnly(!isUrgentOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
            isUrgentOnly
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-rose-500" />
          <span>طوارئ فوري ⚡</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategoryFilter(cat.name);
              setIsUrgentOnly(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategoryFilter === cat.name
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3.5 flex-1">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">لا توجد طلبات تطابق بحثك حالياً</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              سيتم إشعارك فور قيام أي عميل بنشر طلب صيانة جديد في تخصصك أو موقعك الجغرافي 🔔
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
                setIsUrgentOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              عرض كافة الطلبات
            </button>
          </div>
        ) : (
          filteredRequests.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-3xl p-4 border transition-all flex flex-col gap-3 shadow-2xs hover:shadow-xs hover:border-blue-300 ${
                task.isUrgent ? 'border-rose-300/80 ring-1 ring-rose-200/50' : 'border-slate-200/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                    {getCategoryIcon(task.categoryIcon)}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span>{task.category}</span>
                      <span>·</span>
                      <span>{task.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl block border border-emerald-200/60">
                    ميزانية: {task.price} ج.م
                  </span>
                  {task.isUrgent && (
                    <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1 block border border-rose-200 text-center">
                      طوارئ فوري ⚡
                    </span>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {task.description}
              </p>

              {/* Customer Attached Images Preview */}
              {task.images && task.images.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {task.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="عطل"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Location & Client details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-[11px] font-medium truncate" title={task.location.address}>
                    {task.location.district} - {task.location.address}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium truncate">
                    {task.scheduledTime}
                  </span>
                </div>
              </div>

              {/* Client Name & Offers count */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-800">{task.clientName || 'عميل معتمد'}</span>
                  <button
                    type="button"
                    onClick={() => onChatWithClient(task)}
                    className="mr-1 text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>محادثة</span>
                  </button>
                </div>

                <span>العروض: <strong className="text-blue-600 font-bold">{task.offersCount}</strong> عروض</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Button 1: Submit Offer */}
                <button
                  type="button"
                  onClick={() => handleOpenOfferModal(task)}
                  className="col-span-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تقديم عرض سعر 💬</span>
                </button>

                {/* Button 2: Instant Accept */}
                <button
                  type="button"
                  onClick={() => onAcceptTask(task)}
                  className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-emerald-200 active:scale-95"
                  title="قبول الطلب فوراً والمباشرة"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>قبول ⚡</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Offer Submission Modal */}
      {activeOfferTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-right">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">تقديم عرض سعر للعميل 💬</h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  طلب: {activeOfferTask.title}
                </p>
              </div>
              <button
                onClick={() => setActiveOfferTask(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendOfferSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 text-[11px]">
                <span className="font-bold text-blue-900 block mb-0.5">العميل: {activeOfferTask.clientName || 'عميل معتمد'}</span>
                <span>العنوان: {activeOfferTask.location.address}</span>
              </div>

              {/* Offer Amount */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  قيمة عرض السعر (بالجنيه المصري): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    step="10"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">ج.م</span>
                </div>
              </div>

              {/* Estimated Arrival Time */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  وقت الوصول المتوقع لموقع العميل:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setOfferEta(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        offerEta === mins
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins} دقيقة
                    </button>
                  ))}
                </div>
              </div>

              {/* Technician Notes */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  ملاحظات العرض والضمان للعميل:
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="مثال: متاح فوراً ومعاينة دقيقة للمشكلة مع ضمان 30 يوماً على قطع الغيار."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال العرض للعميل فوراً (-5 نقاط)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
