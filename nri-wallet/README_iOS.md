# 📱 Finance Manager - iOS App

Convert your Finance Manager web app to a native iOS application using Capacitor.

## Quick Start

### Automated Setup (Recommended)

Run the setup script to automate the entire process:

```bash
npm run ios:setup
```

This will:
- ✅ Install Capacitor dependencies
- ✅ Build your web app
- ✅ Add iOS platform
- ✅ Sync assets
- ✅ Open Xcode

### Manual Setup

If you prefer step-by-step control:

```bash
# 1. Install dependencies
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Build web app
npm run build

# 3. Add iOS platform (first time only)
npx cap add ios

# 4. Sync assets
npx cap sync ios

# 5. Open in Xcode
npx cap open ios
```

## Daily Development Workflow

After making changes to your React code:

```bash
# Option 1: Build and sync in one command
npm run ios:sync

# Option 2: Separate commands
npm run build
npx cap sync ios

# Then open Xcode and run
npm run ios:open
```

## In Xcode

1. **First Time Setup:**
   - Click on the project name in left sidebar
   - Go to "Signing & Capabilities" tab
   - Select your Apple Developer team
   - Ensure Bundle Identifier matches `com.vivek.financemanager`

2. **Run the App:**
   - Select a simulator (e.g., iPhone 15 Pro) or connect your iPhone
   - Click the Play button ▶️ or press `Cmd + R`

## Useful Commands

```bash
# Rebuild and sync iOS app
npm run ios:sync

# Open project in Xcode
npm run ios:open

# Run development server
npm run dev

# Build for production
npm run build
```

## Live Reload During Development

For faster development, you can use live reload:

1. Start your dev server:
```bash
npm run dev
```

2. Temporarily update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:5173',
  cleartext: true
}
```

3. Sync and run:
```bash
npx cap sync ios
npm run ios:open
```

4. **Remember:** Remove the `server.url` before building for production!

## Features That Work on iOS

- ✅ All existing web functionality
- ✅ IndexedDB (local database)
- ✅ File downloads/exports
- ✅ Charts and analytics
- ✅ Currency conversion
- ✅ Budget tracking
- ✅ Expense management

## Native iOS Features You Can Add

### Status Bar Control
```bash
npm install @capacitor/status-bar
```

### Splash Screen
```bash
npm install @capacitor/splash-screen
```

### Haptic Feedback
```bash
npm install @capacitor/haptics
```

### Better Keyboard Handling
```bash
npm install @capacitor/keyboard
```

### Biometric Authentication
```bash
npm install @capacitor/biometric
```

### Camera Access
```bash
npm install @capacitor/camera
```

## Troubleshooting

### White Screen on iOS
```bash
# Clean rebuild
npm run build
npx cap sync ios

# In Xcode: Product → Clean Build Folder
# Then run again
```

### Changes Not Showing
```bash
# Always rebuild before syncing
npm run build
npx cap sync ios
```

### Build Errors in Xcode
- Ensure you selected a development team
- Check Bundle Identifier is valid
- Try: Product → Clean Build Folder
- Quit and restart Xcode

### Database Issues
- IndexedDB is fully supported in iOS WKWebView
- Data persists between app launches
- Test thoroughly on device (not just simulator)

## File Structure

```
nri-wallet/
├── capacitor.config.ts    # Capacitor configuration
├── setup-ios.sh           # Automated setup script
├── dist/                  # Built web assets (generated)
├── ios/                   # Native iOS project (generated)
│   └── App/
│       └── App/
│           └── Assets.xcassets/  # App icons here
└── src/                   # Your React source code
```

## App Store Deployment

When ready to publish:

1. **Update App Information:**
   - App icons: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Display name: In Xcode under General → Display Name
   - Version: Update in both `package.json` and Xcode

2. **Archive:**
   - In Xcode: Product → Archive
   
3. **Distribute:**
   - Window → Organizer → Archives
   - Select archive → Distribute App
   - Follow App Store Connect workflow

4. **Submit for Review:**
   - Log into App Store Connect
   - Complete app information and screenshots
   - Submit for review

## Documentation

- 📖 [Full Setup Guide](../IOS_SETUP_GUIDE.md)
- 🔗 [Capacitor Docs](https://capacitorjs.com/docs)
- 🍎 [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- 🎯 [Xcode Guide](https://developer.apple.com/xcode/)

## Need Help?

- Check the [Full Setup Guide](../IOS_SETUP_GUIDE.md) for detailed instructions
- Review [Capacitor Troubleshooting](https://capacitorjs.com/docs/ios/troubleshooting)
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

---

**Ready to go? Run:**

```bash
npm run ios:setup
```

🚀 Your Finance Manager app will be running on iOS in minutes!
