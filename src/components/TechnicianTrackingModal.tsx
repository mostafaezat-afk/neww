import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, Phone, MessageSquare, Navigation, ShieldCheck, Clock } from 'lucide-react';
import { Task } from '../types';

interface TechnicianTrackingModalProps {
  task: Task;
  onClose: () => void;
  onOpenChat: () => void;
}

export const TechnicianTrackingModal: React.FC<TechnicianTrackingModalProps> = ({
  task,
  onClose,
  onOpenChat,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const userLat = task.location.lat;
    const userLng = task.location.lng;
    // Simulate technician offset ~ 0.012 deg away
    const techLat = userLat + 0.009;
    const techLng = userLng + 0.008;

    const map = L.map(mapContainerRef.current, {
      center: [(userLat + techLat) / 2, (userLng + techLng) / 2],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `
        <div style="background:#2563eb; color:white; border-radius:9999px; padding:4px 8px; font-size:11px; font-weight:bold; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); white-space:nowrap;">
          📍 بيتك / موقع الخدمة
        </div>
      `,
      iconSize: [100, 30],
      iconAnchor: [50, 15],
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Technician marker
    const techIcon = L.divIcon({
      className: 'tech-pin',
      html: `
        <div style="background:#16a34a; color:white; border-radius:9999px; padding:4px 8px; font-size:11px; font-weight:bold; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); white-space:nowrap; display:flex; align-items:center; gap:4px;">
          🛵 فني الخدمة في الطريق
        </div>
      `,
      iconSize: [120, 30],
      iconAnchor: [60, 15],
    });
    L.marker([techLat, techLng], { icon: techIcon }).addTo(map);

    // Draw route line between tech and user
    const polyline = L.polyline(
      [
        [userLat, userLng],
        [(userLat + techLat) / 2 + 0.002, (userLng + techLng) / 2],
        [techLat, techLng],
      ],
      { color: '#2563eb', weight: 4, dashArray: '8, 8', opacity: 0.8 }
    ).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => {
      map.remove();
    };
  }, [task]);

  const tech = task.technician || {
    name: 'المهندس أحمد حسني',
    rating: 4.9,
    phone: '01123456789',
    specialty: 'فني معتمد لدى فى الخدمة',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800">تتبع مباشر للفني على الخريطة</h3>
              <p className="text-[10px] text-slate-500">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live map display */}
        <div className="relative h-64 w-full">
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Live ETA floating pill */}
          <div className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>وقت الوصول المتوقع: 12 دقيقة</span>
          </div>
        </div>

        {/* Technician info card */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={tech.avatar}
              alt={tech.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-800 truncate">{tech.name}</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">{tech.specialty}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-amber-600 font-semibold">
                <span>⭐ {tech.rating}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">على بعد 1.8 كم</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${tech.phone}`}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال هاتفي</span>
            </a>
            <button
              onClick={() => {
                onClose();
                onOpenChat();
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>محادثة الفني</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
