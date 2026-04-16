# 🚀 Quick Start - iOS App (5 Minutes)

Get your Finance Manager running on iOS in just a few commands!

## Prerequisites Check

Open Terminal and verify:

```bash
# Check Node.js (should show version 16+)
node --version

# Check npm
npm --version

# Check Xcode (should open, then close it)
open -a Xcode
```

All working? Great! Let's go! 👇

---

## Step 1: Navigate to Project

```bash
cd /Users/vivekanandkoli/finance-manager/nri-wallet
```

---

## Step 2: Run Automated Setup

```bash
npm run ios:setup
```

This single command will:
- ✅ Install Capacitor iOS packages
- ✅ Build your React app
- ✅ Create iOS project
- ✅ Open Xcode automatically

**Wait for it to complete** (2-3 minutes). Xcode will open when ready.

---

## Step 3: Configure in Xcode

When Xcode opens:

1. **Click** on "App" in the left sidebar (top-most item)
2. **Click** "Signing & Capabilities" tab
3. **Select** your team from "Team" dropdown
   - If you don't have a team, click "Add Account..." and sign in with your Apple ID
   - A free Apple ID works for testing!
4. **Verify** Bundle Identifier shows: `com.vivek.financemanager`

---

## Step 4: Run the App! 🎉

1. **Select** a simulator from the device dropdown (top toolbar)
   - Recommended: "iPhone 15 Pro"
2. **Click** the Play button ▶️ (or press `Cmd + R`)
3. **Wait** for build to complete (first time takes 1-2 minutes)
4. **Watch** your app launch in the iOS simulator!

---

## ✅ Success!

Your Finance Manager is now running as an iOS app! 🎊

Try these features:
- Add an expense
- View analytics
- Check the dashboard
- Test data export

Everything should work exactly like the web version!

---

## What Just Happened?

Your React web app is now:
- ✅ Packaged as a native iOS app
- ✅ Using WKWebView (iOS's web engine)
- ✅ Able to access native iOS features
- ✅ Ready to be published to the App Store

---

## Daily Development Workflow

When you make code changes:

```bash
# In your terminal (inside nri-wallet folder)
npm run ios:sync

# Then in Xcode, click Play ▶️ again
```

That's it! Your changes will appear in the simulator.

---

## Test on Your iPhone (Optional)

1. **Connect** your iPhone via USB cable
2. **Unlock** your iPhone
3. **Trust** your computer (tap "Trust" on iPhone if prompted)
4. **Select** your iPhone in Xcode device dropdown
5. **Click** Play ▶️
6. **Accept** developer certificate on iPhone:
   - Settings → General → VPN & Device Management → Trust

Your app is now on your iPhone! 📱

---

## Troubleshooting

### Problem: White screen in simulator
```bash
npm run build
npx cap sync ios
# Then run in Xcode again
```

### Problem: "No signing certificate"
- Click on project in Xcode
- Go to Signing & Capabilities
- Select a team (even free account works)

### Problem: Build failed
- In Xcode: Product → Clean Build Folder
- Try running again

### Problem: Can't find npm command
- Make sure you're in the `nri-wallet` folder
- Verify Node.js is installed: `node --version`

---

## What's Next?

✅ **Basic Setup Done!** Your app works on iOS.

Optional enhancements:

1. **Add App Icon**
   - Create 1024x1024 PNG icon
   - In Xcode: `ios/App/App/Assets.xcassets/AppIcon.appiconset`
   - Drag your icon to each size slot

2. **Improve Performance**
   ```bash
   npm install @capacitor/status-bar @capacitor/splash-screen
   ```

3. **Test Thoroughly**
   - Try all features in the app
   - Test on different iPhone models
   - Check data persistence

4. **Prepare for App Store**
   - See [IOS_CHECKLIST.md](./IOS_CHECKLIST.md) for full list

---

## Helpful Commands

```bash
# Rebuild and sync changes
npm run ios:sync

# Just open Xcode
npm run ios:open

# Build web app only
npm run build

# Development server (web)
npm run dev
```

---

## Documentation

- 📖 **Quick Reference**: This file
- 📋 **Detailed Steps**: [README_iOS.md](./README_iOS.md)
- ✅ **Checklist**: [IOS_CHECKLIST.md](./IOS_CHECKLIST.md)
- 📚 **Full Guide**: [../IOS_SETUP_GUIDE.md](../IOS_SETUP_GUIDE.md)

---

## Need Help?

**Common Questions:**

**Q: How do I update the app after code changes?**  
A: Run `npm run ios:sync` then click Play ▶️ in Xcode

**Q: Can I publish to App Store?**  
A: Yes! You'll need a paid Apple Developer account ($99/year)

**Q: Does my database work on iOS?**  
A: Yes! IndexedDB works perfectly on iOS

**Q: Can I test on my iPhone?**  
A: Yes! Just connect via USB and select it in Xcode

---

**🎉 Congratulations!** You now have a native iOS app!

Your Finance Manager is officially cross-platform! 🚀📱

---

*Setup time: ~5 minutes | First build: ~2 minutes | Subsequent builds: ~30 seconds*
