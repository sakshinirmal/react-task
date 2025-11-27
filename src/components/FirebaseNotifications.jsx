import { useEffect, useState } from 'react'
import {
  requestNotificationPermission,
  onMessageListener,
  logErrorToCrashlytics,
  logAnalyticsEvent,
} from '../config/firebase'

const FirebaseNotifications = () => {
  const [token, setToken] = useState(null)
  const [permission, setPermission] = useState('default')
  const [notification, setNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Request permission on mount
    requestPermission()

    // Listen for foreground messages
    const setupMessageListener = async () => {
      try {
        onMessageListener()
          .then((payload) => {
            console.log('Message received:', payload)
            handleForegroundNotification(payload)
          })
          .catch((err) => {
            console.error('Error in message listener:', err)
            logErrorToCrashlytics(err, { source: 'onMessageListener' })
          })
      } catch (error) {
        console.error('Failed to setup message listener:', error)
      }
    }

    setupMessageListener()

    // Listen for service worker messages (background notifications)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION') {
          handleForegroundNotification(event.data.payload)
        }
      })
    }
  }, [])

  const requestPermission = async () => {
    setIsLoading(true)
    try {
      // Register service worker for background notifications
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
          console.log('Service Worker registered:', registration)
        } catch (swError) {
          console.warn('Service Worker registration failed:', swError)
        }
      }

      const result = await requestNotificationPermission()
      setToken(result.token)
      setPermission(result.permission)
      
      if (result.error) {
        console.warn('Permission request warning:', result.error)
      }
      
      if (result.token) {
        logAnalyticsEvent('notification_permission_granted', {
          hasToken: !!result.token,
        })
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      logErrorToCrashlytics(error, { source: 'requestPermission' })
      setPermission('denied')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForegroundNotification = (payload) => {
    const notificationData = {
      id: Date.now(),
      title: payload.notification?.title || payload.data?.title || 'New Notification',
      body: payload.notification?.body || payload.data?.body || 'You have a new message',
      icon: payload.notification?.icon || payload.data?.icon,
      timestamp: new Date(),
      data: payload.data,
    }

    setNotification(notificationData)
    setNotifications((prev) => [notificationData, ...prev])

    // Show browser notification if permission granted
    if (permission === 'granted') {
      showBrowserNotification(notificationData)
    }

    logAnalyticsEvent('notification_received', {
      notificationId: notificationData.id,
    })
  }

  const showBrowserNotification = (notificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/vite.svg',
        badge: '/vite.svg',
        tag: `notification-${notificationData.id}`,
        data: notificationData.data,
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        logAnalyticsEvent('notification_clicked', {
          notificationId: notificationData.id,
        })
      }
    }
  }

  const sendTestNotification = () => {
    setIsLoading(true)
    try {
      const testNotification = {
        id: Date.now(),
        title: 'Congratulations',
        body: 'You are hired for the job',
        icon: '/vite.svg',
        timestamp: new Date(),
        data: { type: 'test' },
      }

      handleForegroundNotification({
        notification: {
          title: testNotification.title,
          body: testNotification.body,
          icon: testNotification.icon,
        },
        data: testNotification.data,
      })

      logAnalyticsEvent('test_notification_sent', {
        notificationId: testNotification.id,
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
      logErrorToCrashlytics(error, { source: 'sendTestNotification' })
    } finally {
      setIsLoading(false)
    }
  }

  const testCrashlytics = () => {
    try {
      // Simulate an error for testing Crashlytics
      throw new Error('Test error for Crashlytics integration')
    } catch (error) {
      logErrorToCrashlytics(error, {
        source: 'testCrashlytics',
        test: true,
        timestamp: new Date().toISOString(),
      })
      alert('Test error logged to Crashlytics! Check Firebase Console.')
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setNotification(null)
  }

  return (
    <div className="relative w-full">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">
        Firebase Notifications & Crashlytics
      </h2>

      <div className="space-y-6">
        {/* Permission Status */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
          <h3 className="mb-4 text-lg font-semibold text-slate-200">
            Notification Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Permission:</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  permission === 'granted'
                    ? 'bg-green-500/20 text-green-400'
                    : permission === 'denied'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {permission.charAt(0).toUpperCase() + permission.slice(1)}
              </span>
            </div>
            {token && (
              <div className="flex flex-col gap-2">
                <span className="text-slate-300">FCM Token:</span>
                <code className="break-all rounded-lg bg-slate-800/50 p-2 text-xs text-slate-400">
                  {token.substring(0, 50)}...
                </code>
              </div>
            )}
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                disabled={isLoading}
                className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Request Notification Permission'}
              </button>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={sendTestNotification}
            disabled={isLoading || permission !== 'granted'}
            className="rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Test Notification'}
          </button>
          <button
            onClick={testCrashlytics}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-base font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/60"
          >
            Test Crashlytics
          </button>
        </div>

        {/* Current Notification */}
        {notification && (
          <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 via-teal-400/5 to-transparent p-6 shadow-lg shadow-cyan-500/20">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cyan-200">
                Latest Notification
              </h3>
              <span className="text-xs text-slate-400">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <h4 className="mb-1 text-base font-medium text-slate-200">
              {notification.title}
            </h4>
            <p className="text-sm text-slate-300">{notification.body}</p>
          </div>
        )}

        {/* Notification History */}
        {notifications.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">
                Notification History ({notifications.length})
              </h3>
              <button
                onClick={clearNotifications}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="rounded-lg border border-white/5 bg-white/5 p-3 transition hover:border-white/10 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{notif.title}</p>
                      <p className="text-sm text-slate-400">{notif.body}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {notif.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default FirebaseNotifications

