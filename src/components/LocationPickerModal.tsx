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
  const [fullAddress, setFullAddress] = useState(currentLocation.address || '');
  const [buildingNumber, setBuildingNumber] = useState(currentLocation.buildingNumber || '');
  const [floor, setFloor] = useState(currentLocation.floor || '');
  const [apartment, setApartment] = useState(currentLocation.apartment || '');
  const [landmark, setLandmark] = useState(currentLocation.landmark || '');
  const [showExtraDetails, setShowExtraDetails] = useState(
    Boolean(currentLocation.buildingNumber || currentLocation.floor || currentLocation.apartment || currentLocation.landmark)
  );

  if (!isOpen) return null;

  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = fullAddress.trim() || 'العنوان المسجل للخدمة';

    // Parse parts if comma-separated, otherwise set freeform
    const parts = cleanAddress.split(/[,،]/).map((p) => p.trim()).filter(Boolean);
    let resolvedCity = currentLocation.city || 'المدينة';
    let resolvedDistrict = currentLocation.district || cleanAddress;

    if (parts.length >= 2) {
      resolvedCity = parts[parts.length - 1];
      resolvedDistrict = parts[parts.length - 2];
    } else if (parts.length === 1) {
      resolvedDistrict = parts[0];
      resolvedCity = parts[0];
    }

    const updated: LocationData = {
      ...currentLocation,
      address: cleanAddress,
      city: resolvedCity,
      district: resolvedDistrict,
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
              <h3 className="font-bold text-sm text-white">تحديد عنوان طلب الخدمة</h3>
              <p className="text-[11px] text-blue-100">
                اكتب عنوانك بحرية تامة أو حدد موقعك عبر GPS
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
                التقاط موقعك التلقائي عبر الأقمار الصناعية بنقرة واحدة
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
            <span>كتابة العنوان يدوياً ✍️</span>
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
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-slate-700">
              <Home className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-blue-900 block mb-0.5">حرية تامة في إدخال العنوان:</span>
                اكتب عنوانك بالطريقة التي تناسبك (الشارع، الحي، القرية، المدينة، أو أي وصف) ليصل الفني إليك مباشرة دون التقيد بمناطق محددة.
              </div>
            </div>

            {/* Primary Free-Form Address Box */}
            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1.5">
                العنوان بالتفصيل <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="اكتب عنوانك بالتفصيل، مثال: المنصورة، شارع المشاية السفلية أمام نادي الجزيرة، أو شبرا الخيمة شارع 15 مايو، أو أي عنوان تريده..."
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed resize-none transition"
              />
            </div>

            {/* Toggle Extra Details Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowExtraDetails(!showExtraDetails)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                <span>{showExtraDetails ? '▼ إخفاء تفاصيل العقار والشقة' : '◀ إضافة تفاصيل إضافية (رقم العقار، الدور، الشقة، علامة مميزة)'}</span>
              </button>
            </div>

            {/* Optional Additional Details */}
            {showExtraDetails && (
              <div className="space-y-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 animate-in fade-in duration-150">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">رقم العقار</label>
                    <input
                      type="text"
                      placeholder="مثال: 42"
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">الدور / الطابق</label>
                    <input
                      type="text"
                      placeholder="مثال: 3"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">رقم الشقة</label>
                    <input
                      type="text"
                      placeholder="مثال: 12"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">علامة مميزة أو إرشادات للمكان (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: بجوار صيدلية كذا أو أمام المسجد"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 mt-2 cursor-pointer"
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
