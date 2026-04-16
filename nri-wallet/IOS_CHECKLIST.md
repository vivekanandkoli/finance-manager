# ✅ iOS App Setup Checklist

Use this checklist to track your progress converting the Finance Manager to iOS.

## Prerequisites

- [ ] macOS computer available
- [ ] Xcode installed from Mac App Store (version 15+)
- [ ] Xcode Command Line Tools installed: `xcode-select --install`
- [ ] Node.js and npm installed and working
- [ ] Apple Developer account created (free account works for testing)

## Initial Setup (One-Time)

- [ ] Navigate to `nri-wallet` directory: `cd nri-wallet`
- [ ] Run setup script: `npm run ios:setup`
  - Or follow manual steps below:
  - [ ] Install Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/ios`
  - [ ] Build web app: `npm run build`
  - [ ] Add iOS platform: `npx cap add ios`
  - [ ] Sync assets: `npx cap sync ios`
  - [ ] Open Xcode: `npx cap open ios`

## Xcode Configuration (First Time)

- [ ] Project opened in Xcode
- [ ] Selected project name in left sidebar
- [ ] Opened "Signing & Capabilities" tab
- [ ] Selected development team from dropdown
- [ ] Bundle Identifier shows: `com.vivek.financemanager`
- [ ] No signing errors shown

## First Run

- [ ] Selected a simulator from device dropdown (e.g., "iPhone 15 Pro")
- [ ] Clicked Play ▶️ button (or pressed Cmd + R)
- [ ] App built successfully (wait for build to complete)
- [ ] Simulator launched
- [ ] App opened in simulator
- [ ] App displays correctly (no white screen)

## Testing Core Features

Test these features on iOS to ensure they work:

- [ ] **Dashboard** loads with data
- [ ] **Add Expense** form works
- [ ] **Expense List** displays correctly
- [ ] **Categories** work properly
- [ ] **Budget Manager** functions
- [ ] **Analytics/Charts** render correctly
- [ ] **Currency Converter** works
- [ ] **Data Export** (CSV/PDF) downloads
- [ ] **Data Import** uploads files
- [ ] **Search/Filter** functions
- [ ] **Data persists** after closing and reopening app

## Physical Device Testing (Optional but Recommended)

- [ ] iPhone connected via USB
- [ ] iPhone appears in Xcode device dropdown
- [ ] Selected iPhone as target device
- [ ] Clicked Play ▶️ button
- [ ] Accepted "Trust Computer" on iPhone
- [ ] App installed on iPhone
- [ ] Opened app from home screen
- [ ] All features work on physical device

## Performance Check

- [ ] App launches quickly (< 3 seconds)
- [ ] No lag when navigating between screens
- [ ] Charts/animations run smoothly
- [ ] No memory warnings in console
- [ ] App doesn't crash during normal use

## User Interface on iOS

- [ ] Layout looks good on different iPhone sizes
- [ ] Text is readable
- [ ] Buttons are tappable (not too small)
- [ ] Forms work with iOS keyboard
- [ ] Scrolling is smooth
- [ ] Status bar displays correctly
- [ ] Safe area respected (notch/Dynamic Island)

## Optional Enhancements

- [ ] Added app icon (in Xcode Assets.xcassets)
- [ ] Added splash screen
- [ ] Installed @capacitor/status-bar
- [ ] Installed @capacitor/haptics for feedback
- [ ] Installed @capacitor/keyboard
- [ ] Configured proper app display name
- [ ] Added privacy descriptions (if using camera, etc.)

## Regular Development Workflow

Each time you make changes:

- [ ] Make changes to React code
- [ ] Run: `npm run ios:sync` (or `npm run build` + `npx cap sync ios`)
- [ ] Switch to Xcode and run app (it may auto-reload)
- [ ] Test changes in simulator/device
- [ ] Repeat as needed

## Pre-Release Checklist

- [ ] All features tested thoroughly
- [ ] App icon looks good
- [ ] Splash screen configured
- [ ] App name is correct
- [ ] Version number updated
- [ ] No console errors or warnings
- [ ] Tested on multiple iPhone models/sizes
- [ ] Tested on both simulator and physical device
- [ ] Data export/import works
- [ ] Database persists correctly
- [ ] Performance is acceptable

## App Store Submission (When Ready)

- [ ] Apple Developer Program membership ($99/year)
- [ ] App Store Connect account setup
- [ ] App screenshots prepared (required sizes)
- [ ] App description written
- [ ] Privacy policy created (if required)
- [ ] App archived in Xcode (Product → Archive)
- [ ] Archive validated
- [ ] Archive uploaded to App Store Connect
- [ ] App information completed in App Store Connect
- [ ] Submitted for review

## Troubleshooting Reference

If you encounter issues:

| Issue | Solution |
|-------|----------|
| White screen | Run `npm run build && npx cap sync ios` |
| Changes not showing | Clean build folder in Xcode, sync again |
| Signing error | Select your team in Signing & Capabilities |
| Build failed | Check error in Xcode, may need to update dependencies |
| Can't find device | Unlock iPhone, trust computer, replug USB |
| Simulator slow | Close other apps, allocate more RAM to simulator |

## Documentation Links

- [ ] Read [README_iOS.md](./README_iOS.md)
- [ ] Review [../IOS_SETUP_GUIDE.md](../IOS_SETUP_GUIDE.md)
- [ ] Bookmark [Capacitor Docs](https://capacitorjs.com/docs)

---

## Quick Commands Reference

```bash
# Complete setup
npm run ios:setup

# Rebuild and sync
npm run ios:sync

# Open Xcode
npm run ios:open

# Development server (for live reload)
npm run dev
```

---

**Current Status:** _Update as you progress_

- Setup Started: ___________
- First Successful Run: ___________
- Device Testing: ___________
- Ready for Production: ___________

---

Good luck with your iOS app! 🚀📱
