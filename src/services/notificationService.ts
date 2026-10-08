import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AppNotification, NotificationType } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Sound effect synthesizer using Web Audio API for 100% reliable offline/online chime
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First pleasant harmonic tone (note 1: F5 ~ 698Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Second higher harmonic tone (note 2: A5 ~ 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.56);
  } catch {
    // Ignore audio context autoplay restriction
  }
}

// Trigger haptic vibration on devices supporting it
export function triggerHapticNotification() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 150]);
    }
  } catch {
    // Ignore haptic errors
  }
}

// Check if browser supports Push Notifications
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current push permission status
export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request permission from the user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Register Firebase Service Worker for Web Push & FCM
export async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[FCM] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[FCM] Service Worker registration notice:', err);
    return null;
  }
}

// Initialize FCM Token retrieval if supported
export async function initializeFCMToken(userPhone?: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;

    // Register SW first
    const swReg = await registerFirebaseServiceWorker();

    // Check if firebase/messaging can be loaded
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { default: appConfig } = await import('../../firebase-applet-config.json');

    const app = (await import('../firebase')).db.app;
    const messaging = getMessaging(app);

    // Request token with SW registration
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swReg || undefined,
    }).catch(() => null);

    if (token) {
      console.log('[FCM] Token retrieved successfully:', token.slice(0, 15) + '...');
      localStorage.setItem('fi_khidma_fcm_token', token);
      if (userPhone) {
        // Save token to user profile document in Firestore
        try {
          const userDoc = doc(db, 'users', userPhone);
          await setDoc(userDoc, { fcmToken: token, lastActive: new Date().toISOString() }, { merge: true });
        } catch {
          // ignore
        }
      }
      return token;
    }
  } catch (err) {
    console.log('[FCM] FCM token initialization note (fallback to real-time notification channel):', err);
  }
  return null;
}

/**
 * Dispatch a rich notification:
 * 1. Plays sound chime (only if current device matches targetRole and userPhone)
 * 2. Haptic vibration (only if current device matches targetRole and userPhone)
 * 3. Shows native browser Notification (if granted & matches target)
 * 4. Saves to Cloud Firestore & Local Storage
 */
export async function dispatchPushNotification(
  notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> & { id?: string },
  caller?: { role?: 'عميل' | 'فني'; phone?: string }
): Promise<AppNotification> {
  const finalNotification: AppNotification = {
    id: notification.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    taskId: notification.taskId,
    timestamp: new Date().toISOString(),
    isRead: false,
    userPhone: notification.userPhone,
    senderPhone: notification.senderPhone || caller?.phone,
    targetRole: notification.targetRole || 'all',
    senderRole: notification.senderRole || (caller?.role === 'فني' ? 'فني' : 'عميل'),
    senderName: notification.senderName,
    data: notification.data,
  };

  // Only trigger audio/vibrate/native notification on current device IF this device is the intended recipient!
  // If caller is the sender of a notification directed to the OTHER role or another phone, DO NOT trigger sound/vibrate on caller's device!
  const isSenderTargetingOther =
    (caller?.role && finalNotification.targetRole && finalNotification.targetRole !== 'all' && finalNotification.targetRole !== caller.role) ||
    (caller?.phone && finalNotification.userPhone && finalNotification.userPhone !== caller.phone);

  if (!isSenderTargetingOther) {
    // 1. Play audio
    playNotificationChime();

    // 2. Vibrate
    triggerHapticNotification();

    // 3. Show System Notification if granted
    if (isPushNotificationSupported() && Notification.permission === 'granted') {
      try {
        new Notification(finalNotification.title, {
          body: finalNotification.body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: finalNotification.id,
          dir: 'rtl',
          lang: 'ar',
        });
      } catch {
        // SW fallback
        navigator.serviceWorker?.ready.then((reg) => {
          reg.showNotification(finalNotification.title, {
            body: finalNotification.body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: finalNotification.id,
            dir: 'rtl',
            lang: 'ar',
          });
        }).catch(() => {});
      }
    }
  }

  // 4. Save to Cloud Firestore for multi-device broadcast
  try {
    const notifDoc = doc(db, NOTIFICATIONS_COLLECTION, finalNotification.id);
    await setDoc(notifDoc, finalNotification, { merge: true });
    console.log('[Notification] Published to Firestore successfully:', finalNotification.id);
  } catch (err) {
    console.warn('[Notification] Firestore save failed, using local fallback:', err);
    try {
      const stored = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
      localStorage.setItem('fi_khidma_notifications', JSON.stringify([finalNotification, ...stored.slice(0, 49)]));
    } catch {
      // ignore
    }
  }

  return finalNotification;
}

