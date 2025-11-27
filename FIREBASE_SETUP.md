# Firebase Setup Instructions

## ✅ What's Already Configured

1. ✅ Firebase SDK installed
2. ✅ Firebase configuration added with your project credentials
3. ✅ Service worker file created for background notifications
4. ✅ Async initialization fixed for messaging and analytics
5. ✅ Error handling improved

## ⚠️ What You Need to Do

### 1. Get Your VAPID Key

The VAPID key is required for push notifications. Here's how to get it:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **notify-aa8c5**
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Go to the **Cloud Messaging** tab
6. Scroll down to **Web Push certificates**
7. If you see a key pair, copy the **Key pair** value
8. If you don't see one, click **Generate key pair** and copy the generated key

### 2. Add VAPID Key to Code

Open `src/config/firebase.js` and replace this line:

```javascript
const vapidKey = 'YOUR_VAPID_KEY_HERE'
```

With your actual VAPID key:

```javascript
const vapidKey = 'YOUR_ACTUAL_VAPID_KEY_FROM_FIREBASE_CONSOLE'
```

### 3. Test the Integration

1. Run your app: `npm run dev`
2. Navigate to the Firebase Notifications component
3. Click "Request Notification Permission"
4. Allow notifications when prompted
5. You should see your FCM token displayed
6. Click "Send Test Notification" to test

## 📝 Notes

- **Foreground notifications**: Will work once VAPID key is added
- **Background notifications**: Service worker is set up and ready
- **Crashlytics**: Currently logs to console. For production, install `@firebase/crashlytics` package
- **Analytics**: Will automatically track events once initialized

## 🔧 Troubleshooting

### "Messaging not initialized" error
- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Check browser console for initialization errors

### "VAPID key not configured" warning
- Make sure you've added your VAPID key in `firebase.js`
- Verify the key is correct in Firebase Console

### Service Worker not registering
- Make sure `firebase-messaging-sw.js` is in the `public` folder
- Check browser console for service worker errors
- Make sure you're accessing the app via HTTPS or localhost

### Notifications not showing
- Check browser notification permissions in browser settings
- Make sure notifications are enabled for your site
- Try clicking "Request Notification Permission" again

## 🚀 Production Checklist

- [ ] VAPID key added to `firebase.js`
- [ ] Service worker tested and working
- [ ] Background notifications tested
- [ ] Error handling verified
- [ ] Analytics events tracking correctly
- [ ] App deployed with HTTPS (required for notifications)

