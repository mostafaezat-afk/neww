import React, { useState, useEffect, useCallback } from 'react';
import { LocationData, ServiceCategory, ServiceArea, AppSystemConfig, Task, TaskStatus, UserProfile, AppNotification, WorkingHours, Technician } from './types';
import { INITIAL_TASKS, INITIAL_USER, SERVICE_CATEGORIES, INITIAL_SERVICE_AREAS, DEFAULT_SYSTEM_CONFIG } from './mockData';
import { AndroidLayout, ActiveNavTab } from './components/AndroidLayout';
import { TasksTab } from './components/TasksTab';
import { SettingsTab } from './components/SettingsTab';
import { HomeTab } from './components/HomeTab';
import { SupportTab } from './components/SupportTab';
import { CreateTaskModal } from './components/CreateTaskModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { TechnicianTrackingModal } from './components/TechnicianTrackingModal';
import { SupportChatModal } from './components/SupportChatModal';
import { WalletModal } from './components/WalletModal';
import { PermissionsModal } from './components/PermissionsModal';
import { GeneralSettingsModal } from './components/GeneralSettingsModal';
import { BiometricsDialog } from './components/BiometricsDialog';
import { RegistrationModal } from './components/RegistrationModal';
import { InstallAndShareModal } from './components/InstallAndShareModal';
import { RatingModal } from './components/RatingModal';
import { AdminRechargeModal } from './components/AdminRechargeModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NotificationsModal, TestNotificationScenario } from './components/NotificationsModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { TechnicianWorkingHoursModal } from './components/TechnicianWorkingHoursModal';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { TechnicianMarketplaceTab } from './components/TechnicianMarketplaceTab';
import { TechnicianServicesTab } from './components/TechnicianServicesTab';
import { DEFAULT_TECHNICIAN_SERVICES } from './mockData';
import { TechnicianOfferedService } from './types';
import { CheckCircle2, AlertCircle, Cloud, Lock, ShieldCheck } from 'lucide-react';
import {
  subscribeToCloudTasks,
  saveTaskToCloud,
  updateTaskStatusInCloud,
  updateTaskFieldsInCloud,
  saveUserToCloud,
  subscribeToUserProfile,
  subscribeToCategories,
  saveCategoryToCloud,
  deleteCategoryFromCloud,
  subscribeToServiceAreas,
  saveServiceAreaToCloud,
  deleteServiceAreaFromCloud,
  subscribeToSystemConfig,
  saveSystemConfigToCloud,
} from './services/firebaseService';
import {
  dispatchPushNotification,
  subscribeToNotifications,
  markNotificationAsReadInCloud,
  markAllNotificationsAsReadInCloud,
  clearAllNotificationsInCloud,
  registerFirebaseServiceWorker,
  initializeFCMToken,
  getInitialSampleNotifications,
} from './services/notificationService';