/**
 * Real-time subscription to notifications stream filtered by userPhone and userRole.
 * Automatically notifies when a new incoming push arrives from another device.
 */
export function subscribeToNotifications(
  userPhone: string | undefined,
  userRole: 'عميل' | 'فني' | undefined,
  onUpdate: (notifications: AppNotification[]) => void,
  onNewIncomingNotification?: (notification: AppNotification) => void
): Unsubscribe {
  try {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

    let isInitialSnapshot = true;
    const knownDocIds = new Set<string>();

    return onSnapshot(
      q,
      (snapshot) => {
        const notifs: AppNotification[] = [];
        const incomingAlerts: AppNotification[] = [];

        snapshot.forEach((d) => {
          const item = d.data() as AppNotification;
          const notifId = d.id || item.id;
          
          // Role matching:
          const roleMatches =
            !item.targetRole ||
            item.targetRole === 'all' ||
            !userRole ||
            item.targetRole === userRole;

          // Phone matching:
          const phoneMatches = !item.userPhone || !userPhone || item.userPhone === userPhone;

          if (roleMatches && phoneMatches) {
            notifs.push({ ...item, id: notifId });
          }
        });

        // Inspect snapshot doc changes to identify real-time incoming pushes from other devices
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const item = change.doc.data() as AppNotification;
            const notifId = change.doc.id || item.id;

            if (!knownDocIds.has(notifId)) {
              knownDocIds.add(notifId);

              const roleMatches =
                !item.targetRole ||
                item.targetRole === 'all' ||
                !userRole ||
                item.targetRole === userRole;

              const phoneMatches = !item.userPhone || !userPhone || item.userPhone === userPhone;
              const isSentBySelf = Boolean(item.senderPhone && userPhone && item.senderPhone === userPhone);

              const itemTime = item.timestamp ? new Date(item.timestamp).getTime() : 0;
              const isFresh = Date.now() - itemTime < 180000; // Within last 3 minutes

              // If it's a new document added AFTER initial load OR very fresh (within 30s) and unread
              if ((!isInitialSnapshot || (isFresh && !item.isRead)) && roleMatches && phoneMatches && !isSentBySelf) {
                incomingAlerts.push({ ...item, id: notifId });
              }
            }
          }
        });

        isInitialSnapshot = false;

        // Trigger rich alert for newly arrived incoming notifications on this device
        if (incomingAlerts.length > 0) {
          const latestIncoming = incomingAlerts[0];

          // 1. Play pleasant sound chime
          playNotificationChime();

          // 2. Trigger mobile haptic vibration
          triggerHapticNotification();

          // 3. Show native Web Notification
          if (isPushNotificationSupported() && Notification.permission === 'granted') {
            try {
              new Notification(latestIncoming.title, {
                body: latestIncoming.body,
                icon: '/icon.svg',
                badge: '/icon.svg',
                tag: latestIncoming.id,
                dir: 'rtl',
                lang: 'ar',
              });
            } catch {
              navigator.serviceWorker?.ready.then((reg) => {
                reg.showNotification(latestIncoming.title, {
                  body: latestIncoming.body,
                  icon: '/icon.svg',
                  badge: '/icon.svg',
                  tag: latestIncoming.id,
                  dir: 'rtl',
                  lang: 'ar',
                });
              }).catch(() => {});
            }
          }

          // 4. Trigger UI in-app banner toast
          if (onNewIncomingNotification) {
            onNewIncomingNotification(latestIncoming);
          }
        }

        // Also merge local cache
        const local: AppNotification[] = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
        const map = new Map<string, AppNotification>();
        local.forEach((n) => {
          const roleMatches = !n.targetRole || n.targetRole === 'all' || !userRole || n.targetRole === userRole;
          const phoneMatches = !n.userPhone || !userPhone || n.userPhone === userPhone;
          if (roleMatches && phoneMatches) {
            map.set(n.id, n);
          }
        });
        notifs.forEach((n) => map.set(n.id, n));
        const combined = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        onUpdate(combined);
      },
      (error) => {
        console.warn('[Notifications] Firestore subscription error, fallback to local:', error);
        // Fallback to local
        const local: AppNotification[] = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
        const filtered = local.filter((n) => {
          const roleMatches = !n.targetRole || n.targetRole === 'all' || !userRole || n.targetRole === userRole;
          const phoneMatches = !n.userPhone || !userPhone || n.userPhone === userPhone;
          return roleMatches && phoneMatches;
        });
        onUpdate(filtered);
      }
    );
  } catch {
    const local: AppNotification[] = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
    const filtered = local.filter((n) => {
      const roleMatches = !n.targetRole || n.targetRole === 'all' || !userRole || n.targetRole === userRole;
      const phoneMatches = !n.userPhone || !userPhone || n.userPhone === userPhone;
      return roleMatches && phoneMatches;
    });
    onUpdate(filtered);
    return () => {};
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsReadInCloud(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { isRead: true });
  } catch {
    // local fallback
    try {
      const local: AppNotification[] = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
      const updated = local.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
      localStorage.setItem('fi_khidma_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadInCloud(notifications: AppNotification[]): Promise<void> {
  try {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, n.id), { isRead: true }).catch(() => {}))
    );
  } catch {
    // local fallback
  }
  try {
    const local: AppNotification[] = JSON.parse(localStorage.getItem('fi_khidma_notifications') || '[]');
    const updated = local.map((n) => ({ ...n, isRead: true }));
    localStorage.setItem('fi_khidma_notifications', JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotificationsInCloud(notifications: AppNotification[]): Promise<void> {
  try {
    await Promise.all(
      notifications.map((n) => deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, n.id)).catch(() => {}))
    );
  } catch {
    // ignore
  }
  localStorage.setItem('fi_khidma_notifications', '[]');
}

