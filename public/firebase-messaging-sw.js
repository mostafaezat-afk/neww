// Firebase Messaging Service Worker for Push Notifications
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase inside Service Worker using applet config
const firebaseConfig = {
  projectId: "gen-lang-client-0780896440",
  appId: "1:631580126327:web:dba842f3e19664779aea72",
  apiKey: "AIzaSyBGlWt_3SRzESLYCXnHY6EYqH9vQOwp7MQ",
  authDomain: "gen-lang-client-0780896440.firebaseapp.com",
  messagingSenderId: "631580126327"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'تطبيق فى الخدمة';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'لديك إشعار جديد بخصوص طلب الصيانة',
      icon: '/icon.svg',
      badge: '/icon.svg',
      dir: 'rtl',
      vibrate: [200, 100, 200],
      data: payload.data || {},
      actions: [
        { action: 'open_app', title: 'فتح التطبيق' }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('[firebase-messaging-sw.js] SW init notice:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
