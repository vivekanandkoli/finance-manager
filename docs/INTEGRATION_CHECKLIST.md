# ✅ Integration Checklist

Quick reference checklist for backend, API, and mobile integration.

---

## 🗄️ Backend (Supabase)

### Initial Setup
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (note: Project URL, Anon Key, Service Key)
- [ ] Create `.env.local` in `nri-saas/`
- [ ] Add Supabase credentials to `.env.local`
- [ ] Create `.env` in `nri-wallet/` with Vite variables

### Database Setup
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy `nri-saas/supabase/migrations/001_initial_schema.sql`
- [ ] Execute migration SQL
- [ ] Verify tables created (check Tables tab)
- [ ] Enable Row Level Security (RLS)

### Testing
- [ ] Test connection from `nri-saas`:
  ```shell
  cd nri-saas && npm run dev
  curl http://localhost:3000/api/exchange-rates?from=USD&to=INR
  ```
- [ ] Install Supabase in `nri-wallet`:
  ```shell
  cd nri-wallet && npm install @supabase/supabase-js
  ```
- [ ] Create `nri-wallet/src/lib/supabase.js` (see guide)
- [ ] Create `nri-wallet/src/services/syncService.js` (see guide)
- [ ] Test sync: Add expense → Check Supabase dashboard

---

## 💱 Currency API

### Already Implemented ✅
- [x] Multi-API fallback system
- [x] Local caching (5min TTL)
- [x] IndexedDB storage
- [x] Database fallback