// Initial sample notification generator separated by user role
export function getInitialSampleNotifications(userRole: 'عميل' | 'فني' = 'عميل'): AppNotification[] {
  if (userRole === 'فني') {
    return [
      {
        id: 'notif-tech-welcome',
        title: 'أهلاً بك في بوابة الفنيين المعتمدين 🔧',
        body: 'ستصلك هنا إشعارات فورية بكل طلبات الصيانة الجديدة في منطقتك لتقديم عروض الأسعار مباشرةً.',
        type: 'system',
        targetRole: 'فني',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isRead: false,
      },
      {
        id: 'notif-tech-order',
        title: 'طلب صيانة جديد متاح في منطقتك 📢',
        body: 'العميل مصطفى عزت يطلب صيانة سباكة بالمعادي بقيمة 180 ج.م. اضغط لمعاينة التفاصيل.',
        type: 'order_status',
        targetRole: 'فني',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isRead: false,
      },
    ];
  }

  return [
    {
      id: 'notif-welcome',
      title: 'أهلاً بك في خدمة التنبيهات الفورية 🔔',
      body: 'ستصلك هنا إشعارات فورية عند تحديث حالة أي طلب أو تلقي عروض أسعار جديدة من الفنيين المعتمدين.',
      type: 'system',
      targetRole: 'عميل',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-offer-sample',
      title: 'عرض جديد من فني معتمد 💬',
      body: 'الفني أحمد حسني (تقييم 4.9 ⭐) قدم عرضاً بقيمة 150 ج.م على طلب صيانة تكييف شارب.',
      type: 'offer_received',
      targetRole: 'عميل',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-tech-avail-sample',
      title: 'فني معتمد متاح للعمل الآن! 🟢🔧',
      body: 'المهندس أحمد حسني (سباكة وأدوات صحية ⭐ 4.9) بدأ ساعات عمله وهو متاح الآن لتلقي وتنفيذ طلباتك مباشرةً.',
      type: 'technician_available',
      targetRole: 'عميل',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      isRead: false,
    },
  ];
}

