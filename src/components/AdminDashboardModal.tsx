import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutGrid,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Sliders,
  DollarSign,
  Phone,
  Percent,
  Gift,
  ShieldCheck,
  RefreshCw,
  Search,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Cpu,
  Sparkles,
  Paintbrush,
  Truck,
  HelpCircle,
  Eye,
  AlertTriangle,
  Lock,
  KeyRound,
  Wallet,
  CreditCard,
  ArrowUpRight,
  User,
  History,
  Smartphone,
  PhoneCall,
} from 'lucide-react';
import { ServiceCategory, ServiceArea, AppSystemConfig, UserProfile } from '../types';
import { subscribeToAllUsers, rechargeUserInCloud } from '../services/firebaseService';
import { INITIAL_USERS_DIRECTORY } from '../mockData';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  areas: ServiceArea[];
  systemConfig: AppSystemConfig;
  currentUser?: UserProfile;
  onUserRecharged?: (updatedUser: UserProfile) => void;
  onSaveCategory: (cat: ServiceCategory) => Promise<boolean>;
  onDeleteCategory: (catId: string) => Promise<boolean>;
  onSaveArea: (area: ServiceArea) => Promise<boolean>;
  onDeleteArea: (areaId: string) => Promise<boolean>;
  onSaveConfig: (cfg: AppSystemConfig) => Promise<boolean>;
  onOpenRechargeModal?: () => void;
  onLogoutAdmin?: () => void;
}

type AdminTab = 'categories' | 'areas' | 'recharge' | 'settings' | 'security';

const AVAILABLE_ICONS = [
  { name: 'Wrench', label: 'مفتاح صيانة' },
  { name: 'Zap', label: 'طاقة وكهرباء' },
  { name: 'Wind', label: 'تكييف وهواء' },
  { name: 'Hammer', label: 'مطرقة ونجارة' },
  { name: 'Cpu', label: 'إلكترونيات وأجهزة' },
  { name: 'Sparkles', label: 'نظافة ولمعان' },
  { name: 'Paintbrush', label: 'فرشاة ودهانات' },
  { name: 'Truck', label: 'شاحنة ونقل' },
];

