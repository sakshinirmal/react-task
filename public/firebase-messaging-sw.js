// Service Worker for Firebase Cloud Messaging
// This file must be in the public folder to be accessible

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase configuration - must match your firebase.js config
const firebaseConfig = {
  apiKey: "AIzaSyDWMRo91n5ndbAufxG-ylPsvxA3YsxkCm8",
  authDomain: "notify-aa8c5.firebaseapp.com",
  projectId: "notify-aa8c5",
  storageBucket: "notify-aa8c5.firebasestorage.app",
  messagingSenderId: "367357057396",
  appId: "1:367357057396:web:a451649dd005e2ff39f421",
  measurementId: "G-85XEMXFPZ6"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new message',
    icon: payload.notification?.icon || payload.data?.icon || '/vite.svg',
    badge: '/vite.svg',
    data: payload.data,
    tag: `notification-${Date.now()}`,
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.')
  
  event.notification.close()
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

