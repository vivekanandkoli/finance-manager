# 🔗 Backend & API Integration Guide

Complete guide for integrating Supabase backend, live currency APIs, and mobile testing.

---

## 📋 Table of Contents

1. [Backend Integration (Supabase)](#1-backend-integration-supabase)
2. [Real-time Currency API](#2-real-time-currency-api)
3. [Mobile Testing](#3-mobile-testing-iospwa)
4. [Testing & Verification](#4-testing--verification)

---

## 1. Backend Integration (Supabase)

### Current Status ✅
- **nri-saas**: Supabase configured, migration files ready
- **nri-wallet**: IndexedDB (local storage) - **needs Supabase sync**

### 1.1 Setup Supabase Project

#### Step 1: Create Supabase Project
```shell
# Go to https://supabase.com
# 1. Sign up / Login
# 2. Create New Project
# 3. Note down:
#    - Project URL
#    - Anon Key
#    - Service Role Key
```

#### Step 2: Configure Environment Variables

**For nri-saas (Next.js):**
```shell
# nri-saas/.env.local
cd nri-saas
cp .env.example .env.local
```

Edit `nri-saas/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other APIs
GROQ_API_KEY=your_groq_key  # Optional for AI insights
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For nri-wallet (React/Vite):**
Create `nri-wallet/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Step 3: Run Database Migration

```shell
cd nri-saas

# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL in Supabase Dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `nri-saas/supabase/migrations/001_initial_schema.sql`
3. Execute the SQL

### 1.2 Connect nri-wallet to Supabase

Currently `nri-wallet` uses IndexedDB. Let's add Supabase sync:

#### Install Dependencies
```shell
cd nri-wallet
npm install @supabase/supabase-js
```

#### Create Supabase Client

Create `nri-wallet/src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_url_here')
}
```

#### Create Sync Service

Create `nri-wallet/src/services/syncService.js`:
```javascript
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { db } from '../db'

class SyncService {
  constructor() {
    this.isSyncing = false
    this.lastSync = localStorage.getItem('lastSync') || null
  }

  // Sync expenses to Supabase
  async syncExpenses() {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using local storage only')
      return
    }

    try {
      this.isSyncing = true
      const expenses = await db.expenses.toArray()

      for (const expense of expenses) {
        const { id, ...data } = expense
        
        // Upsert to Supabase
        const { error } = await supabase
          .from('transactions')
          .upsert({
            id,
            type: 'expense',
            ...data,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })

        if (error) throw error
      }

      localStorage.setItem('lastSync', new Date().toISOString())
      console.log('✅ Expenses synced to Supabase')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  // Pull data from Supabase
  async pullFromSupabase() {
    if (!isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')

      if (error) throw error

      // Merge with local data
      for (const transaction of data) {
        await db.expenses.put(transaction)
      }

      console.log('✅ Pulled data from Supabase')
    } catch (error) {
      console.error('❌ Pull failed:', error)
    }
  }

  // Auto-sync every 5 minutes
  startAutoSync() {
    setInterval(() => {
      this.syncExpenses()
    }, 5 * 60 * 1000)
  }
}

export const syncService = new SyncService()
```

#### Add Sync to App

Update `nri-wallet/src/App.jsx`:
```javascript
import { useEffect } from 'react'
import { syncService } from './services/syncService'

function App() {
  useEffect(() => {
    // Initial sync
    syncService.pullFromSupabase()
    
    // Start auto-sync
    syncService.startAutoSync()
    
    // Sync on window focus
    window.addEventListener('focus', () => syncService.syncExpenses())
    
    return () => {
      window.removeEventListener('focus', () => syncService.syncExpenses())
    }
  }, [])

  // ... rest of your app
}
```

---

## 2. Real-time Currency API

### Current Status ✅
- **nri-wallet**: Already has multi-API fallback system
- **nri-saas**: API route ready at `/api/exchange-rates`

### 2.1 Current Implementation

The currency service already supports:
- ✅ Free tier APIs (exchangerate-api.com, frankfurter.app)
- ✅ Fallback chain (primary → fallback → database)
- ✅ Local caching (5-minute TTL)
- ✅ IndexedDB storage

### 2.2 Upgrade to Premium API (Optional)

For better reliability, consider these premium APIs:

#### Option 1: Fixer.io (Free tier: 100 req/month)
```javascript
// nri-wallet/src/services/currencyService.js

const EXCHANGE_RATE_APIS = {
  fixer: {
    name: 'Fixer.io',
    url: (from, to) => 
      `https://api.fixer.io/latest?access_key=YOUR_KEY&base=${from}&symbols=${to}`,
    extractRate: (data) => data.rates[to]
  },
  // ... existing APIs
}
```

#### Option 2: Open Exchange Rates (Free tier: 1000 req/month)
```javascript
openexchangerates: {
  name: 'OpenExchangeRates',
  url: (from, to) => 
    `https://openexchangerates.org/api/latest.json?app_id=YOUR_KEY&base=${from}&symbols=${to}`,
  extractRate: (data) => data.rates[to]
}
```

### 2.3 Real-time Updates (WebSocket)

For live updates, add WebSocket support:

```javascript
// nri-wallet/src/services/currencyWebSocket.js

export class CurrencyWebSocket {
  constructor() {
    this.ws = null
    this.subscribers = new Set()
  }

  connect(pairs = ['USD-INR', 'EUR-INR']) {
    // Example using free service
    this.ws = new WebSocket('wss://ws.finnhub.io?token=YOUR_TOKEN')
    
    this.ws.onopen = () => {
      pairs.forEach(pair => {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          symbol: pair
        }))
      })
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.notifySubscribers(data)
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(data) {
    this.subscribers.forEach(cb => cb(data))
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
```

### 2.4 Add to Supabase (nri-saas)

The Next.js app already has an API route. Test it:

```shell
cd nri-saas
npm run dev

# Test the endpoint
curl http://localhost:3000/api/exchange-rates?from=USD&to=INR
```

Response should look like:
```json
{
  "from": "USD",
  "to": "INR",
  "rate": 82.5,
  "source": "live",
  "timestamp": "2026-04-16T..."
}
```

---

## 3. Mobile Testing (iOS/PWA)

### Current Status ✅
- ✅ iOS app configured (Capacitor)
- ✅ PWA manifest ready
- ⏳ Need testing on devices

### 3.1 iOS Testing

#### Prerequisites
- Mac with Xcode installed
- iOS device or simulator
- Apple Developer Account (for device testing)

#### Build for iOS

```shell
cd nri-wallet

# Build the web app
npm run build

# Copy to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

#### Test in Xcode
1. Select target device (iPhone simulator or physical device)
2. Click ▶️ Run button
3. App will launch on device

#### Test Checklist
- [ ] App launches successfully
- [ ] Navigation works (all tabs)
- [ ] Add expense form
- [ ] Currency converter
- [ ] Charts render correctly
- [ ] Data persists (IndexedDB)
- [ ] Camera access (for receipts)
- [ ] Offline mode works

### 3.2 PWA Testing

#### Desktop Testing

**Chrome (Mac/Windows/Linux):**
```shell
cd nri-wallet
npm run dev
# Open http://localhost:5173

# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Application tab → Manifest
# 3. Check manifest loads correctly
# 4. Click "Add to Home Screen"
```

**Firefox:**
- Open `about:debugging`
- Enable "Add to Home Screen"

**Safari (Mac):**
- Open http://localhost:5173
- Toolbar → Share → Add to Dock

#### Mobile PWA Testing

**Android (Chrome):**
1. Deploy to production or use ngrok:
   ```shell
   npm install -g ngrok
   npm run build && npm run preview
   ngrok http 4173
   ```
2. Open ngrok URL on Android device
3. Chrome menu → "Add to Home Screen"
4. Test offline mode (airplane mode)

**iOS (Safari):**
1. Open app URL in Safari
2. Share button → "Add to Home Screen"
3. App appears as standalone app

#### PWA Features to Test

**Manifest:**
```json
// nri-wallet/public/manifest.json
{
  "name": "NRI Finance Manager",
  "short_name": "NRI Wallet",
  "description": "Personal finance management for NRIs",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4F46E5",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker:**
```javascript
// nri-wallet/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nri-wallet-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/index.css',
        '/assets/index.js'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

Register in `nri-wallet/src/main.jsx`:
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err))
  })
}
```

### 3.3 Testing Matrix

| Feature | iOS Native | iOS Safari PWA | Android Chrome PWA | Desktop PWA |
|---------|-----------|----------------|-------------------|-------------|
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ⚠️ Limited | ✅ | ❌ |
| Push Notifications | ✅ | ❌ | ✅ | ✅ |
| Biometric Auth | ✅ | ❌ | ⚠️ | ❌ |
| Background Sync | ✅ | ❌ | ✅ | ❌ |
| App Store | ✅ | ❌ | ❌ | ❌ |

---

## 4. Testing & Verification

### 4.1 Backend Integration Tests

```shell
cd nri-saas

# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.from('transactions').select('count').then(console.log);
"

# Test API routes
npm run dev
curl http://localhost:3000/api/exchange-rates?from=USD&to=INR
curl http://localhost:3000/api/insights
```

### 4.2 Currency API Tests

```shell
cd nri-wallet

# Run existing tests
npm test -- currencyService.test.js

# Manual test
npm run dev
# Open Currency Converter
# Try: USD → INR, EUR → INR, GBP → INR
# Check console for API source
```

### 4.3 Mobile Tests

**iOS Simulator:**
```shell
cd nri-wallet
npx cap run ios
```

**Physical Device:**
1. Connect iPhone via USB
2. Trust computer
3. Xcode → Select your device
4. Run

**PWA:**
1. Deploy to Vercel/Netlify
2. Test on actual devices
3. Check "Add to Home Screen"

### 4.4 End-to-End Testing

```shell
cd nri-wallet

# Install Playwright
npm install -D @playwright/test

# Create test file
cat > e2e/pwa.test.js << 'EOF'
import { test, expect } from '@playwright/test'

test('PWA installs correctly', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Check manifest
  const manifest = await page.evaluate(() => {
    return fetch('/manifest.json').then(r => r.json())
  })
  expect(manifest.name).toBe('NRI Finance Manager')
  
  // Check service worker
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator
  })
  expect(swRegistered).toBeTruthy()
})

