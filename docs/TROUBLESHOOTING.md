# 🔧 Troubleshooting Guide

Quick solutions to common issues with backend integration, APIs, and mobile testing.

---

## 📋 Table of Contents

1. [Supabase Connection Issues](#supabase-connection-issues)
2. [Currency API Problems](#currency-api-problems)
3. [iOS Build Errors](#ios-build-errors)
4. [PWA Installation Issues](#pwa-installation-issues)
5. [Data Sync Problems](#data-sync-problems)
6. [Performance Issues](#performance-issues)

---

## 🗄️ Supabase Connection Issues

### Error: "Invalid API key"

**Symptoms:**
```
Error: Invalid API key
or
Unauthorized: API key is invalid
```

**Solutions:**

1. **Check environment variables:**
   ```shell
   # For nri-saas
   cat nri-saas/.env.local | grep SUPABASE
   
   # For nri-wallet
   cat nri-wallet/.env | grep VITE_SUPABASE
   ```

2. **Verify keys in Supabase dashboard:**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select project → Settings → API
   - Copy keys again (don't copy extra spaces!)

3. **Restart dev server:**
   ```shell
   # Kill server (Ctrl+C) and restart
   npm run dev
   ```

4. **Check key format:**
   ```env
   # WRONG ❌
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   
   # CORRECT ✅
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```

---

### Error: "Could not connect to Supabase"

**Symptoms:**
- Timeout errors
- Connection refused
- Network errors

**Solutions:**

1. **Check internet connection:**
   ```shell
   ping supabase.com
   ```

2. **Verify project URL:**
   ```shell
   curl https://your-project.supabase.co/rest/v1/
   ```

3. **Check Supabase status:**
   - Visit [status.supabase.com](https://status.supabase.com)

4. **Increase timeout:**
   ```javascript
   // In lib/supabase/client.ts
   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         db: { schema: 'public' },
         global: {
           fetch: (...args) => {
             const [url, config = {}] = args
             return fetch(url, {
               ...config,
               signal: AbortSignal.timeout(30000) // 30 seconds
             })
           }
         }
       }
     )
   }
   ```

---

### Error: "Row Level Security policy violation"

**Symptoms:**
```
Error: new row violates row-level security policy for table "transactions"
```

**Solutions:**

1. **Disable RLS temporarily (development only):**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
   ```

2. **Add proper RLS policies:**
   ```sql
   -- Enable RLS
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   
   -- Allow users to see only their data
   CREATE POLICY "Users can view own transactions"
   ON transactions FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Allow users to insert their data
   CREATE POLICY "Users can insert own transactions"
   ON transactions FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   
   -- Allow users to update their data
   CREATE POLICY "Users can update own transactions"
   ON transactions FOR UPDATE
   USING (auth.uid() = user_id);
   ```

3. **Use service role key (backend only):**
   ```javascript
   // Server-side only! Never expose service role key to client
   const { createClient } = require('@supabase/supabase-js')
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS
   )
   ```

---

## 💱 Currency API Problems

### Error: "All exchange rate sources failed"

**Symptoms:**
- Currency converter shows error
- No rates loaded
- API 503 errors

**Solutions:**

1. **Check API status:**
   ```shell
   # Test primary API
   curl https://api.exchangerate-api.com/v4/latest/USD
   
   # Test fallback API
   curl https://api.frankfurter.app/latest?from=USD&to=INR
   ```

2. **Verify database fallback:**
   ```javascript
   // Open browser console in Currency Converter page
   const service = new CurrencyService()
   const rate = await service.getExchangeRate('USD', 'INR')
   console.log(rate.source) // Should show 'database' if APIs fail
   ```

3. **Check network connectivity:**
   ```shell
   # Test CORS
   curl -I https://api.exchangerate-api.com/v4/latest/USD
   ```

4. **Add proxy (if CORS issues):**
   ```javascript
   // vite.config.js
   export default defineConfig({
     server: {
       proxy: {
         '/api/rates': {
           target: 'https://api.exchangerate-api.com',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api\/rates/, '/v4/latest')
         }
       }
     }
   })
   ```

---

### Error: "Rate limit exceeded"

**Symptoms:**
```
Error: 429 Too Many Requests
```

**Solutions:**

1. **Check cache first:**
   ```javascript
   // Increase cache TTL in currencyService.js
   const CACHE_TTL = 10 * 60 * 1000; // 10 minutes instead of 5
   ```

2. **Use database more:**
   ```javascript
   // Modify getExchangeRate to prefer database for recent rates
   async getExchangeRate(fromCurrency, toCurrency) {
     const cacheKey = `${fromCurrency}_${toCurrency}`;
     
     // Check cache
     const cached = this.getCachedRate(cacheKey);
     if (cached) return { rate: cached, source: 'cache' };
     
     // Check database first (if rate is less than 1 hour old)
     try {
       const dbRate = await this.getLastKnownRate(fromCurrency, toCurrency);
       const oneHourAgo = Date.now() - 60 * 60 * 1000;
       if (dbRate && dbRate.timestamp > oneHourAgo) {
         return { rate: dbRate.rate, source: 'database' };
       }
     } catch (e) {}
     
     // Then try APIs
     // ... rest of code
   }
   ```

3. **Upgrade to paid API:**
   - [Fixer.io](https://fixer.io) - 1000 req/month for $10
   - [OpenExchangeRates](https://openexchangerates.org) - 100k req/month for $29

---

### Error: "CORS policy blocked"

**Symptoms:**
```
Access to fetch at 'https://api.example.com' has been blocked by CORS policy
```

**Solutions:**

1. **Use backend proxy (recommended):**
   ```javascript
   // nri-saas/app/api/currency/route.ts
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url)
     const from = searchParams.get('from')
     const to = searchParams.get('to')
     
     const res = await fetch(
       `https://api.exchangerate-api.com/v4/latest/${from}`
     )
     const data = await res.json()
     
     return Response.json({
       from,
       to,
       rate: data.rates[to],
       source: 'api'
     })
   }
   ```

2. **Update frontend to use backend:**
   ```javascript
   // In currencyService.js
   async fetchFromAPI(from, to) {
     const res = await fetch(`/api/currency?from=${from}&to=${to}`)
     return res.json()
   }
   ```

3. **Use CORS-anywhere (development only):**
   ```javascript
   const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
   const apiUrl = 'https://api.example.com/...'
   fetch(proxyUrl + apiUrl)
   ```

---

## 📱 iOS Build Errors

### Error: "No provisioning profile found"

**Symptoms:**
```
error: No profiles for 'com.yourapp.id' were found
```

**Solutions:**

1. **Sign in to Xcode with Apple ID:**
   - Xcode → Settings → Accounts
   - Click ➕ → Apple ID
   - Sign in

2. **Enable automatic signing:**
   - Select project in Xcode
   - Signing & Capabilities tab
   - Check "Automatically manage signing"
   - Select Team (your Apple ID)

3. **Change bundle identifier:**
   ```javascript
   // capacitor.config.ts
   const config: CapacitorConfig = {
     appId: 'com.yourname.nriwallet', // Must be unique
     appName: 'NRI Wallet',
     // ...
   }
   ```

4. **Sync changes:**
   ```shell
   npx cap sync ios
   ```

---

### Error: "Command PhaseScriptExecution failed"

**Symptoms:**
- Build fails with script error
- Usually related to CocoaPods

**Solutions:**

1. **Clean build folder:**
   ```shell
   cd ios/App
   rm -rf Pods Podfile.lock
   pod install
   ```

2. **Update CocoaPods:**
   ```shell
   sudo gem install cocoapods
   pod repo update
   ```

3. **Clean Xcode build:**
   - Xcode → Product → Clean Build Folder (⇧⌘K)
   - Delete derived data:
     ```shell
     rm -rf ~/Library/Developer/Xcode/DerivedData
     ```

4. **Rebuild:**
   ```shell
   npx cap sync ios
   npx cap open ios
   # Then build in Xcode
   ```

---

### Error: "App crashes immediately on launch"

**Symptoms:**
- App opens then closes
- No error dialog

**Solutions:**

1. **Check Xcode console:**
   - Xcode → View → Debug Area → Show Debug Area
   - Look for error messages

2. **Common crash causes:**
   
   **Missing Capacitor plugins:**
   ```shell
   cd nri-wallet
   npm install @capacitor/camera @capacitor/filesystem
   npx cap sync ios
   ```

   **JavaScript errors:**
   ```javascript
   // Check main.jsx for errors
   // Wrap in try/catch
   try {
     ReactDOM.createRoot(document.getElementById('root')).render(
       <App />
     )
   } catch (error) {
     console.error('App failed to start:', error)
   }
   ```

   **Permissions not declared:**
   ```xml
   <!-- ios/App/App/Info.plist -->
   <key>NSCameraUsageDescription</key>
   <string>We need camera access to scan receipts</string>
   ```

3. **Test in simulator first:**
   ```shell
   npx cap run ios
   ```

---

### Error: "Module 'Capacitor' not found"

**Symptoms:**
```
Cannot find 'Capacitor' in scope
```

**Solutions:**

1. **Install Capacitor:**
   ```shell
   cd nri-wallet
   npm install @capacitor/core @capacitor/cli
   ```

2. **Sync to iOS:**
   ```shell
   npx cap sync ios
   ```

3. **If still failing, reinstall iOS platform:**
   ```shell
   npx cap remove ios
   npx cap add ios
   npx cap sync ios
   ```

---

## 🌐 PWA Installation Issues

### "Add to Home Screen" not appearing

**Symptoms:**
- No install prompt
- Option not in browser menu

**Solutions:**

1. **Check HTTPS requirement:**
   - PWA requires HTTPS (except localhost)
   - Deploy to Netlify/Vercel for HTTPS
   - Or use ngrok:
     ```shell
     npm install -g ngrok
     npm run build && npm run preview
     ngrok http 4173
     ```

2. **Validate manifest.json:**
   ```shell
   # Check manifest loads
   curl http://localhost:5173/manifest.json
   ```

   **Required fields:**
   ```json
   {
     "name": "NRI Wallet",
     "short_name": "NRI Wallet",
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

3. **Check service worker:**
   ```javascript
   // Open browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     console.log('Service workers:', registrations)
     if (registrations.length === 0) {
       console.log('❌ No service worker registered')
     }
   })
   ```

4. **Run Lighthouse audit:**
   - Chrome DevTools → Lighthouse
   - Select "Progressive Web App"
   - Click "Generate report"
   - Fix issues listed

5. **Test on real device:**
   - Some browsers don't support PWA in development
   - Deploy and test on actual mobile device

---

### Service Worker not updating

**Symptoms:**
- Changes not reflecting
- Old content cached

**Solutions:**

1. **Unregister old service worker:**
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => {
       registration.unregister()
     })
   })
   ```

2. **Clear cache:**
   ```javascript
   // In browser console
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key))
   })
   ```

3. **Force update in service worker:**
   ```javascript
   // sw.js
   const CACHE_VERSION = 'v2' // Increment this
   
   self.addEventListener('install', (event) => {
     self.skipWaiting() // Force activate new SW
   })
   
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then(keys => {
         return Promise.all(
           keys.filter(key => key !== CACHE_VERSION)
             .map(key => caches.delete(key))
         )
       })
     )
   })
   ```

4. **Disable cache during development:**
   - Chrome DevTools → Network tab
   - Check "Disable cache"

---

### Offline mode not working

**Symptoms:**
- App shows error when offline
- Content doesn't load

**Solutions:**

1. **Check service worker caching:**
   ```javascript
   // sw.js - Make sure files are cached
   const CACHE_FILES = [
     '/',
     '/index.html',
     '/assets/index.js',
     '/assets/index.css',
     '/manifest.json',
     '/icon-192.png'
   ]
   
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open('nri-wallet-v1').then(cache => {
         return cache.addAll(CACHE_FILES)
       })
     )
   })
   ```

2. **Implement offline fallback:**
   ```javascript
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then(response => response || fetch(event.request))
         .catch(() => {
           // Return offline page if network fails
           if (event.request.mode === 'navigate') {
             return caches.match('/offline.html')
           }
         })
     )
   })
   ```

3. **Test offline:**
   - Chrome DevTools → Application → Service Workers
   - Check "Offline"
   - Refresh page

---

## 🔄 Data Sync Problems

### Data not syncing between devices

**Symptoms:**
- Add expense on device A
- Doesn't appear on device B

**Solutions:**

1. **Check Supabase connection:**
   ```javascript
   // In browser console
   const { data, error } = await supabase
     .from('transactions')
     .select('count')
   console.log('Transactions:', data, error)
   ```

2. **Verify user authentication:**
   ```javascript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user)
   ```

3. **Check sync service:**
   ```javascript
   // In App.jsx, ensure sync is called
   useEffect(() => {
     syncService.pullFromSupabase() // Initial sync
     syncService.startAutoSync() // Periodic sync
   }, [])
   ```

4. **Manual sync button:**
   ```javascript
   // Add sync button in UI
   <button onClick={() => syncService.syncExpenses()}>
     🔄 Sync Now
   </button>
   ```

5. **Check for errors:**
   ```javascript
   // In syncService.js, add better error logging
   async syncExpenses() {
     try {
       console.log('📤 Starting sync...')
       const expenses = await db.expenses.toArray()
       console.log(`Found ${expenses.length} expenses to sync`)
       
       for (const expense of expenses) {
         console.log(`Syncing expense ${expense.id}...`)
         const { error } = await supabase
           .from('transactions')
           .upsert(expense)
         
         if (error) {
           console.error('❌ Sync error:', error)
         } else {
           console.log('✅ Synced:', expense.id)
         }
       }
     } catch (error) {
       console.error('❌ Sync failed:', error)
       throw error
     }
   }
   ```

---

### Duplicate data after sync

**Symptoms:**
- Same expense appears twice
- Data multiplies on sync

**Solutions:**

1. **Use upsert instead of insert:**
   ```javascript
   // Use upsert which handles duplicates
   const { error } = await supabase
     .from('transactions')
     .upsert(
       { id: expense.id, ...data },
       { onConflict: 'id' } // Update if ID exists
     )
   ```

2. **Ensure consistent IDs:**
   ```javascript
   // Use UUID for IDs
   import { v4 as uuidv4 } from 'uuid'
   
   const expense = {
     id: uuidv4(), // Consistent across devices
     amount: 100,
     // ...
   }
   ```

3. **Add sync timestamp:**
   ```javascript
   // Track last sync to avoid duplicates
   const lastSync = localStorage.getItem('lastSync')
   
   if (lastSync) {
     // Only sync items modified since last sync
     const { data } = await supabase
       .from('transactions')
       .select('*')
       .gte('updated_at', lastSync)
   }
   ```

---

## ⚡ Performance Issues

### App loading slowly

**Solutions:**

1. **Enable code splitting:**
   ```javascript
   // Use React.lazy for route components
   const Dashboard = lazy(() => import('./pages/Dashboard'))
   const Expenses = lazy(() => import('./pages/Expenses'))
   
   <Suspense fallback={<Loading />}>
     <Routes>
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/expenses" element={<Expenses />} />
     </Routes>
   </Suspense>
   ```

2. **Optimize bundle size:**
   ```shell
   # Analyze bundle
   npm run build
   npx vite-bundle-visualizer
   
   # Remove unused dependencies
   npm uninstall unused-package
   ```

3. **Add loading states:**
   ```javascript
   {isLoading && <Skeleton />}
   {!isLoading && <Content />}
   ```

---

### Database queries too slow

**Solutions:**

1. **Add indexes in Supabase:**
   ```sql
   -- In Supabase SQL Editor
   CREATE INDEX idx_transactions_user_date 
   ON transactions (user_id, date);
   
   CREATE INDEX idx_transactions_category 
   ON transactions (category);
   ```

2. **Limit query results:**
   ```javascript
   // Don't fetch all data at once
   const { data } = await supabase
     .from('transactions')
     .select('*')
     .order('date', { ascending: false })
     .limit(50) // Only recent 50
   ```

3. **Use pagination:**
   ```javascript
   const PAGE_SIZE = 20
   const { data } = await supabase
     .from('transactions')
     .select('*')
     .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
   ```

---

## 🆘 Still Having Issues?

### Get Help

1. **Check console errors:**
   - Browser console (F12)
   - Xcode console (View → Debug Area)
   
2. **Enable verbose logging:**
   ```javascript
   // Add to top of your app
   window.DEBUG = true
   
   // Then use throughout
   if (window.DEBUG) console.log('Debug info:', data)
   ```

3. **Check GitHub Issues:**
   - [Supabase Issues](https://github.com/supabase/supabase/issues)
   - [Capacitor Issues](https://github.com/ionic-team/capacitor/issues)

4. **Community Help:**
   - [Supabase Discord](https://discord.supabase.com/)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

5. **Open an issue** in your project repository with:
   - Error message
   - Steps to reproduce
   - Browser/OS version
   - Console logs

---

## 📚 Related Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Detailed setup instructions
- [Integration Checklist](INTEGRATION_CHECKLIST.md) - Step-by-step checklist
- [Testing Guide](guides/TESTING_GUIDE.md) - Testing procedures

---

**Last Updated:** April 16, 2026
**💡 Tip:** Always check browser console first - 90% of issues show error messages there!
