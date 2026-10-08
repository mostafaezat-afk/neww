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
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Power,
  Edit2,
  Trash2,
  Check,
  X,
  Sliders,
  DollarSign,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { Task, TechnicianOfferedService, UserProfile, LocationData, TaskStatus } from '../types';
import { DEFAULT_TECHNICIAN_SERVICES } from '../mockData';

interface TechnicianServicesTabProps {
  user: UserProfile;
  tasks: Task[];
  services: TechnicianOfferedService[];
  onUpdateServices: (updated: TechnicianOfferedService[]) => void;
  onSelectTask: (task: Task) => void;
  onTrackTask: (task: Task) => void;
  onChatWithClient: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onOpenWorkingHours: () => void;
  onToggleAvailability: (isAvailable: boolean) => void;
}

export const TechnicianServicesTab: React.FC<TechnicianServicesTabProps> = ({
  user,
  tasks,
  services = DEFAULT_TECHNICIAN_SERVICES,
  onUpdateServices,
  onSelectTask,
  onTrackTask,
  onChatWithClient,
  onCompleteTask,
  onOpenWorkingHours,
  onToggleAvailability,
}) => {
  const [activeSection, setActiveSection] = useState<'offered_services' | 'active_orders'>('offered_services');

  // Add new service modal state
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('السباكة والأدوات الصحية');
  const [newServicePrice, setNewServicePrice] = useState(150);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Editing existing price inline
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(150);

  // Filter tasks that are in progress or accepted
  const activeOrders = tasks.filter((t) => t.status === 'in_progress');
  const completedOrders = tasks.filter((t) => t.status === 'closed');

  const handleToggleServiceActive = (serviceId: string) => {
    const updated = services.map((s) =>
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );
    onUpdateServices(updated);
  };

  const handleSaveEditedPrice = (serviceId: string) => {
    const updated = services.map((s) =>
      s.id === serviceId ? { ...s, basePrice: editedPrice } : s
    );
    onUpdateServices(updated);
    setEditingServiceId(null);
  };

  const handleDeleteService = (serviceId: string) => {
    if (services.length <= 1) return;
    const updated = services.filter((s) => s.id !== serviceId);
    onUpdateServices(updated);
  };

  const handleAddNewServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    let icon = 'Wrench';
    if (newServiceCategory.includes('كهرباء')) icon = 'Zap';
    else if (newServiceCategory.includes('تكييف')) icon = 'Wind';
    else if (newServiceCategory.includes('نجارة')) icon = 'Hammer';
    else if (newServiceCategory.includes('أجهزة')) icon = 'Cpu';

    const newService: TechnicianOfferedService = {
      id: `ts-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      categoryIcon: icon,
      basePrice: newServicePrice,
      isActive: true,
      description: newServiceDesc.trim() || undefined,
    };

    onUpdateServices([...services, newService]);
    setIsAddServiceOpen(false);
    setNewServiceName('');
    setNewServiceDesc('');
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
    <div className="flex flex-col min-h-full pb-20 px-4 space-y-3.5 text-right">
      {/* Top Header */}
      <div className="pt-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">خدمات الفني 🛠️</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              إدارة خدماتك المعروضة والطلبات الجارية لديك
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddServiceOpen(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>إضافة خدمة</span>
          </button>
        </div>

        {/* Live Availability & Working Hours Summary Card */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-3.5 border border-slate-700/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.isAvailableForWork ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'} shrink-0`} />
              <div>
                <span className="text-xs font-bold block">
                  {user.isAvailableForWork ? 'وضع التوفر: نشط أونلاين 🟢' : 'وضع التوفر: استراحة ⏸️'}
                </span>
                <span className="text-[10px] text-slate-300">
                  ساعات العمل: {user.workingHours?.startTime || '09:00'} إلى {user.workingHours?.endTime || '19:00'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleAvailability(!user.isAvailableForWork)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                  user.isAvailableForWork ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950 font-black'
                }`}
              >
                {user.isAvailableForWork ? 'إيقاف مؤقت' : 'دخول متاح'}
              </button>
              <button
                type="button"
                onClick={onOpenWorkingHours}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white"
                title="تعديل المواعيد"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control: Offered Services vs Active Orders */}
      <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveSection('offered_services')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'offered_services'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>خدماتي المعروضة للعملاء ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('active_orders')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSection === 'active_orders'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          <span>طلباتي الجارية ({activeOrders.length})</span>
        </button>
      </div>

      {/* Section 1: Offered Services Catalog */}
      {activeSection === 'offered_services' && (
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>الخدمات التي تقدمها ويراها العملاء لطلبك</span>
            <span>{services.filter((s) => s.isActive).length} من {services.length} مفعلة</span>
          </div>

          <div className="space-y-2.5">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col gap-2.5 shadow-2xs ${
                  service.isActive ? 'border-slate-200/90' : 'border-slate-200/50 opacity-70 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${service.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {getCategoryIcon(service.categoryIcon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                        {service.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {service.category}
                      </p>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleServiceActive(service.id)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                        service.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      title={service.isActive ? 'الخدمة مفعلة' : 'الخدمة متوقفة'}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                          service.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {service.description}
                  </p>
                )}

                {/* Price and Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {editingServiceId === service.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[11px] text-slate-500">السعر:</span>
                      <input
                        type="number"
                        min="30"
                        step="10"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(Number(e.target.value))}
                        className="w-20 p-1 bg-slate-100 border border-blue-400 rounded-lg text-xs font-bold outline-none text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEditedPrice(service.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        title="حفظ"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="p-1 bg-slate-200 text-slate-700 rounded-lg"
                        title="إلغاء"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">يبدأ من:</span>
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                        {service.basePrice} ج.م
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(service.id);
                          setEditedPrice(service.basePrice);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 transition"
                        title="تعديل السعر"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      service.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {service.isActive ? 'مفعلة للطلب' : 'متوقفة مؤقتاً'}
                    </span>

                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition"
                        title="إزالة من القائمة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Active Orders / My In-Progress Tasks */}
      {activeSection === 'active_orders' && (
        <div className="space-y-3 flex-1">
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">لا توجد طلبات جاري تنفيذها حالياً</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                توجه إلى تبويب "خدمات مطلوبة الآن" وقدم عروضك على طلبات العملاء النشطة!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="bg-white rounded-3xl p-4 border border-blue-200 shadow-xs cursor-pointer flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        قيد التنفيذ والمباشرة 🚗
                      </span>
                      <h3 className="text-xs font-extrabold text-slate-900 mt-1">{task.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        العميل: {task.clientName || 'عميل معتمد'} ({task.clientPhone || '01012345678'})
                      </p>
                    </div>

                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                      {task.price} ج.م
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate text-[11px]">{task.location.address}</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">{task.location.district}</span>
                  </div>

                  {/* Operational Controls */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onTrackTask(task)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>المسار</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChatWithClient(task)}
                      className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>محادثة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCompleteTask(task.id)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>إنهاء ✅</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-right">
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">إضافة خدمة جديدة إلى قائمتك ➕</h3>
              <button
                onClick={() => setIsAddServiceOpen(false)}
                className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewServiceSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  اسم الخدمة أو الصيانة: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فحص وإصلاح تسريب الغاز بالسخان"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  القسم التابع له:
                </label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="السباكة والأدوات الصحية">السباكة والأدوات الصحية</option>
                  <option value="الكهرباء والإنارة">الكهرباء والإنارة</option>
                  <option value="تكييف وتبريد">تكييف وتبريد</option>
                  <option value="النجارة والأبواب">النجارة والأبواب</option>
                  <option value="صيانة الأجهزة المنزلية">صيانة الأجهزة المنزلية</option>
                  <option value="نقاشة ودهانات">نقاشة ودهانات</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  السعر الأساسي المبدئي (ج.م): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="30"
                  step="10"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  وصف مختصر للخدمة (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="مثال: فحص شامل وقطع غيار أصلية مع ضمان شهر."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
              >
                إضافة ونشر الخدمة في قائمتي 💾
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
