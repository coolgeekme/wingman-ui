// Wingman Push Notification Service Worker
// Handles incoming push events and notification clicks

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  let data = {
    title: 'Wingman',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: 'https://agent.coolgeek.me',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || 'https://agent.coolgeek.me',
    },
    actions: [
      { action: 'open', title: 'Open Wingman' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || 'https://agent.coolgeek.me';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('agent.coolgeek.me') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return self.clients.openWindow(targetUrl);
    })
  );
});
