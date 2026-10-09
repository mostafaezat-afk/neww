import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, Check, Layers, AlertCircle } from 'lucide-react';
import { LocationData } from '../types';

interface InteractiveMapProps {
  initialLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
  height?: string;
  isModal?: boolean;
  availableAreas?: { name: string; city: string; district: string; lat: number; lng: number }[];
  autoLocateOnMount?: boolean;
}

// Popular locations in Egypt for quick selection
const DEFAULT_PRESET_LOCATIONS: { name: string; city: string; district: string; lat: number; lng: number }[] = [
  { name: 'المعادي - شارع النصر', city: 'القاهرة', district: 'المعادي', lat: 29.9602, lng: 31.2569 },
  { name: 'التجمع الخامس - شارع التسعين', city: 'القاهرة الجديدة', district: 'التجمع الخامس', lat: 30.0131, lng: 31.4293 },
  { name: 'مدينة نصر - عباس العقاد', city: 'القاهرة', district: 'مدينة نصر', lat: 30.0561, lng: 31.3411 },
  { name: 'مصر الجديدة - الكوربة', city: 'القاهرة', district: 'مصر الجديدة', lat: 30.0903, lng: 31.3256 },
  { name: 'المهندسين - شارع جامعة الدول', city: 'الجيزة', district: 'المهندسين', lat: 30.0526, lng: 31.2001 },
  { name: 'الدقي - ميدان المساحة', city: 'الجيزة', district: 'الدقي', lat: 30.0384, lng: 31.2124 },
  { name: 'الشيخ زايد - هايبر وان', city: 'الجيزة', district: 'الشيخ زايد', lat: 30.0535, lng: 30.9818 },
  { name: 'سموحة - الإسكندرية', city: 'الإسكندرية', district: 'سموحة', lat: 31.2156, lng: 29.9553 },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialLocation,
  onSelectLocation,
  height = '360px',
  isModal = false,
  availableAreas,
  autoLocateOnMount = true,
}) => {
  const PRESET_LOCATIONS = availableAreas && availableAreas.length > 0 ? availableAreas : DEFAULT_PRESET_LOCATIONS;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentLoc, setCurrentLoc] = useState<LocationData>(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [detailedNotes, setDetailedNotes] = useState({
    buildingNumber: initialLocation.buildingNumber || '',
    floor: initialLocation.floor || '',
    apartment: initialLocation.apartment || '',
    landmark: initialLocation.landmark || '',
  });

  // Custom marker icon HTML
  const createCustomPinIcon = () => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #2563eb; color: white; padding: 6px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid white; display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 9999px;"></span>
            موقع الخدمة المختار
          </div>
          <div style="width: 28px; height: 28px; background: #1d4ed8; border: 3px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-top: -6px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });
  };

  // Reverse geocoding simulated / fetched
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // Freeform fallback using coordinates, without forcing any preset area
      let newAddress = `الموقع المختار على الخريطة (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      let city = currentLoc.city || 'المدينة';
      let district = currentLoc.district || 'الموقع المحدد';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&accept-language=ar`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',').slice(0, 4).join('، ');
            newAddress = parts || newAddress;
            if (data.address) {
              city = data.address.city || data.address.town || data.address.state || city;
              district = data.address.suburb || data.address.neighbourhood || data.address.village || data.address.district || district;
            }
          }
        }
      } catch {
        // Keep coordinates or current address
      }

      const updated: LocationData = {
        ...currentLoc,
        lat,
        lng,
        address: newAddress,
        city,
        district,
      };
      setCurrentLoc(updated);
    } catch {
      // ignore errors
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [currentLoc.lat, currentLoc.lng],
      zoom: 14,
      zoomControl: false,
    });

    // Add Tiles
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    });
    tileLayer.addTo(map);

    // Zoom control at bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Initial Marker
    const marker = L.marker([currentLoc.lat, currentLoc.lng], {
      icon: createCustomPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updateAddressFromCoords(position.lat, position.lng);
    });

    // Map click moves marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Automatically detect user GPS location on open if requested
    if (autoLocateOnMount && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 15);
          marker.setLatLng([latitude, longitude]);
          updateAddressFromCoords(latitude, longitude);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view if currentLoc coords change externally
  const setCoordinates = (lat: number, lng: number, addressText?: string, cityText?: string, districtText?: string) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
    const updated: LocationData = {
      ...currentLoc,
      lat,
      lng,
      address: addressText || currentLoc.address,
      city: cityText || currentLoc.city,
      district: districtText || currentLoc.district,
    };
    setCurrentLoc(updated);
  };

  // Get current device location via browser Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في جهازك');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates(latitude, longitude);
        updateAddressFromCoords(latitude, longitude);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    const finalLocation: LocationData = {
      ...currentLoc,
      buildingNumber: detailedNotes.buildingNumber,
      floor: detailedNotes.floor,
      apartment: detailedNotes.apartment,
      landmark: detailedNotes.landmark,
    };
    onSelectLocation(finalLocation);
  };

  const filteredPresets = PRESET_LOCATIONS.filter((p) =>
    searchQuery ? p.name.includes(searchQuery) || p.district.includes(searchQuery) || p.city.includes(searchQuery) : true
  );

  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', مصر')}&accept-language=ar&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const parts = item.display_name.split(',').slice(0, 3).join('، ');
          setCoordinates(lat, lng, parts);
        }
      }
    } catch {}
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      {/* Top search & quick select */}
      <form onSubmit={handleSearchAddress} className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم الشارع أو العنوان بالتفصيل..."
            className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right"
          />
          <button type="submit" className="absolute right-3 top-3 text-slate-400 hover:text-blue-600">
            <Search className="w-4 h-4" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* GPS Quick Button Bar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs transition active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'جار التقاط إحداثيات GPS...' : '🎯 استخدام موقعي الحالي الآن (GPS)'}</span>
          </button>
        </div>
      </form>

      {/* Map view container */}
      <div className="relative" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating action buttons on map */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          {/* GPS Current Location button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            title="تحديد موقعي الآن"
            className="p-2.5 bg-white/95 hover:bg-white text-blue-600 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm active:scale-95 transition"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-500' : 'text-blue-600'}`} />
            <span>{isLocating ? 'جار التحديد...' : 'موقعي الحالي'}</span>
          </button>
        </div>

        {/* Map Drag / Click tip */}
        <div className="absolute top-3 left-3 z-30 bg-black/65 text-white text-[11px] px-3 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>اسحب العلامة أو انقر على الخريطة لتغيير مكان الطلب</span>
        </div>
      </div>

      {/* Location summary & details form */}
      <div className="p-4 space-y-3 bg-white">
        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              العنوان المعتمد (يمكنك تعديل الصياغة بحرية):
            </span>
            <span className="text-[10px] text-slate-400">
              {currentLoc.lat.toFixed(4)}, {currentLoc.lng.toFixed(4)}
            </span>
          </div>
          <input
            type="text"
            value={currentLoc.address}
            onChange={(e) => setCurrentLoc({ ...currentLoc, address: e.target.value })}
            placeholder="اكتب أو عدل تفاصيل العنوان هنا..."
            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 text-right"
          />
        </div>

        {/* Detailed inputs (Building, Floor, Landmark) */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1">رقم المبنى / العقار</label>
            <input
              type="text"
              placeholder="مثال: 14"
              value={detailedNotes.buildingNumber}
              onChange={(e) => setDetailedNotes({ ...detailedNotes, buildingNumber: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1">الطابق / الدور</label>
            <input
              type="text"
              placeholder="مثال: الثالث"
              value={detailedNotes.floor}
              onChange={(e) => setDetailedNotes({ ...detailedNotes, floor: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1">رقم الشقة</label>
            <input
              type="text"
              placeholder="مثال: 302"
              value={detailedNotes.apartment}
              onChange={(e) => setDetailedNotes({ ...detailedNotes, apartment: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-medium block mb-1">علامة مميزة (اختياري)</label>
          <input
            type="text"
            placeholder="مثال: بجوار صيدلية العزبي أو أمام المدرسة الرسمية"
            value={detailedNotes.landmark}
            onChange={(e) => setDetailedNotes({ ...detailedNotes, landmark: e.target.value })}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Confirm Location button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
        >
          <Check className="w-4 h-4" />
          <span>تأكيد هذا الموقع ومتابعة الطلب</span>
        </button>
      </div>
    </div>
  );
};
