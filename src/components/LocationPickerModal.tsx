import React, { useState } from 'react';
import { X, MapPin, Navigation, Edit3, Check, Building, Home, Map } from 'lucide-react';
import { LocationData } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationData;
  onConfirmLocation: (loc: LocationData) => void;
  onRequestCurrentLocation?: () => void;
  isLocatingGPS?: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onConfirmLocation,
  onRequestCurrentLocation,
  isLocatingGPS = false,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'map'>('manual');

  // Manual address form state initialized with current location
  const [city, setCity] = useState(currentLocation.city || 'القاهرة');
  const [district, setDistrict] = useState(currentLocation.district || 'المعادي');
  const [streetAddress, setStreetAddress] = useState(
    currentLocation.address.replace(`، ${currentLocation.district}`, '').replace(`، ${currentLocation.city}`, '') || 'شارع النصر'
  );
  const [buildingNumber, setBuildingNumber] = useState(currentLocation.buildingNumber || '');
  const [floor, setFloor] = useState(currentLocation.floor || '');
  const [apartment, setApartment] = useState(currentLocation.apartment || '');
  const [landmark, setLandmark] = useState(currentLocation.landmark || '');

  if (!isOpen) return null;

  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStreet = streetAddress.trim() || 'الشارع الرئيسي';
    const cleanDistrict = district.trim() || 'وسط المدينة';
    const cleanCity = city.trim() || 'القاهرة';

    const fullAddress = `${cleanStreet}، ${cleanDistrict}، ${cleanCity}`;

    const updated: LocationData = {
      ...currentLocation,
      address: fullAddress,
      city: cleanCity,
      district: cleanDistrict,
      buildingNumber: buildingNumber.trim() || undefined,
      floor: floor.trim() || undefined,
      apartment: apartment.trim() || undefined,
      landmark: landmark.trim() || undefined,
    };

    onConfirmLocation(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-xs text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تحديد موقع طلب الخدمة</h3>
              <p className="text-[11px] text-blue-100">
                اختر بين إدخال عنوانك بالتفصيل أو استخدام موقعك عبر GPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Instant GPS Button */}
        <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-emerald-900 block leading-tight">
                تحديد موقعك الحالي فوراً (GPS)
              </span>
              <span className="text-[10px] text-emerald-700 truncate block">
                التقاط إحداثيات موقعك عبر الأقمار الصناعية بنقرة واحدة
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onRequestCurrentLocation) {
                onRequestCurrentLocation();
                onClose();
              }
            }}
            disabled={isLocatingGPS}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 active:scale-95 transition flex items-center gap-1.5"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
            <span>{isLocatingGPS ? 'جار التحديد...' : 'موقعي الآن 🎯'}</span>
          </button>
        </div>

        {/* Segmented Control: Manual Address vs Map */}
        <div className="p-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>إدخال العنوان يدوياً ✍️</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>الخريطة التفاعلية 🗺️</span>
          </button>
        </div>

        {/* Tab 1: Manual Address Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSaveManualAddress} className="overflow-y-auto flex-1 p-4 space-y-3.5 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-2 text-slate-700">
              <Home className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                أدخل تفاصيل عنوانك ليصل الفني مباشرةً إلى باب منزلك أو موقع العمل بدون تأخير.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  المدينة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: القاهرة، الجيزة، الإسكندرية..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  الحي أو المنطقة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المعادي، التجمع، الدقي..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                اسم الشارع بالتفصيل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: شارع النصر المتفرع من اللاسلكي"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم العقار</label>
                <input
                  type="text"
                  placeholder="مثال: 42"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">الدور / الطابق</label>
                <input
                  type="text"
                  placeholder="مثال: 3"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم الشقة</label>
                <input
                  type="text"
                  placeholder="مثال: 12"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">علامة مميزة أو إرشادات للمكان</label>
              <input
                type="text"
                placeholder="مثال: بجوار بنك مصر أو أمام مسجد النور"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 mt-2"
            >
              <Check className="w-4 h-4" />
              <span>حفظ واعتماد هذا العنوان لموقع الخدمة 📍</span>
            </button>
          </form>
        )}

        {/* Tab 2: Map View */}
        {activeTab === 'map' && (
          <div className="overflow-y-auto flex-1">
            <InteractiveMap
              initialLocation={currentLocation}
              onSelectLocation={(loc) => {
                onConfirmLocation(loc);
                onClose();
              }}
              autoLocateOnMount={true}
              height="340px"
              isModal={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