export default function App() {
  // User Profile with Persistence
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fi_khidma_user_registered');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USER;
  });

  // Role Selection Gate on entry (User explicitly selects Service Provider or Service Requester)
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('fi_khidma_role_chosen');
  });

  // Technician Offered Services Catalog
  const [technicianServices, setTechnicianServices] = useState<TechnicianOfferedService[]>(() => {
    const saved = localStorage.getItem('fi_khidma_tech_services');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_TECHNICIAN_SERVICES;
  });

  // Navigation State - If technician, opens directly on 'tech_market' ("خدمات مطلوبة الآن"), else 'home'
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(() => {
    try {
      const saved = localStorage.getItem('fi_khidma_user_registered');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'فني') return 'tech_market';
      }
    } catch {}
    return 'home';
  });
  const [activeStatusTab, setActiveStatusTab] = useState<TaskStatus>('in_progress');

  // Admin Authentication State (Protected by Password & Secret PIN)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('fi_khidma_admin_auth') === 'true';
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Core Tasks State
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Current Location State with Auto-GPS Restoration
  const [currentLocation, setCurrentLocation] = useState<LocationData>(() => {
    const saved = localStorage.getItem('fi_khidma_current_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      lat: 30.0444,
      lng: 31.2357,
      address: 'عنوان طلب الصيانة (اضغط للتحديد أو كتابة العنوان)',
      city: 'المدينة',
      district: 'الحي',
    };
  });
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isCurrentLocationSelected, setIsCurrentLocationSelected] = useState(true);

  // Push Notifications State (FCM & Real-time)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('fi_khidma_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const savedUserRole = (() => {
      try {
        const u = localStorage.getItem('fi_khidma_user_registered');
        if (u) return JSON.parse(u)?.role;
      } catch {}
      return 'عميل';
    })();
    return getInitialSampleNotifications(savedUserRole || 'عميل');
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [latestPushNotification, setLatestPushNotification] = useState<AppNotification | null>(null);

  // Modals & Dialogs State
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [areas, setAreas] = useState<ServiceArea[]>(INITIAL_SERVICE_AREAS);
  const [systemConfig, setSystemConfig] = useState<AppSystemConfig>(DEFAULT_SYSTEM_CONFIG);

  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(() => {
    return !localStorage.getItem('fi_khidma_user_registered');
  });
  const [isInstallShareOpen, setIsInstallShareOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isAdminRechargeOpen, setIsAdminRechargeOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [chatTechnician, setChatTechnician] = useState<Task | null>(null);
  const [ratingTask, setRatingTask] = useState<Task | null>(null);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Real-time Cloud Firestore synchronization across all devices
  useEffect(() => {
    const unsubTasks = subscribeToCloudTasks((cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
      }
    });

    const unsubCategories = subscribeToCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    const unsubAreas = subscribeToServiceAreas((cloudAreas) => {
      if (cloudAreas && cloudAreas.length > 0) {
        setAreas(cloudAreas);
      }
    });

    const unsubConfig = subscribeToSystemConfig((cloudCfg) => {
      if (cloudCfg) {
        setSystemConfig(cloudCfg);
      }
    });

    return () => {
      unsubTasks();
      unsubCategories();
      unsubAreas();
      unsubConfig();
    };
  }, []);

  // Geolocation detector: auto-detects current position on EVERY app open directly
  // "عند فتح المستخدم كل مرة يدخل مباشرا الى موقعة الحالى"
  const handleRequestCurrentLocation = useCallback((isInitialMount: boolean = false) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (!isInitialMount) {
        showToast('خاصية تحديد الموقع الجغرافي غير مدعومة في جهازك');
      }
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = pos.coords;

        let resolvedDistrict = 'موقعي الحالي';
        let resolvedAddress = 'موقعي الحالي (GPS)';
        let resolvedCity = 'المدينة';

        // Try reverse geocoding via OpenStreetMap nominatim with fast abort
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2400);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&accept-language=ar`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',').slice(0, 3).join('، ');
              resolvedAddress = parts || resolvedAddress;
              if (data.address) {
                resolvedCity = data.address.city || data.address.state || resolvedCity;
                resolvedDistrict =
                  data.address.suburb ||
                  data.address.neighbourhood ||
                  data.address.district ||
                  resolvedDistrict;
              }
            }
          }
        } catch {
          // Keep best matched landmark
        }

        const updated: LocationData = {
          lat: latitude,
          lng: longitude,
          address: resolvedAddress,
          city: resolvedCity,
          district: resolvedDistrict,
        };

        setCurrentLocation(updated);
        setIsCurrentLocationSelected(true);
        localStorage.setItem('fi_khidma_current_location', JSON.stringify(updated));

        showToast(
          isInitialMount
            ? `تم دخول موقعك الحالي مباشرةً: ${resolvedDistrict} 🎯`
            : `تم تحديد وتحديث موقعك الحالي بدقة عبر الأقمار الصناعية 🛰️`
        );
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn('Geolocation lookup notice:', err.message);
        if (!isInitialMount) {
          showToast('يرجى السماح بالوصول لموقعك لتحديد المكان بدقة 📍');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [areas]);

  // Handler for selecting a specific service area from the carousel
  const handleSelectArea = (area: ServiceArea) => {
    const updated: LocationData = {
      lat: area.lat,
      lng: area.lng,
      address: `${area.name}، ${area.district}، ${area.city}`,
      city: area.city,
      district: area.district,
    };
    setCurrentLocation(updated);
    setIsCurrentLocationSelected(false);
    showToast(`تم اختيار منطقة التغطية: ${area.name} 📍`);
  };

  // Auto-detect current position on EVERY app open directly
  useEffect(() => {
    handleRequestCurrentLocation(true);
  }, [handleRequestCurrentLocation]);

  // Initialize Firebase Cloud Messaging & notifications stream
  useEffect(() => {
    registerFirebaseServiceWorker();
    initializeFCMToken(user.phone);

    const unsubNotifs = subscribeToNotifications(
      user.phone,
      user.role,
      (cloudNotifs) => {
        if (cloudNotifs && cloudNotifs.length > 0) {
          setNotifications(cloudNotifs);
        }
      },
      (newIncoming) => {
        // Real-time incoming notification arrived from other device!
        setLatestPushNotification(newIncoming);
      }
    );

    return () => {
      unsubNotifs();
    };
  }, [user.phone, user.role]);

  // Real-time synchronization of current user profile (balance, points, free requests) from Cloud Firestore
  useEffect(() => {
    if (!user.phone) return;
    const unsubUser = subscribeToUserProfile(user.phone, (cloudUser) => {
      setUser((prev) => ({
        ...prev,
        balance: cloudUser.balance !== undefined ? cloudUser.balance : prev.balance,
        technicianPoints:
          cloudUser.technicianPoints !== undefined
            ? cloudUser.technicianPoints
            : prev.technicianPoints,
        freeRequestsLeft:
          cloudUser.freeRequestsLeft !== undefined
            ? cloudUser.freeRequestsLeft
            : prev.freeRequestsLeft,
        reputationPoints:
          cloudUser.reputationPoints !== undefined
            ? cloudUser.reputationPoints
            : prev.reputationPoints,
        role: cloudUser.role || prev.role,
        rating: cloudUser.rating !== undefined ? cloudUser.rating : prev.rating,
      }));
    });
    return () => unsubUser();
  }, [user.phone]);

  const handleRegistrationComplete = (registeredUser: UserProfile, chosenCity: string) => {
    setUser(registeredUser);
    localStorage.setItem('fi_khidma_user_registered', JSON.stringify(registeredUser));
    saveUserToCloud(registeredUser);
    setIsRegistrationOpen(false);
    setCurrentLocation((prev) => ({
      ...prev,
      city: chosenCity,
      address: `شارع النصر، ${chosenCity}`,
    }));
    showToast(`أهلاً بك يا ${registeredUser.name}! تم تسجيل حسابك بنجاح في تطبيق فى الخدمة 🌟`);
  };

  const handleLogout = () => {
    localStorage.removeItem('fi_khidma_user_registered');
    setIsRegistrationOpen(true);
    showToast('تم تسجيل الخروج بنجاح. يمكنك الآن الدخول أو إنشاء حساب لعضو آخر 👋');
  };

  // Handlers for Tasks with Real-time Push Notifications (strictly separated between Client & Technician)
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    saveTaskToCloud(newTask); // Saves to Cloud Firestore for all devices
    setActiveTab('tasks');
    setActiveStatusTab('pending');

    const clientPhone = newTask.clientPhone || user.phone;

    if (newTask.isFreeRequestUsed) {
      setUser((prev) => ({
        ...prev,
        freeRequestsLeft: Math.max(0, (prev.freeRequestsLeft || 0) - 1),
      }));
      const remaining = Math.max(0, user.freeRequestsLeft - 1);
      showToast(`تم إنشاء الطلب مجاناً ونشره سحابياً! متبقي لديك ${remaining} طلبات مجانية 🎁`);
    } else {
      setUser((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - newTask.price),
      }));
      showToast(`تم نشر طلب "${newTask.title}" سحابياً وخصم ${newTask.price} ج.م من محفظتك 📍`);
    }

    // 1. Client instant notification (only for Client)
    dispatchPushNotification(
      {
        title: 'تم تأكيد نشر طلبك وجارٍ البحث عن فنيين 📋',
        body: `طلب "${newTask.title}" معروض الآن على الفنيين المعتمدين في ${newTask.location.district}.`,
        type: 'order_status',
        taskId: newTask.id,
        userPhone: clientPhone,
        senderPhone: user.phone,
        targetRole: 'عميل',
        senderRole: 'system',
      },
      { role: user.role, phone: user.phone }
    ).then((notif) => {
      if (user.role === 'عميل') {
        setLatestPushNotification(notif);
      }
    });

    // 2. Technician broadcast notification (only for Technicians in coverage area)
    dispatchPushNotification(
      {
        title: 'طلب صيانة جديد متاح في منطقتك 📢',
        body: `العميل ${newTask.clientName || user.name} يطلب "${newTask.title}" في ${newTask.location.district} بقيمة ${newTask.price} ج.م. اضغط لتقديم عرضك!`,
        type: 'order_status',
        taskId: newTask.id,
        targetRole: 'فني',
        senderPhone: user.phone,
        senderRole: 'عميل',
        senderName: newTask.clientName || user.name,
      },
      { role: user.role, phone: user.phone }
    );
  };

  // Technician communication handler (-5 points per client communication)
  const handleChatWithTechnician = (task: Task) => {
    if (user.role === 'فني') {
      if ((user.technicianPoints || 0) < 5) {
        showToast('⚠️ رصيدك من النقاط أقل من 5 نقاط. يرجى شحن باقة النقاط عبر الدعم الفني أولاً!');
        setIsWalletOpen(true);
        return;
      }
      setUser((prev) => ({
        ...prev,
        technicianPoints: prev.technicianPoints - 5,
      }));
      showToast(`تم خصم 5 نقاط للتواصل مع العميل (متبقي لديك ${user.technicianPoints - 5} نقاط) ⚡`);
    }
    setChatTechnician(task);
  };

  const handleRatingSubmit = (taskId: string, stars: number, comment: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, isRated: true, ratingStars: stars, ratingComment: comment }
          : t
      )
    );
    updateTaskFieldsInCloud(taskId, { isRated: true, ratingStars: stars, ratingComment: comment });
    setUser((prev) => ({
      ...prev,
      reputationPoints: (prev.reputationPoints || 100) + 10,
    }));
    showToast('شكراً لتقييمك! تم اعتماد التقييم وإضافة +10 نقاط سمعة وثقة لحسابك ⭐');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus, techData?: Technician) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, ...(techData ? { technician: techData } : {}) }
          : t
      )
    );
    updateTaskFieldsInCloud(taskId, {
      status: newStatus,
      ...(techData ? { technician: techData } : {}),
    });

    const matchedTask = tasks.find((t) => t.id === taskId);
    const clientPhone = matchedTask?.clientPhone || (user.role === 'عميل' ? user.phone : '01012345678');
    const techPhone = techData?.phone || matchedTask?.technician?.phone;

    // 1. Notification specifically targeted to the CLIENT (Customer)
    const clientStatusTitles: Record<TaskStatus, { title: string; body: string }> = {
      in_progress: {
        title: 'بدء تنفيذ طلب الصيانة 🚗🔧',
        body: `الفني ${techData?.name || matchedTask?.technician?.name || 'المعتمد'} قبل طلبك وهو الآن في الطريق إليك ومباشرة العمل. (${matchedTask?.title || 'طلب صيانة'})`,
      },
      closed: {
        title: 'تم إنجاز طلب الصيانة بنجاح ✅',
        body: `تم إنهاء صيانة "${matchedTask?.title || 'طلب الخدمة'}" بنجاح وتسليم العمل. نتمنى تقييم الخدمة!`,
      },
      pending: {
        title: 'طلبك قيد المراجعة وتلقي العروض ⏳',
        body: `طلبك معروض الآن على الفنيين المتاحين في منطقتك. (${matchedTask?.title || 'طلب صيانة'})`,
      },
    };
    const clientInfo = clientStatusTitles[newStatus];
    if (clientInfo) {
      dispatchPushNotification(
        {
          title: clientInfo.title,
          body: clientInfo.body,
          type: 'order_status',
          taskId,
          userPhone: clientPhone,
          senderPhone: user.phone,
          targetRole: 'عميل',
          senderRole: user.role === 'فني' ? 'فني' : 'admin',
          senderName: user.name,
        },
        { role: user.role, phone: user.phone }
      );
    }

    // 2. Notification specifically targeted to the TECHNICIAN
    const techStatusTitles: Record<TaskStatus, { title: string; body: string }> = {
      in_progress: {
        title: 'تم اعتماد بدء تنفيذ الطلب 🔧',
        body: `الطلب "${matchedTask?.title || 'طلب خدمة'}" أصبح جاري التنفيذ الآن. توجه إلى موقع العميل في ${matchedTask?.location.district || 'المنطقة'}.`,
      },
      closed: {
        title: 'تم إنهاء الطلب بنجاح ✅',
        body: `تم اعتماد إنهاء طلب "${matchedTask?.title || 'طلب خدمة'}" وتسليم العمل. شكراً لجهودك!`,
      },
      pending: {
        title: 'طلب معلق بانتظار المراجعة ⏳',
        body: `طلب "${matchedTask?.title || 'طلب خدمة'}" قيد المراجعة وتلقي العروض.`,
      },
    };
    const techInfo = techStatusTitles[newStatus];
    if (techInfo) {
      dispatchPushNotification(
        {
          title: techInfo.title,
          body: techInfo.body,
          type: 'order_status',
          taskId,
          userPhone: techPhone,
          senderPhone: user.phone,
          targetRole: 'فني',
          senderRole: user.role === 'عميل' ? 'عميل' : 'admin',
          senderName: user.name,
        },
        { role: user.role, phone: user.phone }
      );
    }

    showToast(
      newStatus === 'closed'
        ? 'تم إنهاء المهمة ونقلها إلى قائمة المهام المغلقة بنجاح'
        : 'تم تحديث حالة المهمة بنجاح'
    );
  };

  // Push notification testing simulation handler with clear role targeting
  const handleSendTestNotification = async (scenario: TestNotificationScenario) => {
    if (scenario === 'client_offer') {
      const clientPhone = user.role === 'عميل' ? user.phone : '01012345678';
      const created = await dispatchPushNotification(
        {
          title: 'عرض جديد من الفني إبراهيم خليل 💬',
          body: 'الفني إبراهيم خليل (تقييم 4.8 ⭐) أرسل عرضاً بقيمة 120 ج.م على طلب صيانة الكهرباء.',
          type: 'offer_received',
          targetRole: 'عميل',
          userPhone: clientPhone,
          senderRole: 'فني',
          senderName: 'إبراهيم خليل',
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'عميل') {
        setLatestPushNotification(created);
        showToast('تم استلام إشعار العميل: عرض سعر جديد من الفني 💬🔔');
      } else {
        showToast('تم إرسال إشعار العميل سحابياً بنجاح! للتحقق منه بدقة بدّل حسابك لوضع العميل 👤');
      }
    } else if (scenario === 'client_status') {
      const clientPhone = user.role === 'عميل' ? user.phone : '01012345678';
      const created = await dispatchPushNotification(
        {
          title: 'تحديث حالة الطلب: الفني في الطريق إليك 🚗',
          body: 'الفني أحمد حسني تحرك إلى موقعك الآن وسيصل خلال 10 دقائق بإذن الله.',
          type: 'order_status',
          targetRole: 'عميل',
          userPhone: clientPhone,
          senderRole: 'فني',
          senderName: 'المهندس أحمد حسني',
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'عميل') {
        setLatestPushNotification(created);
        showToast('تم استلام إشعار العميل: تحديث حالة الطلب 🚗🔔');
      } else {
        showToast('تم إرسال إشعار العميل سحابياً بنجاح! للتحقق منه بدقة بدّل حسابك لوضع العميل 👤');
      }
    } else if (scenario === 'tech_new_order') {
      const created = await dispatchPushNotification(
        {
          title: 'طلب صيانة جديد متاح في منطقتك 📢',
          body: 'العميل مصطفى عزت يطلب صيانة سباكة بالمعادي بقيمة 180 ج.م. اضغط لتقديم عرضك!',
          type: 'order_status',
          targetRole: 'فني',
          userPhone: user.role === 'فني' ? user.phone : undefined,
          senderRole: 'عميل',
          senderName: 'مصطفى عزت',
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'فني') {
        setLatestPushNotification(created);
        showToast('تم استلام إشعار الفني: طلب جديد متاح بمنطقتك 📢🔧');
      } else {
        showToast('تم إرسال إشعار الفني سحابياً بنجاح! للتحقق منه بدقة بدّل حسابك لوضع الفني 🔧');
      }
    } else if (scenario === 'tech_assigned') {
      const created = await dispatchPushNotification(
        {
          title: 'تم قبول عرضك وبدء تنفيذ الطلب ⚡',
          body: 'العميل وافق على عرض السعر. يرجى التوجه لموقع العمل والتواصل مع العميل.',
          type: 'order_status',
          targetRole: 'فني',
          userPhone: user.role === 'فني' ? user.phone : undefined,
          senderRole: 'عميل',
          senderName: 'مصطفى عزت',
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'فني') {
        setLatestPushNotification(created);
        showToast('تم استلام إشعار الفني: اعتماد عرضك من العميل ⚡🔧');
      } else {
        showToast('تم إرسال إشعار الفني سحابياً بنجاح! للتحقق منه بدقة بدّل حسابك لوضع الفني 🔧');
      }
    } else if (scenario === 'tech_available') {
      const created = await dispatchPushNotification(
        {
          title: 'فني معتمد متاح للعمل الآن! 🟢🔧',
          body: `الفني ${user.name || 'أحمد حسني'} (${user.specialty || 'صيانة عامة'}) متاح الآن لاستقبال طلبات الصيانة في ${currentLocation.district || 'موقعك الحالي'}.`,
          type: 'technician_available',
          targetRole: 'عميل',
          senderRole: 'فني',
          senderName: user.name || 'أحمد حسني',
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'عميل') {
        setLatestPushNotification(created);
        showToast('تم استلام إشعار العميل: فني متاح الآن للخدمة في موقعك 🟢🔧');
      } else {
        showToast('تم إرسال إشعار للعملاء بنجاح: الفني متاح للعمل الآن 🟢📢');
      }
    }
  };

  const handleToggleTechnicianAvailability = async (newAvailability: boolean) => {
    setUser((prev) => {
      const updated: UserProfile = { ...prev, isAvailableForWork: newAvailability };
      localStorage.setItem('fi_khidma_user_registered', JSON.stringify(updated));
      saveUserToCloud(updated);
      return updated;
    });

    if (newAvailability) {
      // Dispatch push notification to customers
      const created = await dispatchPushNotification(
        {
          title: 'فني معتمد متاح للعمل الآن! 🟢🔧',
          body: `الفني ${user.name} (${user.specialty || 'صيانة فورية'}) متاح الآن لاستقبال طلبات الصيانة في موقعك (${currentLocation.district || 'موقعك الحالي'}).`,
          type: 'technician_available',
          targetRole: 'عميل',
          senderRole: 'فني',
          senderName: user.name,
        },
        { role: user.role, phone: user.phone }
      );

      if (user.role === 'عميل') {
        setLatestPushNotification(created);
      }

      showToast(`تم تفعيل وضع "متاح للعمل" 🟢 وإرسال تنبيه فوري لجميع العملاء في موقعك!`);
    } else {
      showToast('تم إيقاف وضع التوفر مؤقتاً (استراحة) ⏸️ لن تستقبل طلبات جديدة حتى إعادة التفعيل.');
    }
  };

  const handleSaveWorkingHours = async (workingHours: WorkingHours, isAvailable: boolean) => {
    const wasAvailable = user.isAvailableForWork;
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        workingHours,
        isAvailableForWork: isAvailable,
      };
      localStorage.setItem('fi_khidma_user_registered', JSON.stringify(updated));
      saveUserToCloud(updated);
      return updated;
    });

    if (isAvailable && !wasAvailable) {
      const created = await dispatchPushNotification(
        {
          title: 'فني معتمد متاح للعمل الآن! 🟢🔧',
          body: `الفني ${user.name} (${user.specialty || 'صيانة فورية'}) متاح الآن لاستقبال طلبات الصيانة في موقعك (${currentLocation.district || 'موقعك الحالي'}).`,
          type: 'technician_available',
          targetRole: 'عميل',
          senderRole: 'فني',
          senderName: user.name,
        },
        { role: user.role, phone: user.phone }
      );
      if (user.role === 'عميل') {
        setLatestPushNotification(created);
      }
      showToast(`تم حفظ ساعات العمل وتفعيل وضع "متاح للعمل" 🟢 وإشعار العملاء فوراً!`);
    } else {
      showToast('تم حفظ جدول مواعيد ساعات العمل والتوفر بنجاح 💾⏱️');
    }
  };

  const handleUpdateLocation = (newLoc: LocationData) => {
    setCurrentLocation(newLoc);
    showToast(`تم اعتماد موقع الخدمة: ${newLoc.district}، ${newLoc.city} 📍`);
  };

  const handleUpdateBalance = (newBalance: number) => {
    setUser((prev) => ({ ...prev, balance: newBalance }));
    showToast(`تم تحديث رصيد المحفظة إلى ${newBalance} ج.م بنجاح 💳`);
  };

  const handleToggleFingerprint = () => {
    if (!user.fingerprintAuth) {
      setIsBiometricsOpen(true);
    } else {
      setUser((prev) => ({ ...prev, fingerprintAuth: false }));
      showToast('تم إيقاف قفل التطبيق بالبصمة');
    }
  };

  const handleBiometricsSuccess = () => {
    setUser((prev) => ({ ...prev, fingerprintAuth: true }));
    showToast('تم تفعيل فتح التطبيق ببصمة الإصبع بنجاح 🔒');
  };

  const handleSelectRole = (newRole: 'عميل' | 'فني') => {
    setUser((prev) => {
      let updated: UserProfile = { ...prev, role: newRole };

      // Ensure distinct profiles and phone numbers during dual-device testing
      if (newRole === 'فني' && (prev.phone === '01012345678' || prev.name === 'مصطفى عزت')) {
        updated = {
          ...updated,
          id: 'user-ahmed',
          name: 'أحمد حسني',
          phone: '01123456789',
          role: 'فني',
          specialty: 'السباكة والأدوات الصحية',
          technicianPoints: prev.technicianPoints || 50,
          isAvailableForWork: true,
        };
      } else if (newRole === 'عميل' && (prev.phone === '01123456789' || prev.name === 'أحمد حسني')) {
        updated = {
          ...updated,
          id: 'user-mostafa',
          name: 'مصطفى عزت',
          phone: '01012345678',
          role: 'عميل',
          balance: prev.balance || 350,
          freeRequestsLeft: prev.freeRequestsLeft || 3,
        };
      }

      localStorage.setItem('fi_khidma_user_registered', JSON.stringify(updated));
      saveUserToCloud(updated);
      return updated;
    });
    sessionStorage.setItem('fi_khidma_role_chosen', 'true');
    setIsRoleSelectionOpen(false);

    setNotifications((prev) => {
      return prev.filter((n) => !n.targetRole || n.targetRole === 'all' || n.targetRole === newRole);
    });

    if (newRole === 'فني') {
      setActiveTab('tech_market');
      showToast('مرحباً بك كـ مقدم خدمة (فني)! فتح صفحة الطلبات المتاحة 🔧⚡');
    } else {
      setActiveTab('home');
      showToast('مرحباً بك كـ طالب خدمة (عميل)! تصفح الخدمات واطلب الآن 🌟');
    }
  };

  const handleToggleRole = () => {
    const newRole: 'عميل' | 'فني' = user.role === 'عميل' ? 'فني' : 'عميل';
    handleSelectRole(newRole);
  };

  const handleUpdateTechnicianServices = (updated: TechnicianOfferedService[]) => {
    setTechnicianServices(updated);
    localStorage.setItem('fi_khidma_tech_services', JSON.stringify(updated));
    showToast('تم تحديث قائمة خدماتك وأسعارك بنجاح ✅');
  };

  // Secret URL Hash / Query Admin Trigger (#admin or ?admin=portal)
  useEffect(() => {
    const checkAdminTrigger = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash === '#admin' ||
        hash === '#admin-portal' ||
        search.includes('admin=1') ||
        search.includes('admin=portal')
      ) {
        if (!isAdminAuthenticated) {
          setIsAdminAuthModalOpen(true);
        } else {
          setIsAdminDashboardOpen(true);
        }
      }
    };
    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);
    return () => window.removeEventListener('hashchange', checkAdminTrigger);
  }, [isAdminAuthenticated]);

  // Admin Authentication Actions
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('fi_khidma_admin_auth', 'true');
    setIsAdminAuthModalOpen(false);
    setIsAdminDashboardOpen(true);
    showToast('تم تسجيل الدخول بصلاحية الإدارة الكاملة بنجاح 👑');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('fi_khidma_admin_auth');
    setIsAdminDashboardOpen(false);
    showToast('تم تسجيل الخروج من وضع الإدارة والعودة لوضع المستخدم العادي');
  };

  // Metrics for Settings cards
  const offersCount = tasks.reduce((sum, t) => sum + (t.offersCount || 0), 0);
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'closed').length;

  return (
    <div className="relative font-['Cairo',sans-serif]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-300 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Floating Admin Session Indicator (Only visible if Admin is authenticated) */}
      {isAdminAuthenticated && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>جلسة المدير نشطة 👑</span>
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black hover:bg-amber-300 transition"
          >
            لوحة التحكم
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold hover:bg-rose-500/30 transition"
          >
            خروج
          </button>
        </div>
      )}

      {/* Main Android Shell Layout */}
      <AndroidLayout
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        userRole={user.role}
        onOpenRoleSelection={() => setIsRoleSelectionOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onBackPress={() => {
          if (detailsTask) setDetailsTask(null);
          else if (trackingTask) setTrackingTask(null);
          else if (chatTechnician) setChatTechnician(null);
          else if (user.role === 'فني' && activeTab !== 'tech_market') setActiveTab('tech_market');
          else if (user.role === 'عميل' && activeTab !== 'home') setActiveTab('home');
        }}
      >
        {/* Tab 1: الرئيسية (Client Only) */}
        {activeTab === 'home' && (
          <HomeTab
            currentLocation={currentLocation}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onSelectService={(cat) => {
              setIsCreateTaskOpen(true);
            }}
            onOpenEmergencyRequest={() => {
              setIsCreateTaskOpen(true);
            }}
            onOpenInstallShare={() => setIsInstallShareOpen(true)}
            categories={categories}
            onRequestCurrentLocation={() => handleRequestCurrentLocation(false)}
            isLocatingGPS={isLocatingGPS}
            isCurrentLocationSelected={isCurrentLocationSelected}
            onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
            isAdmin={isAdminAuthenticated}
            unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            userRole={user.role}
            isAvailableForWork={user.isAvailableForWork ?? true}
            onToggleTechnicianAvailability={handleToggleTechnicianAvailability}
            onOpenWorkingHours={() => setIsWorkingHoursModalOpen(true)}
          />
        )}

        {/* Tab 2: مهامي (Client Only) */}
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            activeStatusTab={activeStatusTab}
            onChangeStatusTab={(tab) => setActiveStatusTab(tab)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onSelectTask={(task) => setDetailsTask(task)}
            onTrackTechnician={(task) => setTrackingTask(task)}
            onChatWithTechnician={handleChatWithTechnician}
            onOpenRateTask={(task) => setRatingTask(task)}
          />
        )}

        {/* Tab 3: خدمات مطلوبة الآن (Technician / مقدم خدمة) */}
        {activeTab === 'tech_market' && (
          <TechnicianMarketplaceTab
            tasks={tasks}
            user={user}
            currentLocation={currentLocation}
            onAcceptTask={(task) => {
              const techData: Technician = {
                id: user.id,
                name: user.name,
                avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
                rating: user.rating,
                reviewsCount: user.reviewsCount,
                phone: user.phone,
                specialty: user.specialty || 'فني صيانة معتمد',
                distanceKm: 1.2,
                isAvailableForWork: user.isAvailableForWork,
                workingHours: user.workingHours,
              };
              handleUpdateTaskStatus(task.id, 'in_progress', techData);
              showToast(`تم قبول الطلب بنجاح! توجه لصفحة "خدماتي" للمباشرة ⚡🔧`);
            }}
            onSubmitOffer={(task, offerAmount, etaMinutes, notes) => {
              const newOffersCount = (task.offersCount || 0) + 1;
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, offersCount: newOffersCount } : t
                )
              );
              updateTaskFieldsInCloud(task.id, { offersCount: newOffersCount });

              dispatchPushNotification(
                {
                  title: 'عرض سعر جديد على طلبك! 🏷️',
                  body: `قدم الفني ${user.name} عرض سعر بقيمة ${offerAmount} ج.م (الوصول خلال ${etaMinutes} دقيقة)`,
                  type: 'offer_received',
                  taskId: task.id,
                  targetRole: 'عميل',
                  userPhone: task.clientPhone,
                  senderPhone: user.phone,
                  senderRole: 'فني',
                  senderName: user.name,
                  data: { offerAmount, etaMinutes, notes },
                },
                { role: user.role, phone: user.phone }
              );
              showToast(`تم إرسال عرض سعرك (${offerAmount} ج.م) للعميل بنجاح 📨✨`);
            }}
            onChatWithClient={handleChatWithTechnician}
            onTrackLocation={(task) => setTrackingTask(task)}
            onToggleAvailability={handleToggleTechnicianAvailability}
            onOpenWorkingHours={() => setIsWorkingHoursModalOpen(true)}
            categories={categories}
          />
        )}

        {/* Tab 4: خدماتي الحالية (Technician / مقدم خدمة) */}
        {activeTab === 'tech_services' && (
          <TechnicianServicesTab
            user={user}
            tasks={tasks}
            services={technicianServices}
            onUpdateServices={handleUpdateTechnicianServices}
            onSelectTask={(task) => setDetailsTask(task)}
            onTrackTask={(task) => setTrackingTask(task)}
            onChatWithClient={handleChatWithTechnician}
            onCompleteTask={(taskId) => handleUpdateTaskStatus(taskId, 'closed')}
            onOpenWorkingHours={() => setIsWorkingHoursModalOpen(true)}
            onToggleAvailability={handleToggleTechnicianAvailability}
          />
        )}

        {/* Tab 5: الدعم */}
        {activeTab === 'support' && (
          <SupportTab
            onOpenLiveChat={() => setIsLiveChatOpen(true)}
            onOpenSupportRecharge={() => setIsWalletOpen(true)}
            onOpenAdminRecharge={() => setIsAdminRechargeOpen(true)}
            onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
            isAdmin={isAdminAuthenticated}
          />
        )}

        {/* Tab 6: الإعدادات */}
        {activeTab === 'settings' && (
          <SettingsTab
            user={user}
            offersCount={offersCount}
            inProgressCount={inProgressCount}
            completedCount={completedCount}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenWalletModal={() => setIsWalletOpen(true)}
            onOpenSupportTab={() => setActiveTab('support')}
            onOpenPermissionsModal={() => setIsPermissionsOpen(true)}
            onOpenRegistrationModal={() => setIsRegistrationOpen(true)}
            onOpenInstallShareModal={() => setIsInstallShareOpen(true)}
            onOpenAdminRecharge={() => setIsAdminRechargeOpen(true)}
            onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
            onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            isAdmin={isAdminAuthenticated}
            onLogout={handleLogout}
            onToggleFingerprint={handleToggleFingerprint}
            onToggleRole={handleToggleRole}
            onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
            unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
            onOpenWorkingHoursModal={() => setIsWorkingHoursModalOpen(true)}
            onToggleTechnicianAvailability={handleToggleTechnicianAvailability}
            onOpenRoleSelection={() => setIsRoleSelectionOpen(true)}
          />
        )}
      </AndroidLayout>

      {/* Mandatory Onboarding & Registration Gate Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onComplete={handleRegistrationComplete}
        onClose={() => setIsRegistrationOpen(false)}
        canClose={Boolean(user.name)}
        initialUser={user}
      />

      {/* PWA / Web vs APK Installation & Sharing Modal */}
      <InstallAndShareModal
        isOpen={isInstallShareOpen}
        onClose={() => setIsInstallShareOpen(false)}
      />

      {/* Modals & Dialogs */}
      {/* 1. Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
        defaultLocation={currentLocation}
        freeRequestsLeft={user.freeRequestsLeft || 0}
        clientBalance={user.balance}
        clientName={user.name}
        clientPhone={user.phone}
        onOpenSupportRecharge={() => setIsWalletOpen(true)}
        categories={categories}
        areas={areas}
      />

      {/* 2. Interactive Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={currentLocation}
        onConfirmLocation={handleUpdateLocation}
        onRequestCurrentLocation={() => handleRequestCurrentLocation(false)}
        isLocatingGPS={isLocatingGPS}
      />

      {/* 3. Task Details Modal */}
      <TaskDetailsModal
        task={detailsTask}
        onClose={() => setDetailsTask(null)}
        onUpdateStatus={handleUpdateTaskStatus}
        onTrackOnMap={(task) => setTrackingTask(task)}
        onOpenChat={(task) => handleChatWithTechnician(task)}
      />

      {/* 4. Technician Tracking On Map Modal */}
      {trackingTask && (
        <TechnicianTrackingModal
          task={trackingTask}
          onClose={() => setTrackingTask(null)}
          onOpenChat={() => {
            handleChatWithTechnician(trackingTask);
            setTrackingTask(null);
          }}
        />
      )}

      {/* 5. Live Customer Support Chat */}
      <SupportChatModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        title="خدمة عملاء فى الخدمة"
      />

      {/* 6. Technician Direct Chat */}
      {chatTechnician && (
        <SupportChatModal
          isOpen={Boolean(chatTechnician)}
          onClose={() => setChatTechnician(null)}
          title={`محادثة ${chatTechnician.technician?.name || 'الفني'}`}
          technicianName={chatTechnician.technician?.name}
        />
      )}

      {/* 7. Wallet & Recharge Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={user.balance}
        freeRequestsLeft={user.freeRequestsLeft || 0}
        technicianPoints={user.technicianPoints || 0}
        role={user.role}
        onUpdateBalance={handleUpdateBalance}
        onUpdateTechPoints={(pts) => {
          setUser((prev) => ({ ...prev, technicianPoints: pts }));
        }}
        onOpenAdminRecharge={() => setIsAdminRechargeOpen(true)}
        isAdmin={isAdminAuthenticated}
      />

      {/* 8. Rating & Reputation Modal */}
      {ratingTask && (
        <RatingModal
          isOpen={Boolean(ratingTask)}
          onClose={() => setRatingTask(null)}
          task={ratingTask}
          userRole={user.role}
          onSubmitRating={handleRatingSubmit}
        />
      )}

      {/* 9. Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      {/* 10. Profile & General Settings Modal */}
      <GeneralSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser((prev) => ({ ...prev, ...updated }));
          showToast('تم تحديث بيانات الحساب بنجاح');
        }}
      />

      {/* 11. Biometrics Fingerprint Dialog */}
      <BiometricsDialog
        isOpen={isBiometricsOpen}
        onClose={() => setIsBiometricsOpen(false)}
        onSuccess={handleBiometricsSuccess}
      />

      {/* 12. Support & Admin User Recharge Modal */}
      <AdminRechargeModal
        isOpen={isAdminRechargeOpen}
        onClose={() => setIsAdminRechargeOpen(false)}
        currentUser={user}
        onUserRecharged={(upUser) => {
          setUser(upUser);
          showToast(`تم شحن وتحديث رصيد الحساب سحابياً بنجاح! ⚡`);
        }}
      />

      {/* 13. Admin Dashboard Modal (Full App Control: Categories, Areas, System Config) */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        categories={categories}
        areas={areas}
        systemConfig={systemConfig}
        currentUser={user}
        onUserRecharged={(upUser) => {
          setUser(upUser);
          showToast(`تم شحن وتحديث رصيد الحساب سحابياً بنجاح! ⚡`);
        }}
        onSaveCategory={async (cat) => {
          const ok = await saveCategoryToCloud(cat);
          if (ok) {
            setCategories((prev) => {
              const idx = prev.findIndex((c) => c.id === cat.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = cat;
                return next;
              }
              return [cat, ...prev];
            });
          }
          return ok;
        }}
        onDeleteCategory={async (catId) => {
          const ok = await deleteCategoryFromCloud(catId);
          if (ok) {
            setCategories((prev) => prev.filter((c) => c.id !== catId));
          }
          return ok;
        }}
        onSaveArea={async (area) => {
          const ok = await saveServiceAreaToCloud(area);
          if (ok) {
            setAreas((prev) => {
              const idx = prev.findIndex((a) => a.id === area.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = area;
                return next;
              }
              return [area, ...prev];
            });
          }
          return ok;
        }}
        onDeleteArea={async (areaId) => {
          const ok = await deleteServiceAreaFromCloud(areaId);
          if (ok) {
            setAreas((prev) => prev.filter((a) => a.id !== areaId));
          }
          return ok;
        }}
        onSaveConfig={async (cfg) => {
          const ok = await saveSystemConfigToCloud(cfg);
          if (ok) {
            setSystemConfig(cfg);
          }
          return ok;
        }}
        onOpenRechargeModal={() => {
          setIsAdminDashboardOpen(false);
          setIsAdminRechargeOpen(true);
        }}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* 14. Admin Authentication Modal (Password + PIN Code Protected) */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* 15. Floating Instant Push Notification Toast Banner */}
      <PushNotificationToast
        notification={latestPushNotification}
        onClose={() => setLatestPushNotification(null)}
        onOpenNotification={(notif) => {
          setLatestPushNotification(null);
          setIsNotificationsOpen(true);
          if (notif.taskId) {
            const t = tasks.find((item) => item.id === notif.taskId);
            if (t) setDetailsTask(t);
          }
        }}
      />

      {/* 16. FCM Push Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        userRole={user.role}
        onMarkAsRead={(id) => markNotificationAsReadInCloud(id)}
        onMarkAllAsRead={() => markAllNotificationsAsReadInCloud(notifications)}
        onClearAll={() => clearAllNotificationsInCloud(notifications)}
        onSelectTask={(taskId) => {
          const t = tasks.find((item) => item.id === taskId);
          if (t) setDetailsTask(t);
        }}
        onSendTestNotification={handleSendTestNotification}
      />

      {/* 17. Technician Working Hours & Availability Modal */}
      <TechnicianWorkingHoursModal
        isOpen={isWorkingHoursModalOpen}
        onClose={() => setIsWorkingHoursModalOpen(false)}
        user={user}
        onSaveWorkingHours={handleSaveWorkingHours}
        onToggleAvailability={handleToggleTechnicianAvailability}
      />

      {/* 18. Role Selection Gate / Switcher Modal (Service Provider vs Service Requester) */}
      <RoleSelectionModal
        isOpen={isRoleSelectionOpen}
        currentRole={user.role}
        onSelectRole={handleSelectRole}
        onClose={() => setIsRoleSelectionOpen(false)}
        canDismiss={Boolean(sessionStorage.getItem('fi_khidma_role_chosen'))}
      />
    </div>
  );
}