const AVAILABLE_COLORS = [
  { value: 'bg-blue-500', label: 'أزرق' },
  { value: 'bg-amber-500', label: 'كهرماني' },
  { value: 'bg-cyan-500', label: 'سماوي' },
  { value: 'bg-orange-500', label: 'برتقالي' },
  { value: 'bg-purple-500', label: 'بنفسجي' },
  { value: 'bg-emerald-500', label: 'زمردي' },
  { value: 'bg-pink-500', label: 'وردي' },
  { value: 'bg-indigo-500', label: 'نيلي' },
  { value: 'bg-rose-500', label: 'أحمر داكن' },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  categories,
  areas,
  systemConfig,
  currentUser,
  onUserRecharged,
  onSaveCategory,
  onDeleteCategory,
  onSaveArea,
  onDeleteArea,
  onSaveConfig,
  onOpenRechargeModal,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

  // Admin Credentials State
  const [adminPasswordInput, setAdminPasswordInput] = useState(() => localStorage.getItem('fi_khidma_admin_pwd') || 'admin2026');
  const [adminPinInput, setAdminPinInput] = useState(() => localStorage.getItem('fi_khidma_admin_pin') || '8899');
  const [showAdminCreds, setShowAdminCreds] = useState(false);

  // User Recharge Management State (بوابة شحن المستخدمين المدمجة)
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_USERS_DIRECTORY);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(() => currentUser || INITIAL_USERS_DIRECTORY[0] || null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'عميل' | 'فني'>('all');
  const [rechargeType, setRechargeType] = useState<'balance' | 'points' | 'free_requests'>('balance');
  const [balancePreset, setBalancePreset] = useState<number>(100);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [pointsPreset, setPointsPreset] = useState<number>(50);
  const [freeRequestsPreset, setFreeRequestsPreset] = useState<number>(3);
  const [rechargeDirection, setRechargeDirection] = useState<'add' | 'deduct'>('add');
  const [rechargeMethod, setRechargeMethod] = useState<string>('vodafone_cash');
  const [rechargeNotes, setRechargeNotes] = useState<string>('');
  const [isRecharging, setIsRecharging] = useState<boolean>(false);
  const [rechargeSuccessBanner, setRechargeSuccessBanner] = useState<string | null>(null);
  const [rechargeErrorBanner, setRechargeErrorBanner] = useState<string | null>(null);
  const [rechargeHistory, setRechargeHistory] = useState<Array<{
    id: string;
    userName: string;
    userPhone: string;
    amountText: string;
    type: string;
    methodText: string;
    timestamp: string;
  }>>([]);

  // Subscribe to real-time users from cloud
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToAllUsers((cloudUsers) => {
      const merged = cloudUsers && cloudUsers.length > 0 ? cloudUsers : INITIAL_USERS_DIRECTORY;
      setUsersList(merged);
      if (!selectedUser && merged.length > 0) {
        const foundCurrent = currentUser ? merged.find((u) => u.phone === currentUser.phone || u.id === currentUser.id) : null;
        setSelectedUser(foundCurrent || merged[0]);
      } else if (selectedUser) {
        const updated = merged.find((u) => u.phone === selectedUser.phone || u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    });
    return () => unsub();
  }, [isOpen, currentUser]);

  // Search & Filter
  const [categorySearch, setCategorySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  // Editing Category state
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // New / Edit Category Form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Wrench');
  const [catBasePrice, setCatBasePrice] = useState<number>(100);
  const [catBadge, setCatBadge] = useState('');
  const [catColor, setCatColor] = useState('bg-blue-500');

  // Editing Area state
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [isAddingArea, setIsAddingArea] = useState(false);

  // New / Edit Area Form
  const [areaName, setAreaName] = useState('');
  const [areaCity, setAreaCity] = useState('القاهرة');
  const [areaDistrict, setAreaDistrict] = useState('');
  const [areaLat, setAreaLat] = useState<number>(30.0444);
  const [areaLng, setAreaLng] = useState<number>(31.2357);
  const [areaNotes, setAreaNotes] = useState('');

  // Config Form
  const [cfgData, setCfgData] = useState<AppSystemConfig>(systemConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Category handlers
  const handleStartAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatIcon('Wrench');
    setCatBasePrice(100);
    setCatBadge('');
    setCatColor('bg-blue-500');
    setIsAddingCategory(true);
  };

  const handleStartEditCategory = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatIcon(cat.icon);
    setCatBasePrice(cat.basePrice);
    setCatBadge(cat.badge || '');
    setCatColor(cat.color || 'bg-blue-500');
    setIsAddingCategory(true);
  };

  const handleSaveCategorySubmit = async () => {
    if (!catName.trim()) {
      alert('يرجى كتابة اسم القسم');
      return;
    }
    setIsSaving(true);
    const categoryToSave: ServiceCategory = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName.trim(),
      description: catDesc.trim(),
      icon: catIcon,
      basePrice: Number(catBasePrice) || 50,
      badge: catBadge.trim() || undefined,
      color: catColor,
      active: true,
    };

    const ok = await onSaveCategory(categoryToSave);
    setIsSaving(false);
    if (ok) {
      setIsAddingCategory(false);
      showFeedback(`تم حفظ قسم "${catName}" ومزامنته سحابياً بنجاح!`);
    } else {
      alert('حدث خطأ أثناء الحفظ في قاعدة البيانات');
    }
  };

  const handleDeleteCategorySubmit = async (cat: ServiceCategory) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat.name}" من التطبيق؟`)) return;
    setIsSaving(true);
    const ok = await onDeleteCategory(cat.id);
    setIsSaving(false);
    if (ok) {
      showFeedback(`تم حذف قسم "${cat.name}" بنجاح`);
    }
  };

  // Area handlers
  const handleStartAddArea = () => {
    setEditingArea(null);
    setAreaName('');
    setAreaCity('القاهرة');
    setAreaDistrict('');
    setAreaLat(30.0444);
    setAreaLng(31.2357);
    setAreaNotes('');
    setIsAddingArea(true);
  };

  const handleStartEditArea = (area: ServiceArea) => {
    setEditingArea(area);
    setAreaName(area.name);
    setAreaCity(area.city);
    setAreaDistrict(area.district);
    setAreaLat(area.lat);
    setAreaLng(area.lng);
    setAreaNotes(area.notes || '');
    setIsAddingArea(true);
  };

  const handleSaveAreaSubmit = async () => {
    if (!areaDistrict.trim()) {
      alert('يرجى تحديد اسم الحي أو المنطقة');
      return;
    }
    setIsSaving(true);
    const areaToSave: ServiceArea = {
      id: editingArea ? editingArea.id : `area-${Date.now()}`,
      name: areaName.trim() || `${areaDistrict} - ${areaCity}`,
      city: areaCity.trim() || 'القاهرة',
      district: areaDistrict.trim(),
      lat: Number(areaLat) || 30.0444,
      lng: Number(areaLng) || 31.2357,
      active: true,
      notes: areaNotes.trim() || undefined,
    };

    const ok = await onSaveArea(areaToSave);
    setIsSaving(false);
    if (ok) {
      setIsAddingArea(false);
      showFeedback(`تم حفظ منطقة "${areaToSave.name}" على الخريطة بنجاح!`);
    } else {
      alert('حدث خطأ أثناء حفظ المنطقة في السحابة');
    }
  };

  const handleDeleteAreaSubmit = async (area: ServiceArea) => {
    if (!confirm(`هل أنت متأكد من إزالة منطقة "${area.name}"؟`)) return;
    setIsSaving(true);
    const ok = await onDeleteArea(area.id);
    setIsSaving(false);
    if (ok) {
      showFeedback(`تمت إزالة منطقة "${area.name}"`);
    }
  };

  // System Config handler
  const handleSaveConfigSubmit = async () => {
    setIsSaving(true);
    const ok = await onSaveConfig(cfgData);
    setIsSaving(false);
    if (ok) {
      showFeedback('تم تحديث إعدادات التطبيق العامة في السحابة بنجاح!');
    } else {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  // User Recharge Execution Handler (بوابة شحن المستخدمين)
  const handleExecuteRechargeSubmit = async () => {
    if (!selectedUser) {
      setRechargeErrorBanner('يرجى اختيار المستخدم أولاً.');
      return;
    }

    let deltaValue = 0;
    if (rechargeType === 'balance') {
      deltaValue = customBalanceInput ? parseFloat(customBalanceInput) : balancePreset;
      if (isNaN(deltaValue) || deltaValue <= 0) {
        setRechargeErrorBanner('يرجى تحديد أو إدخال مبلغ شحن صحيح.');
        return;
      }
    } else if (rechargeType === 'points') {
      deltaValue = customBalanceInput ? parseInt(customBalanceInput) : pointsPreset;
      if (isNaN(deltaValue) || deltaValue <= 0) {
        setRechargeErrorBanner('يرجى تحديد أو إدخال عدد نقاط صحيح.');
        return;
      }
    } else if (rechargeType === 'free_requests') {
      deltaValue = customBalanceInput ? parseInt(customBalanceInput) : freeRequestsPreset;
      if (isNaN(deltaValue) || deltaValue <= 0) {
        setRechargeErrorBanner('يرجى تحديد أو إدخال عدد طلبات صحيح.');
        return;
      }
    }

    const finalDelta = rechargeDirection === 'deduct' ? -deltaValue : deltaValue;
    const balanceDelta = rechargeType === 'balance' ? finalDelta : 0;
    const pointsDelta = rechargeType === 'points' ? finalDelta : 0;
    const freeReqDelta = rechargeType === 'free_requests' ? finalDelta : 0;

    setIsRecharging(true);
    setRechargeSuccessBanner(null);
    setRechargeErrorBanner(null);

    const targetKey = selectedUser.phone || selectedUser.id;
    const result = await rechargeUserInCloud(targetKey, balanceDelta, pointsDelta, freeReqDelta);

    setIsRecharging(false);
    if (result.success && result.updatedUser) {
      setSelectedUser(result.updatedUser);
      setUsersList((prev) =>
        prev.map((u) => (u.phone === targetKey || u.id === targetKey ? result.updatedUser! : u))
      );

      if (onUserRecharged && (currentUser?.phone === targetKey || currentUser?.id === targetKey)) {
        onUserRecharged(result.updatedUser);
      }

      const methodNames: Record<string, string> = {
        vodafone_cash: 'فودافون كاش',
        instapay: 'إنستاباي',
        bank: 'إيداع بنكي',
        cash: 'دفع نقدي كاش',
        loyalty: 'مكافأة ولاء',
        admin_adjust: 'تسوية حساب',
      };

      const signWord = rechargeDirection === 'deduct' ? 'خصم' : 'إيداع وشحن';
      const opDesc =
        rechargeType === 'balance'
          ? `${signWord} ${deltaValue} ج.م`
          : rechargeType === 'points'
          ? `${signWord} ${deltaValue} نقطة`
          : `${signWord} ${deltaValue} طلب مجاني`;

      setRechargeSuccessBanner(
        `تم ${signWord} بنجاح لحساب (${selectedUser.name})! الرصيد الحالي: ${result.updatedUser.balance} ج.م`
      );

      setRechargeHistory((prev) => [
        {
          id: String(Date.now()),
          userName: selectedUser.name,
          userPhone: selectedUser.phone || selectedUser.id,
          amountText: opDesc,
          type: rechargeType,
          methodText: methodNames[rechargeMethod] || 'شحن إداري',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setCustomBalanceInput('');
    } else {
      setRechargeErrorBanner(result.message || 'تعذر إتمام عملية الشحن');
    }
  };

  const filteredRechargeUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.trim().toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  const renderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Hammer': return <Hammer className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      default: return <LayoutGrid className="w-5 h-5" />;
    }
  };

  const filteredCategories = categories.filter((c) =>
    categorySearch ? c.name.includes(categorySearch) || c.description.includes(categorySearch) : true
  );

  const filteredAreas = areas.filter((a) =>
    areaSearch ? a.name.includes(areaSearch) || a.city.includes(areaSearch) || a.district.includes(areaSearch) : true
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 bg-gradient-to-l from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">لوحة تحكم الإدارة الكاملة</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                التحكم في الأقسام والخدمات، مناطق الخريطة، الرسوم والإعدادات السحابية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogoutAdmin && (
              <button
                type="button"
                onClick={() => {
                  onLogoutAdmin();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                title="تسجيل خروج من صلاحية الإدارة"
              >
                <span>خروج من الإدارة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {successMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Top Navigation Tabs */}
        <div className="flex items-center justify-between bg-white border-b border-slate-200 px-3 py-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>الأقسام والخدمات ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'areas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>المناطق والتغطية ({areas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'recharge'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>بوابة شحن المستخدمين 💳</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>إعدادات النظام</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>أمان الإدارة وPIN</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* ================= TAB 1: CATEGORIES ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="ابحث عن قسم أو تخصص..."
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <button
                  onClick={handleStartAddCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              {/* Add / Edit Category Modal / Box */}
              {isAddingCategory && (
                <div className="bg-white p-4 rounded-2xl border-2 border-blue-500 shadow-md space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm text-slate-800">
                      {editingCategory ? `تعديل قسم: ${editingCategory.name}` : 'إضافة قسم صيانة جديد'}
                    </h4>
                    <button
                      onClick={() => setIsAddingCategory(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم القسم:</label>
                      <input
                        type="text"
                        placeholder="مثال: تنظيف وتلميع، ستالايت، كاميرات"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">السعر المبدئي (ج.م):</label>
                      <input
                        type="number"
                        placeholder="120"
                        value={catBasePrice}
                        onChange={(e) => setCatBasePrice(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">الوصف المختصر:</label>
                    <input
                      type="text"
                      placeholder="وصف الخدمات التي يقدمها هذا القسم للعملاء..."
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">الشارة الترويجية (اختياري):</label>
                      <input
                        type="text"
                        placeholder="مثال: جديد، الأكثر طلباً، عرض خاص"
                        value={catBadge}
                        onChange={(e) => setCatBadge(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">الأيقونة:</label>
                      <select
                        value={catIcon}
                        onChange={(e) => setCatIcon(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        {AVAILABLE_ICONS.map((ico) => (
                          <option key={ico.name} value={ico.name}>
                            {ico.label} ({ico.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">لون القسم:</label>
                      <select
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        {AVAILABLE_COLORS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveCategorySubmit}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSaving ? 'جار الحفظ...' : 'حفظ ونشر القسم سحابياً'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-start justify-between shadow-2xs hover:shadow-sm transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl text-white shrink-0 ${cat.color || 'bg-blue-500'}`}>
                        {renderIconComponent(cat.icon)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{cat.name}</h4>
                          {cat.badge && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                        <span className="text-[11px] font-bold text-blue-600 mt-1 block">
                          يبدأ من: {cat.basePrice} ج.م
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mr-2">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        title="تعديل القسم"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategorySubmit(cat)}
                        title="إزالة القسم"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: AREAS ================= */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    placeholder="ابحث عن منطقة أو مدينة أو حي..."
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <button
                  onClick={handleStartAddArea}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منطقة تغطية جديدة</span>
                </button>
              </div>

              {/* Add / Edit Area Box */}
              {isAddingArea && (
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-md space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm text-slate-800">
                      {editingArea ? `تعديل منطقة: ${editingArea.name}` : 'إضافة منطقة تغطية جديدة على الخريطة'}
                    </h4>
                    <button
                      onClick={() => setIsAddingArea(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم الحي / المنطقة:</label>
                      <input
                        type="text"
                        placeholder="مثال: الهرم، فيصل، العبور، الزمالك"
                        value={areaDistrict}
                        onChange={(e) => setAreaDistrict(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">المحافظة / المدينة:</label>
                      <input
                        type="text"
                        placeholder="القاهرة، الجيزة، الإسكندرية..."
                        value={areaCity}
                        onChange={(e) => setAreaCity(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        خط العرض (Latitude):
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="30.0444"
                        value={areaLat}
                        onChange={(e) => setAreaLat(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        خط الطول (Longitude):
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="31.2357"
                        value={areaLng}
                        onChange={(e) => setAreaLng(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      اسم العرض الكامل / المعلم المميز:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الهرم - محطة نصر الدين، الجيزة"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingArea(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveAreaSubmit}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSaving ? 'جار الحفظ...' : 'حفظ المنطقة ونشرها بالخريطة'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Areas List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAreas.map((area) => (
                  <div
                    key={area.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{area.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>{area.district}</span>
                          <span>•</span>
                          <span>{area.city}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            ({area.lat.toFixed(2)}, {area.lng.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mr-2">
                      <button
                        onClick={() => handleStartEditArea(area)}
                        title="تعديل المنطقة"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAreaSubmit(area)}
                        title="إزالة المنطقة"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: USER RECHARGE & LEDGER PORTAL ================= */}
          {activeTab === 'recharge' && (
            <div className="space-y-4">
              {/* Header Banner with Statistics */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-sm font-black flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>بوابة شحن أرصدة المستخدمين وحسابات الفنيين والعملاء</span>
                  </h4>
                  <p className="text-xs text-emerald-100/90 mt-1">
                    إدارة فورية لرصيد المحافظ، باقات نقاط الفنيين، والطلبات المجانية مع المزامنة السحابية.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-200 block">إجمالي المستخدمين</span>
                    <span className="text-xs font-black">{usersList.length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-200 block">العملاء</span>
                    <span className="text-xs font-black">{usersList.filter((u) => u.role === 'عميل').length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-200 block">الفنيين</span>
                    <span className="text-xs font-black">{usersList.filter((u) => u.role === 'فني').length}</span>
                  </div>
                </div>
              </div>

              {/* Status alerts */}
              {rechargeSuccessBanner && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rechargeSuccessBanner}</span>
                </div>
              )}
              {rechargeErrorBanner && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-bold animate-in shake">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{rechargeErrorBanner}</span>
                </div>
              )}

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Column 1: User Directory & Selection (5 cols) */}
                <div className="lg:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>اختيار الحساب المستهدف</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                      {filteredRechargeUsers.length} متاح
                    </span>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="بحث بالاسم أو رقم الهاتف..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full text-xs p-2.5 pr-8 pl-7 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                    {userSearchQuery && (
                      <button
                        onClick={() => setUserSearchQuery('')}
                        className="p-1 text-slate-400 hover:text-slate-600 absolute left-2 top-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('all')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                        userRoleFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      الكل ({usersList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('عميل')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                        userRoleFilter === 'عميل'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      عملاء ({usersList.filter((u) => u.role === 'عميل').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('فني')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition ${
                        userRoleFilter === 'فني'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      فنيين ({usersList.filter((u) => u.role === 'فني').length})
                    </button>
                  </div>

                  {/* Users Scrollable List */}
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
                    {filteredRechargeUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        لا يوجد مستخدم يطابق هذا البحث
                      </div>
                    ) : (
                      filteredRechargeUsers.map((u) => {
                        const isSelected = selectedUser?.phone === u.phone || selectedUser?.id === u.id;
                        return (
                          <div
                            key={u.phone || u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setRechargeSuccessBanner(null);
                              setRechargeErrorBanner(null);
                            }}
                            className={`p-2.5 rounded-xl border text-right cursor-pointer transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                                : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {u.balance || 0} ج.م
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 min-w-0">
                              <div className="min-w-0 text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-xs font-bold text-slate-900 truncate">{u.name}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                                      u.role === 'فني'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 justify-end text-[10px] text-slate-400 font-mono mt-0.5">
                                  {u.city && <span className="text-slate-500">{u.city}</span>}
                                  <span>{u.phone}</span>
                                </div>
                              </div>

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                  u.role === 'فني'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {u.role === 'فني' ? '🔧' : '👤'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Column 2: Selected User Recharge Console (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                  {selectedUser ? (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      {/* User Info Bar */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                            {selectedUser.name.charAt(0)}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900">{selectedUser.name}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                {selectedUser.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {selectedUser.phone} {selectedUser.city ? `• ${selectedUser.city}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Balance highlights */}
                        <div className="flex items-center gap-1.5 text-center">
                          <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                            <span className="text-[9px] text-emerald-700 font-bold block">الرصيد</span>
                            <span className="text-xs font-black text-emerald-800">{selectedUser.balance || 0} ج.م</span>
                          </div>
                          {selectedUser.role === 'فني' ? (
                            <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl">
                              <span className="text-[9px] text-blue-700 font-bold block">النقاط</span>
                              <span className="text-xs font-black text-blue-800">{selectedUser.technicianPoints || 0}</span>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                              <span className="text-[9px] text-amber-700 font-bold block">طلبات مجانية</span>
                              <span className="text-xs font-black text-amber-800">{selectedUser.freeRequestsLeft || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recharge Type Selection */}
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1.5">
                          نوع الرصيد المراد إدارته:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setRechargeType('balance')}
                            className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              rechargeType === 'balance'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-bold">رصيد نقدي (ج.م)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRechargeType('points')}
                            className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              rechargeType === 'points'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-bold">نقاط الفني ⚡</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRechargeType('free_requests')}
                            className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              rechargeType === 'free_requests'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                            <span className="text-xs font-bold">طلبات مجانية 🎁</span>
                          </button>
                        </div>
                      </div>

                      {/* Direction: Add vs Deduct */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRechargeDirection('add')}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            rechargeDirection === 'add'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>➕ إضافة وشحن رصيد</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRechargeDirection('deduct')}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            rechargeDirection === 'deduct'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>➖ خصم رصيد أو تسوية</span>
                        </button>
                      </div>

                      {/* Amounts presets & Custom input */}
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1.5">
                          {rechargeType === 'balance'
                            ? 'حدد مبلغ الرصيد (ج.م):'
                            : rechargeType === 'points'
                            ? 'حدد عدد النقاط:'
                            : 'حدد عدد الطلبات المجانية:'}
                        </label>

                        {/* Presets */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {rechargeType === 'balance' && (
                            <>
                              {[50, 100, 200, 500, 1000].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => {
                                    setBalancePreset(amt);
                                    setCustomBalanceInput('');
                                  }}
                                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                                    !customBalanceInput && balancePreset === amt
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {amt} ج.م
                                </button>
                              ))}
                            </>
                          )}

                          {rechargeType === 'points' && (
                            <>
                              {[25, 50, 100, 150, 250].map((pts) => (
                                <button
                                  key={pts}
                                  type="button"
                                  onClick={() => {
                                    setPointsPreset(pts);
                                    setCustomBalanceInput('');
                                  }}
                                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                                    !customBalanceInput && pointsPreset === pts
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  +{pts}
                                </button>
                              ))}
                            </>
                          )}

                          {rechargeType === 'free_requests' && (
                            <>
                              {[1, 2, 3, 5, 10].map((fr) => (
                                <button
                                  key={fr}
                                  type="button"
                                  onClick={() => {
                                    setFreeRequestsPreset(fr);
                                    setCustomBalanceInput('');
                                  }}
                                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                                    !customBalanceInput && freeRequestsPreset === fr
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  +{fr} طلب
                                </button>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="أو اكتب قيمة مخصصة أخرى يدويًا..."
                            value={customBalanceInput}
                            onChange={(e) => setCustomBalanceInput(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="absolute left-3 top-2.5 text-[11px] text-slate-400 font-bold">
                            {rechargeType === 'balance'
                              ? 'ج.م'
                              : rechargeType === 'points'
                              ? 'نقطة'
                              : 'طلب مجاني'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method / Channel & Reason */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            وسيلة الشحن / المرجع:
                          </label>
                          <select
                            value={rechargeMethod}
                            onChange={(e) => setRechargeMethod(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                          >
                            <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                            <option value="instapay">إنستاباي (InstaPay)</option>
                            <option value="bank">تحويل بنكي مباشر</option>
                            <option value="cash">دفع كاش نقدي بالمقر</option>
                            <option value="loyalty">مكافأة ولاء / تعويض عميل</option>
                            <option value="admin_adjust">تسوية وتعديل إداري</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            رقم المعاملة / ملاحظة إدارية (اختياري):
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: حوالة #84920"
                            value={rechargeNotes}
                            onChange={(e) => setRechargeNotes(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Execute Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isRecharging}
                          onClick={handleExecuteRechargeSubmit}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition disabled:opacity-50"
                        >
                          {isRecharging ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جار تنفيذ وتحديث الرصيد سحابياً...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                              <span>
                                تنفيذ {rechargeDirection === 'deduct' ? 'الخصم' : 'الشحن الفوري'} لحساب (
                                {selectedUser.name}) ⚡
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      يرجى اختيار مستخدم من القائمة للبدء بعملية الشحن
                    </div>
                  )}

                  {/* Session History Ledger */}
                  {rechargeHistory.length > 0 && (
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-emerald-600" />
                          <span>سجل عمليات الشحن المنفذة في هذه الجلسة</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rechargeHistory.length} عمليات
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {rechargeHistory.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {tx.amountText}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 block text-[11px]">
                                {tx.userName} ({tx.methodText})
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {tx.timestamp} • {tx.userPhone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SYSTEM SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-800">إعدادات وقوانين المنظومة السحابية</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">اسم التطبيق:</label>
                  <input
                    type="text"
                    value={cfgData.appName}
                    onChange={(e) => setCfgData({ ...cfgData, appName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم هاتف الدعم والإدارة:</label>
                  <input
                    type="text"
                    value={cfgData.supportPhone}
                    onChange={(e) => setCfgData({ ...cfgData, supportPhone: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    عدد الطلبات المجانية الترحيبية لكل عميل جديد:
                  </label>
                  <input
                    type="number"
                    value={cfgData.clientFreeRequestsCount}
                    onChange={(e) =>
                      setCfgData({ ...cfgData, clientFreeRequestsCount: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    يتم منحها للعميل فور تسجيل حسابه للتجربة المجانية.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    تكلفة نقاط التواصل للفني (خصم عند محادثة العميل):
                  </label>
                  <input
                    type="number"
                    value={cfgData.techContactPointsCost}
                    onChange={(e) =>
                      setCfgData({ ...cfgData, techContactPointsCost: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    تخصم من رصيد نقاط الفني لفتح شات أو اتصال بالعميل.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    نسبة عمولة التطبيق من الطلبات (%):
                  </label>
                  <input
                    type="number"
                    value={cfgData.commissionPercentage}
                    onChange={(e) =>
                      setCfgData({ ...cfgData, commissionPercentage: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="allowEmergency"
                    checked={cfgData.allowEmergencyOrders}
                    onChange={(e) =>
                      setCfgData({ ...cfgData, allowEmergencyOrders: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowEmergency" className="text-xs font-bold text-slate-700">
                    تفعيل استقبال طلبات الطوارئ 24/7 (الكهرباء والسباكة العاجلة)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveConfigSubmit}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'جار الحفظ...' : 'حفظ ونشر التعديلات سحابياً'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SECURITY & CREDENTIALS ================= */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>أمان الإدارة وكلمات المرور والرمز السري</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    هنا يمكنك تعيين وتغيير كلمة المرور والرقم السري المطلوبين لدخول لوحة التحكم.
                  </p>
                </div>
                <span className="p-2 bg-amber-400/20 text-amber-300 rounded-xl text-xs font-mono font-bold">
                  محمي برمزين 🔐
                </span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                {/* Field 1: Admin Password */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    كلمة مرور الإدارة (Admin Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminCreds ? 'text' : 'password'}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="كلمة مرور الدخول للإدارة..."
                      className="w-full text-xs p-3 pr-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    مطلوبة عند تسجيل دخول المدير للنظام.
                  </span>
                </div>

                {/* Field 2: Secret PIN */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    الرقم السري الأمني الخاص (Secret PIN)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminCreds ? 'text' : 'password'}
                      maxLength={8}
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="رقم سري مكون من 4 إلى 8 أرقام..."
                      className="w-full text-xs p-3 pr-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    طبقة أمان إضافية لضمان عدم دخول أي مستخدم غير مصرح به.
                  </span>
                </div>

                {/* Toggle Show/Hide Creds */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdminCreds(!showAdminCreds)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    {showAdminCreds ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAdminCreds ? 'إخفاء البيانات' : 'إظهار كلمة المرور والرقم السري'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasswordInput('admin2026');
                      setAdminPinInput('8899');
                      localStorage.setItem('fi_khidma_admin_pwd', 'admin2026');
                      localStorage.setItem('fi_khidma_admin_pin', '8899');
                      showFeedback('تمت استعادة كلمة المرور الافتراضية (admin2026) والـ PIN (8899)');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    استعادة الافتراضي (admin2026 / 8899)
                  </button>
                </div>

                {/* Save button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {onLogoutAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogoutAdmin();
                        onClose();
                      }}
                      className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>تسجيل خروج من الإدارة الآن</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!adminPasswordInput.trim() || !adminPinInput.trim()) {
                        alert('يرجى إدخال كلمة المرور والرقم السري');
                        return;
                      }
                      localStorage.setItem('fi_khidma_admin_pwd', adminPasswordInput.trim());
                      localStorage.setItem('fi_khidma_admin_pin', adminPinInput.trim());
                      showFeedback('تم تحديث وحفظ بيانات دخول الإدارة بنجاح! 🔒');
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition mr-auto"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ بيانات الدخول الجديدة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>متصل سحابياً بـ Firebase Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs transition"
          >
            إغلاق لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};