### Optional Upgrades
- [ ] Sign up for premium API (if needed):
  - [ ] [Fixer.io](https://fixer.io) (100 req/month free)
  - [ ] [OpenExchangeRates](https://openexchangerates.org) (1000 req/month free)
- [ ] Add API key to `.env`
- [ ] Update `currencyService.js` with new API config
- [ ] Test fallback chain

### Testing
- [ ] Open Currency Converter in app
- [ ] Test conversions: USD→INR, EUR→INR, GBP→INR
- [ ] Check browser console for API source
- [ ] Test with network offline (should use database)
- [ ] Verify rate history saves correctly

---

## 📱 Mobile Testing (iOS)

### Prerequisites
- [ ] Mac with Xcode installed (latest version)
- [ ] iOS device OR simulator
- [ ] Apple Developer account (free for testing)

### Build & Test
- [ ] Navigate to `nri-wallet/`
- [ ] Build web app: `npm run build`
- [ ] Sync to iOS: `npx cap sync ios`
- [ ] Open Xcode: `npx cap open ios`
- [ ] Select device/simulator in Xcode
- [ ] Click ▶️ Run button
- [ ] App launches on device

### iOS Feature Testing
- [ ] App launches without crashes
- [ ] Navigation tabs work (Dashboard, Expenses, etc.)
- [ ] Add expense form
- [ ] Currency converter
- [ ] Charts render correctly
- [ ] Data persists after app close
- [ ] Camera access for receipt scanning
- [ ] Offline mode (airplane mode on device)

### TestFlight (Beta Distribution)
- [ ] Archive app in Xcode (Product → Archive)
- [ ] Upload to App Store Connect
- [ ] Create TestFlight beta
- [ ] Invite testers via email
- [ ] Collect feedback

---

## 🌐 PWA Testing

### Desktop Testing

#### Chrome (Mac/Windows/Linux)
- [ ] Run dev server: `cd nri-wallet && npm run dev`
- [ ] Open http://localhost:5173 in Chrome
- [ ] Open DevTools (F12) → Application tab
- [ ] Check Manifest loads correctly
- [ ] Check Service Worker registered
- [ ] Click "Add to Home Screen"
- [ ] Test installed PWA

#### Safari (Mac)
- [ ] Open app in Safari
- [ ] Share button → "Add to Dock"
- [ ] Test standalone app

### Mobile PWA Testing

#### Android (Chrome)
- [ ] Deploy to production OR use ngrok:
  ```shell
  cd nri-wallet
  npm install -g ngrok
  npm run build && npm run preview
  ngrok http 4173
  ```
- [ ] Open ngrok URL on Android device in Chrome
- [ ] Chrome menu → "Add to Home Screen"
- [ ] Test installed PWA
- [ ] Test offline mode (airplane mode)

#### iOS (Safari)
- [ ] Deploy app to production (HTTPS required)
- [ ] Open URL in Safari on iPhone/iPad
- [ ] Share button → "Add to Home Screen"
- [ ] Test standalone app
- [ ] Note: Some features limited vs native app

### PWA Setup Files

#### Manifest
- [ ] Check `nri-wallet/public/manifest.json` exists
- [ ] Verify all fields correct (name, icons, theme)
- [ ] Generate icons if missing:
  - 192x192 icon: `public/icon-192.png`
  - 512x512 icon: `public/icon-512.png`

#### Service Worker
- [ ] Create `nri-wallet/public/sw.js` (see guide)
- [ ] Register SW in `nri-wallet/src/main.jsx`
- [ ] Test offline caching

### PWA Audit
- [ ] Run Lighthouse audit (Chrome DevTools)
- [ ] Check PWA score (should be >80)
- [ ] Fix any warnings
- [ ] Verify installability

---

## 🚀 Deployment

### nri-saas (Next.js Backend)

#### Vercel (Recommended)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate: `cd nri-saas`
- [ ] Deploy: `vercel`
- [ ] Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Other API keys
- [ ] Test production URL

### nri-wallet (Frontend PWA)

#### Netlify (Recommended)
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Navigate: `cd nri-wallet`
- [ ] Build: `npm run build`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Add environment variables in Netlify dashboard
- [ ] Test PWA on mobile devices

#### Vercel Alternative
- [ ] `cd nri-wallet`
- [ ] `vercel`
- [ ] Configure build settings (if needed)

### iOS App Store

#### TestFlight Beta
- [ ] Open Xcode project
- [ ] Select "Any iOS Device"
- [ ] Product → Archive
- [ ] Distribute App → TestFlight
- [ ] Upload to App Store Connect
- [ ] Wait for processing (~10-30 min)
- [ ] Add internal/external testers
- [ ] Send invite links

#### Production Release
- [ ] Complete beta testing
- [ ] Fix reported bugs
- [ ] Prepare App Store listing:
  - Screenshots (required sizes)
  - Description
  - Keywords
  - Privacy policy
- [ ] Submit for review
- [ ] Wait for approval (2-7 days typical)

---

## 🔒 Security Checklist

### Environment Variables
- [ ] Never commit `.env` files to git
- [ ] Use `.env.example` for templates
- [ ] Store secrets in platform dashboards (Vercel/Netlify)
- [ ] Rotate API keys if accidentally exposed

### Supabase Security
- [ ] Enable Row Level Security (RLS)
- [ ] Create policies for user data access
- [ ] Use service role key only on server
- [ ] Never expose service key to client

### API Keys
- [ ] Currency API keys in environment variables
- [ ] Rate limiting configured
- [ ] CORS properly set up
- [ ] Error messages don't leak sensitive info

### HTTPS
- [ ] Production apps served over HTTPS
- [ ] PWA requires HTTPS (except localhost)
- [ ] Check SSL certificate validity

---

## 📊 Testing Matrix

| Feature | Desktop | iOS Native | iOS PWA | Android PWA |
|---------|---------|-----------|---------|-------------|
| **Install** | ✅ | ✅ | ✅ | ✅ |
| **Offline** | ✅ | ✅ | ✅ | ✅ |
| **Camera** | ❌ | ✅ | ⚠️ | ✅ |
| **Push** | ✅ | ✅ | ❌ | ✅ |
| **Biometric** | ❌ | ✅ | ❌ | ⚠️ |
| **Background Sync** | ❌ | ✅ | ❌ | ✅ |

**Legend:**
- ✅ Fully supported
- ⚠️ Limited support
- ❌ Not supported

---

## 🐛 Common Issues

### Supabase
- **Issue:** "Invalid API key"
  - **Fix:** Check `.env.local`, verify keys in Supabase dashboard

- **Issue:** "Connection timeout"
  - **Fix:** Check internet connection, verify project URL

### Currency API
- **Issue:** All APIs failing
  - **Fix:** Should fallback to database automatically

- **Issue:** CORS errors
  - **Fix:** Add proxy in `vite.config.js` or use backend API

### iOS
- **Issue:** "No provisioning profile"
  - **Fix:** Sign in with Apple ID in Xcode → Signing & Capabilities

- **Issue:** App crashes on launch
  - **Fix:** Check Xcode console for error, verify Capacitor config

### PWA
- **Issue:** "Add to Home Screen" not showing
  - **Fix:** Requires HTTPS, check manifest.json, test on real device

- **Issue:** Service worker not registering
  - **Fix:** Check browser console, verify `sw.js` path

---

## ⏱️ Time Estimates

| Task | Estimated Time |
|------|----------------|
| Supabase setup | 30-60 min |
| Database migration | 15 min |
| nri-wallet sync integration | 2-3 hours |
| Currency API testing | 30 min |
| iOS build & test (simulator) | 30 min |
| iOS test on device | 1 hour (first time) |
| PWA setup | 1-2 hours |
| PWA mobile testing | 1 hour |
| Deploy to production | 30 min |
| Total | **8-12 hours** |

---

## 📚 Documentation References

- **Full Integration Guide:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Quick Start:** [guides/QUICK_START.md](guides/QUICK_START.md)
- **iOS Setup:** [../IOS_SETUP_GUIDE.md](../IOS_SETUP_GUIDE.md)
- **Testing Guide:** [guides/TESTING_GUIDE.md](guides/TESTING_GUIDE.md)

---

## ✨ Success Criteria

You've successfully completed integration when:

- [x] Can add expense in app → See it in Supabase dashboard
- [x] Currency converter shows live rates
- [x] iOS app runs on device without crashes
- [x] PWA installs on mobile device
- [x] App works offline
- [x] Data syncs across devices
- [x] Production apps deployed and accessible

---

**🎉 Ready to start? Begin with Supabase setup!**

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed step-by-step instructions.

**Last Updated:** April 16, 2026
