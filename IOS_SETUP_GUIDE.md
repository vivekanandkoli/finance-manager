# 📱 iOS App Setup Guide - Finance Manager

This guide will walk you through converting your React web app into a native iOS app using Capacitor.

## Prerequisites

- ✅ macOS computer (required for iOS development)
- ✅ Xcode installed (download from Mac App Store)
- ✅ Node.js and npm installed
- ✅ An Apple Developer account (for App Store deployment)

---

## Step 1: Install Capacitor Dependencies

Navigate to your project directory and install Capacitor:

```bash
cd nri-wallet
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

---

## Step 2: Initialize Capacitor

Initialize Capacitor in your project:

```bash
npx cap init
```

When prompted, enter:
- **App name**: `Finance Manager` (or your preferred name)
- **App ID**: `com.yourname.financemanager` (use reverse domain format)
- **Web asset directory**: `dist` (this is where Vite builds to)

---

## Step 3: Update Vite Configuration

Update your `vite.config.js` to ensure proper build output:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173
  }
})
```

---

## Step 4: Build Your Web App

Build your React app for production:

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

---

## Step 5: Add iOS Platform

Add the iOS platform to your project:

```bash
npx cap add ios
```

This creates an `ios` folder with your native iOS project.

---

## Step 6: Configure capacitor.config.ts

The initialization should have created a `capacitor.config.ts` file. Update it:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.financemanager',
  appName: 'Finance Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
  }
};

export default config;
```

---

## Step 7: Sync Your Web App with iOS

Sync your built web assets to the iOS project:

```bash
npx cap sync ios
```

Run this command every time you make changes to your web app and want to test them on iOS.

---

## Step 8: Open in Xcode

Open your iOS project in Xcode:

```bash
npx cap open ios
```

This will launch Xcode with your project.

---

## Step 9: Configure Xcode Project

In Xcode:

1. **Select a development team**:
   - Click on the project name in the left sidebar
   - Select the "Signing & Capabilities" tab
   - Choose your Apple Developer team

2. **Update Bundle Identifier** (if needed):
   - Should match your `appId` from capacitor.config.ts

3. **Configure App Icons** (optional for now):
   - Icons are in `ios/App/App/Assets.xcassets/AppIcon.appiconset`

4. **Configure Display Name**:
   - Select "App" target → "General" tab
   - Update "Display Name" field

---

## Step 10: Run on iOS Simulator or Device

### Run on Simulator:

1. In Xcode, select a simulator from the device dropdown (e.g., "iPhone 15 Pro")
2. Click the Play ▶️ button or press `Cmd + R`

### Run on Physical Device:

1. Connect your iPhone via USB
2. Select your device from the dropdown
3. Click the Play ▶️ button
4. You may need to trust the developer certificate on your device:
   - Settings → General → VPN & Device Management → Trust

---

## Development Workflow

After initial setup, your typical workflow will be:

```bash
# 1. Make changes to your React code
# 2. Build the web app
npm run build

# 3. Sync changes to iOS
npx cap sync ios

# 4. Run in Xcode (or it will auto-reload if already running)
```

**Pro Tip**: For faster development, you can use live reload:

```bash
# Run your dev server
npm run dev

# Then update capacitor.config.ts to point to your local server:
# server: {
#   url: 'http://localhost:5173',
#   cleartext: true
# }

# Sync and run
npx cap sync ios
npx cap open ios
```

Remember to remove the `server.url` before building for production!

---

## Additional Features You Might Want

### Add StatusBar Plugin (for controlling iOS status bar):

```bash
npm install @capacitor/status-bar
```

### Add SplashScreen Plugin:

```bash
npm install @capacitor/splash-screen
```

### Add Haptics (vibration feedback):

```bash
npm install @capacitor/haptics
```

### Add Keyboard Plugin (better keyboard handling):

```bash
npm install @capacitor/keyboard
```

---

## Handling IndexedDB on iOS

Your app uses IndexedDB (via Dexie.js). Capacitor automatically supports this on iOS through WKWebView, so your existing database code should work without changes.

---

## App Store Deployment (When Ready)

1. **Archive your app** in Xcode: Product → Archive
2. **Validate** the archive
3. **Distribute** to App Store Connect
4. **Submit for review** in App Store Connect

---

## Troubleshooting

### Issue: White screen on iOS
- Make sure `npm run build` completed successfully
- Check that `webDir: 'dist'` in capacitor.config.ts matches your build output
- Run `npx cap sync ios` after building

### Issue: Changes not showing
- Always run `npm run build` and `npx cap sync ios` after code changes
- Clean build in Xcode: Product → Clean Build Folder

### Issue: Database not persisting
- iOS Safari/WKWebView has storage limitations
- Consider adding `@capacitor/preferences` for key-value storage
- IndexedDB should work, but test thoroughly

---

## Summary Commands

```bash
# Initial setup (one time)
cd nri-wallet
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init
npx cap add ios

# Every time you make changes
npm run build
npx cap sync ios
npx cap open ios  # Opens Xcode, then press Play
```

---

## Next Steps

1. Follow the steps above in order
2. Test your app on iOS simulator
3. Test on a physical iPhone
4. Add native features as needed
5. Configure app icons and splash screens
6. Submit to App Store when ready

---

**Need Help?**
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)

Good luck with your iOS app! 🚀
