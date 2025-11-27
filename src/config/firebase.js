import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from 'firebase/analytics'

// Firebase configuration
// NOTE: Replace these with your actual Firebase project credentials
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
const app = initializeApp(firebaseConfig)

// Initialize services
let messaging = null
let analytics = null
let messagingInitPromise = null
let analyticsInitPromise = null

// Initialize messaging (only in browser and if supported)
if (typeof window !== 'undefined') {
  messagingInitPromise = isSupported()
    .then((supported) => {
      if (supported) {
        messaging = getMessaging(app)
        console.log('Firebase Messaging initialized successfully')
        return messaging
      } else {
        console.warn('Firebase Messaging is not supported in this browser')
        return null
      }
    })
    .catch((error) => {
      console.warn('Firebase Messaging initialization failed:', error)
      return null
    })

  analyticsInitPromise = isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
        console.log('Firebase Analytics initialized successfully')
        return analytics
      }
      return null
    })
    .catch((error) => {
      console.warn('Firebase Analytics initialization failed:', error)
      return null
    })
}

// Helper function to get messaging instance (waits for initialization)
const getMessagingInstance = async () => {
  if (!messagingInitPromise) {
    throw new Error('Messaging initialization not started')
  }
  await messagingInitPromise
  if (!messaging) {
    throw new Error('Messaging not supported or failed to initialize')
  }
  return messaging
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const messagingInstance = await getMessagingInstance()
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // VAPID key - Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
      // If you don't have one, click "Generate key pair" in Firebase Console
      const vapidKey = 'YOUR_VAPID_KEY_HERE' // TODO: Replace with your VAPID key from Firebase Console
      
      if (vapidKey === 'YOUR_VAPID_KEY_HERE') {
        console.warn('VAPID key not configured. Please add your VAPID key from Firebase Console.')
        return { 
          token: null, 
          permission,
          error: 'VAPID key not configured. Please add your VAPID key in firebase.js'
        }
      }
      
      try {
        const token = await getToken(messagingInstance, { vapidKey })
        return { token, permission }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError)
        return { 
          token: null, 
          permission,
          error: tokenError.message 
        }
      }
    }
    return { token: null, permission }
  } catch (error) {
    console.error('Error in requestNotificationPermission:', error)
    throw error
  }
}

// Listen for foreground messages
export const onMessageListener = async () => {
  try {
    const messagingInstance = await getMessagingInstance()
    return new Promise((resolve) => {
      onMessage(messagingInstance, (payload) => {
        resolve(payload)
      })
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

// Log error to Crashlytics (simulated - in production, use Firebase Crashlytics SDK)
export const logErrorToCrashlytics = (error, context = {}) => {
  // In a real implementation, you would use:
  // import { getCrashlytics, recordError } from 'firebase/crashlytics'
  // const crashlytics = getCrashlytics(app)
  // recordError(crashlytics, error, context)
  
  // For demo purposes, we'll log to console and could send to a logging service
  console.error('Crashlytics Error:', {
    error: error.message || error,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
  
  // In production, you would send this to Firebase Crashlytics
  // This is a placeholder for the actual Crashlytics integration
}

// Log event to Analytics
export const logAnalyticsEvent = (eventName, params = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params)
    } catch (error) {
      console.error('Failed to log analytics event:', error)
    }
  }
}

export { app, messaging, analytics }

