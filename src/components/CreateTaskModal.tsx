import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Cpu,
  Paintbrush,
  Truck,
  Plus,
  Navigation,
  Building,
  Home,
  Check,
  Gift,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { LocationData, ServiceCategory, Task } from '../types';
import { SERVICE_CATEGORIES } from '../mockData';
import { InteractiveMap } from './InteractiveMap';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  defaultLocation: LocationData;
  freeRequestsLeft: number;
  clientBalance: number;
  clientName: string;
  clientPhone: string;
  onOpenSupportRecharge: () => void;
  categories?: ServiceCategory[];
  areas?: { name: string; city: string; district: string; lat: number; lng: number }[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  defaultLocation,
  freeRequestsLeft,
  clientBalance,
  clientName,
  clientPhone,
  onOpenSupportRecharge,
  categories = SERVICE_CATEGORIES,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(categories[0] || SERVICE_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('اليوم، خلال ساعتين');
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [estimatedPrice, setEstimatedPrice] = useState(selectedCategory.basePrice);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Step 2 Location mode: 'gps' | 'manual' | 'map'
  const [locationMode, setLocationMode] = useState<'gps' | 'manual' | 'map'>('gps');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [manualAddress, setManualAddress] = useState(defaultLocation.address || '');
  const [manualBuilding, setManualBuilding] = useState(defaultLocation.buildingNumber || '');
  const [manualFloor, setManualFloor] = useState(defaultLocation.floor || '');
  const [manualApartment, setManualApartment] = useState(defaultLocation.apartment || '');
  const [manualLandmark, setManualLandmark] = useState(defaultLocation.landmark || '');

  useEffect(() => {
    if (isOpen) {
      setLocation(defaultLocation);
      setManualAddress(defaultLocation.address || '');
      setManualBuilding(defaultLocation.buildingNumber || '');
      setManualFloor(defaultLocation.floor || '');
      setManualApartment(defaultLocation.apartment || '');
      setManualLandmark(defaultLocation.landmark || '');
      setUploadedImages([]);
    }
  }, [isOpen, defaultLocation]);

  if (!isOpen) return null;

  const handleSelectCategory = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setEstimatedPrice(cat.basePrice);
    if (!title || title.startsWith('طلب خدمة')) {
      setTitle(`طلب صيانة ${cat.name}`);
    }
  };

  const handleDetectGPSInModal = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('خدمة تحديد الموقع غير مدعومة في متصفحك');
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGPS(false);
        const { latitude, longitude } = pos.coords;
        let detectedAddress = 'موقعي الحالي (GPS)';
        let detectedCity = 'القاهرة';
        let detectedDistrict = 'موقعي الآن';

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&accept-language=ar`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              detectedAddress = data.display_name.split(',').slice(0, 3).join('، ');
              if (data.address) {
                detectedCity = data.address.city || data.address.state || detectedCity;
                detectedDistrict =
                  data.address.suburb ||
                  data.address.neighbourhood ||
                  data.address.district ||
                  detectedDistrict;
              }
            }
          }
        } catch {}

        const updated: LocationData = {
          lat: latitude,
          lng: longitude,
          address: detectedAddress,
          city: detectedCity,
          district: detectedDistrict,
          buildingNumber: manualBuilding || undefined,
          floor: manualFloor || undefined,
          apartment: manualApartment || undefined,
          landmark: manualLandmark || undefined,
        };
        setLocation(updated);
      },
      () => {
        setIsDetectingGPS(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleConfirmManualAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAddress = manualAddress.trim() || location.address || 'العنوان المحدد للخدمة';

    const parts = cleanAddress.split(/[,،]/).map((p) => p.trim()).filter(Boolean);
    let resolvedCity = location.city || 'المدينة';
    let resolvedDistrict = location.district || cleanAddress;

    if (parts.length >= 2) {
      resolvedCity = parts[parts.length - 1];
      resolvedDistrict = parts[parts.length - 2];
    } else if (parts.length === 1) {
      resolvedDistrict = parts[0];
      resolvedCity = parts[0];
    }

    const updated: LocationData = {
      ...location,
      address: cleanAddress,
      city: resolvedCity,
      district: resolvedDistrict,
      buildingNumber: manualBuilding.trim() || undefined,
      floor: manualFloor.trim() || undefined,
      apartment: manualApartment.trim() || undefined,
      landmark: manualLandmark.trim() || undefined,
    };
    setLocation(updated);
    setStep(3);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isFreeApplicable = freeRequestsLeft > 0;
  const finalPrice = isFreeApplicable ? 0 : (isUrgent ? estimatedPrice + 50 : estimatedPrice);
  const hasInsufficientBalance = !isFreeApplicable && clientBalance < finalPrice;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Hammer': return <Hammer className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleSubmit = () => {
    if (hasInsufficientBalance) {
      onOpenSupportRecharge();
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now().toString().slice(-4)}`,
      title: title.trim() || `طلب صيانة ${selectedCategory.name}`,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      status: 'pending',
      description: description.trim() || 'لا توجد ملاحظات إضافية، بانتظار الفني لمعاينة الموقع وتحديد متطلبات الصيانة.',
      price: finalPrice,
      createdAt: 'الآن',
      scheduledTime: isUrgent ? 'فوري (خلال 30 دقيقة)' : scheduledTime,
      location,
      offersCount: 1,
      isUrgent,
      clientName,
      clientPhone,
      isFreeRequestUsed: isFreeApplicable,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      warrantyDays: 30,
    };

    onTaskCreated(newTask);
    onClose();
    setStep(1);
    setTitle('');
    setDescription('');
    setUploadedImages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">طلب خدمة صيانة جديدة</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              خطوة {step} من 3: {step === 1 ? 'اختر التخصص' : step === 2 ? 'تحديد الموقع والعنوان' : 'تفاصيل العطل وتأكيد الطلب'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body with proper scrolling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* STEP 1: Select Service Category */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700">اختر نوع الصيانة المطلوبة:</span>
                <span className="text-[11px] text-blue-600 font-semibold">{categories.length} تخصصات معتمدة</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 text-right ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl text-white ${cat.color} shrink-0`}>
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">تبدأ من {cat.basePrice} ج.م</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Location */}
          {step === 2 && (
            <div className="space-y-3">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLocationMode('gps')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    locationMode === 'gps'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>موقعي (GPS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    locationMode === 'manual'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>إدخال يدوي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('map')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    locationMode === 'map'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الخريطة</span>
                </button>
              </div>

              {/* GPS Mode */}
              {locationMode === 'gps' && (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">تحديد الموقع الفعلي عبر GPS</h4>
                      <p className="text-[11px] text-slate-500">يلتقط إحداثيات موقعك الحالي بدقة لسرعة توجيه الفني إليك.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">العنوان المعتمد للطلب:</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{location.address}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{location.district}، {location.city}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGPSInModal}
                    disabled={isDetectingGPS}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGPS ? 'جار تحديث الإحداثيات...' : 'إعادة التقاط موقعي الحالي'}</span>
                  </button>
                </div>
              )}

              {/* Manual Mode */}
              {locationMode === 'manual' && (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 block mb-1">
                      العنوان بالتفصيل (اكتب عنوانك كما تشاء): *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none text-right"
                      placeholder="مثال: المنصورة، المشاية السفلية أمام نادي الجزيرة، أو أي شارع/قرية/حي تريده في أي محافظة..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">رقم العقار:</label>
                      <input
                        type="text"
                        value={manualBuilding}
                        onChange={(e) => setManualBuilding(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="14"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">الدور:</label>
                      <input
                        type="text"
                        value={manualFloor}
                        onChange={(e) => setManualFloor(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">الشقة:</label>
                      <input
                        type="text"
                        value={manualApartment}
                        onChange={(e) => setManualApartment(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">علامة مميزة (اختياري):</label>
                    <input
                      type="text"
                      value={manualLandmark}
                      onChange={(e) => setManualLandmark(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="مثال: بجوار بنك مصر أو صيدلية كذا"
                    />
                  </div>
                </div>
              )}

              {/* Map Mode */}
              {locationMode === 'map' && (
                <div className="space-y-2">
                  <InteractiveMap
                    initialLocation={location}
                    onSelectLocation={(newLoc) => {
                      setLocation(newLoc);
                    }}
                    autoLocateOnMount={true}
                    height="260px"
                  />
                  <p className="text-[11px] text-slate-500 text-center">انقر على الخريطة لتثبيت مكان العقار أو موقع العطل</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Details, Photos & Confirmation */}
          {step === 3 && (
            <div className="space-y-3.5">
              {/* Selected Service Card */}
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white ${selectedCategory.color}`}>
                    {getCategoryIcon(selectedCategory.icon)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 block">الخدمة المختارة:</span>
                    <h4 className="text-xs font-bold text-slate-800">{selectedCategory.name}</h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  تغيير
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان الطلب / المشكلة: *</label>
                <input
                  type="text"
                  placeholder={`مثال: صيانة تسريب مياه في ${selectedCategory.name}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Description input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">وصف العطل والملاحظات للفني:</label>
                <textarea
                  rows={2}
                  placeholder="اشرح المشكلة، القطع التي تحتاج فحص، أو أي تفاصيل خاصة بالمكان..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">إرفاق صور للعطل (اختياري)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">حتى 4 صور</span>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group">
                        <img src={img} alt="issue" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-[10px] shadow-sm hover:bg-rose-700 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length < 4 && (
                  <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-white transition text-xs font-semibold text-slate-600">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>التقط صورة أو اختر من المعرض</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Urgency toggle */}
              <div
                onClick={() => setIsUrgent(!isUrgent)}
                className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  isUrgent ? 'border-amber-500 bg-amber-50/70' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isUrgent ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">طلب فوري عاجل (طوارئ 🚨)</h5>
                    <p className="text-[10px] text-slate-500">حضور أقرب فني متاح خلال 30 دقيقة (+50 ج.م)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={() => setIsUrgent(!isUrgent)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Preferred time slot */}
              {!isUrgent && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الموعد المفضل للزيارة:</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="اليوم، خلال ساعتين">اليوم، خلال ساعتين</option>
                    <option value="اليوم، بين 4:00 و 6:00 مساءً">اليوم، بين 4:00 و 6:00 مساءً</option>
                    <option value="غداً، في الفترة الصباحية (10:00 ص - 1:00 م)">غداً، في الفترة الصباحية (10:00 ص - 1:00 م)</option>
                    <option value="غداً، في الفترة المسائية (5:00 م - 8:00 م)">غداً، في الفترة المسائية (5:00 م - 8:00 م)</option>
                  </select>
                </div>
              )}

              {/* Price Breakdown Banner */}
              {isFreeApplicable ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-200" />
                      <span className="font-extrabold text-xs">هدية العضو الجديد (معاينة مجانية)</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      متبقي {freeRequestsLeft} طلبات
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/20">
                    <span className="text-[11px] text-amber-100">رسوم الفحص والمعاينة:</span>
                    <span className="text-lg font-black">0 ج.م مجاناً! 🎉</span>
                  </div>
                  <p className="text-[10px] text-amber-100">
                    تبدأ تكلفة أعمال الصيانة وقطع الغيار من {selectedCategory.basePrice} ج.م حسب ما يحدده الفني بعد الفحص.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-300 block">التكلفة التقديرية المبدئية</span>
                    <p className="text-[10px] text-emerald-400">شاملة المعاينة وضمان صيانة معتمد 30 يوماً</p>
                  </div>
                  <div className="text-lg font-black text-white">
                    {finalPrice} <span className="text-xs font-normal text-slate-300">ج.م</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && locationMode === 'manual') {
                  handleConfirmManualAddress();
                } else {
                  setStep(step + 1);
                }
              }}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              <span>{step === 1 ? 'متابعة لتحديد الموقع' : 'متابعة لتفاصيل الطلب'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر الطلب واستقبال العروض</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