test('Add expense works offline', async ({ page, context }) => {
  await page.goto('http://localhost:5173')
  
  // Go offline
  await context.setOffline(true)
  
  // Try adding expense
  await page.click('text=Expenses')
  await page.fill('input[name="amount"]', '100')
  await page.fill('input[name="description"]', 'Test expense')
  await page.click('button[type="submit"]')
  
  // Check if saved
  await expect(page.locator('text=Test expense')).toBeVisible()
})
EOF

# Run tests
npx playwright test
```

---

## 5. Deployment Checklist

### 5.1 Before Going Live

**Backend:**
- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Row Level Security (RLS) enabled
- [ ] Backup policy configured

**APIs:**
- [ ] Currency API keys added
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Fallback chain verified

**Mobile:**
- [ ] iOS app tested on devices
- [ ] PWA manifest validated
- [ ] Service worker registered
- [ ] Icons generated (192x192, 512x512)
- [ ] Offline mode works

**Security:**
- [ ] HTTPS enabled
- [ ] API keys secured (environment variables)
- [ ] CORS configured
- [ ] Authentication working
- [ ] Data encryption enabled

### 5.2 Deployment Steps

**Deploy nri-saas (Next.js):**
```shell
cd nri-saas

# Deploy to Vercel
npm install -g vercel
vercel

# Or deploy to other platforms
# Add environment variables in platform dashboard
```

**Deploy nri-wallet (PWA):**
```shell
cd nri-wallet

# Build production
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod

# Or deploy to Vercel, GitHub Pages, etc.
```

**Publish iOS App:**
```shell
cd nri-wallet

# Build for release
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device"
# 2. Product → Archive
# 3. Distribute App → App Store
```

---

## 6. Troubleshooting

### Supabase Issues

**"Invalid API key" error:**
```shell
# Check .env.local file
cat nri-saas/.env.local

# Verify keys in Supabase dashboard
# Settings → API → Project API keys
```

**Database connection timeout:**
```javascript
// Increase timeout
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  auth: { persistSession: true },
  global: { fetch: fetch }
})
```

### Currency API Issues

**All APIs failing:**
```javascript
// Check currencyService fallback chain
// Should use database as last resort
const rate = await currencyService.getExchangeRate('USD', 'INR')
console.log(rate.source) // Should show 'database' if APIs fail
```

**CORS errors:**
```javascript
// Use proxy in vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api/currency': {
        target: 'https://api.exchangerate-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/currency/, '')
      }
    }
  }
})
```

### iOS Build Issues

**"No provisioning profile" error:**
1. Open Xcode
2. Signing & Capabilities
3. Select Team (Apple ID)
4. Xcode will auto-create profile

**"App crashes on launch":**
```shell
# Check console logs in Xcode
# View → Debug Area → Show Debug Area
# Look for error messages
```

### PWA Issues

**"Add to Home Screen" not showing:**
- Ensure HTTPS (required for PWA)
- Check manifest.json is valid
- Service worker must be registered
- Test on actual device (not all browsers support PWA)

**Offline mode not working:**
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations().then(console.log)

// Check cache
caches.keys().then(console.log)
```

---

## 7. Next Steps

### Immediate (Week 1)
1. Set up Supabase project
2. Test currency APIs
3. Deploy PWA to Netlify/Vercel
4. Test on 2-3 devices

### Short-term (Week 2-3)
1. Add real-time sync
2. Implement push notifications
3. Submit iOS app to TestFlight
4. Beta testing with 5-10 users

### Long-term (Month 2+)
1. Add Android native app
2. Implement offline sync queue
3. Add WebSocket for live rates
4. Submit to App Store

---

## 8. Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Capacitor iOS](https://capacitorjs.com/docs/ios)
- [PWA Guide](https://web.dev/progressive-web-apps/)

### APIs
- [ExchangeRate-API](https://www.exchangerate-api.com/) - Free tier
- [Frankfurter](https://www.frankfurter.app/) - Free, no key
- [Fixer.io](https://fixer.io/) - 100 req/month free

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Generate PWA assets
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [ngrok](https://ngrok.com/) - Local testing on mobile

---

## Need Help?

Check existing documentation:
- [README.md](../README.md) - Project overview
- [QUICK_START.md](guides/QUICK_START.md) - Getting started
- [TESTING_GUIDE.md](guides/TESTING_GUIDE.md) - Testing instructions
- [IOS_SETUP_GUIDE.md](../IOS_SETUP_GUIDE.md) - iOS specific setup

Or open an issue in the repository!

---

**Last Updated:** April 16, 2026
**Status:** Ready for implementation ✅
