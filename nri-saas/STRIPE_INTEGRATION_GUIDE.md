# 💳 Stripe Integration Guide - Production Ready

**Status**: Code is ready for Stripe integration  
**Time to integrate**: 2-3 hours  
**Difficulty**: Medium

---

## 📋 Prerequisites

1. Stripe account ([stripe.com](https://stripe.com))
2. Get your API keys:
   - Test mode: `pk_test_...` and `sk_test_...`
   - Live mode: `pk_live_...` and `sk_live_...`

---

## 🔧 Step 1: Install Dependencies

```bash
cd nri-saas
npm install stripe @stripe/stripe-js
```

---

## 🌐 Step 2: Environment Variables

Update `.env.local`:

```bash
# Stripe Keys (get from dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (create products in Stripe dashboard)
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_FAMILY_PRICE_ID=price_family_monthly

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Step 3: Create Products in Stripe Dashboard

1. Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Click **"Add Product"**

### Pro Plan Product:
- **Name**: NRI Finance Pro
- **Description**: Unlimited accounts, AI insights, bank parser, tax dashboard
- **Pricing**: $5/month (recurring)
- **Copy the Price ID**: `price_xxxxx`

### Family Plan Product:
- **Name**: NRI Finance Family
- **Description**: Everything in Pro + family sharing, CA access
- **Pricing**: $10/month (recurring)
- **Copy the Price ID**: `price_yyyyy`

---

## 📝 Step 4: Create Stripe API Routes

### Create `/api/stripe/create-checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  try {
    const { tier, userId } = await req.json()

    // Map tier to Stripe price ID
    const priceId = tier === 'pro' 
      ? process.env.STRIPE_PRO_PRICE_ID 
      : process.env.STRIPE_FAMILY_PRICE_ID

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=cancelled`,
      client_reference_id: userId, // Link to your user
      metadata: {
        userId,
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
```

---

### Create `/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const tier = session.metadata?.tier

      // Update user's subscription in Supabase
      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      // Handle subscription changes (upgrade/downgrade)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Downgrade user to free tier
      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
```

---

### Create `/api/stripe/cancel-subscription/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    const supabase = createClient()

    // Get user's subscription ID
    const { data: user } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (!user?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(user.stripe_subscription_id)

    // Update user in database
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }
}
```

---

## 🗄️ Step 5: Update Supabase Schema

Run this migration in Supabase SQL editor:

```sql
-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer 
ON users(stripe_customer_id);

-- Create subscription_logs table for tracking
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  from_tier TEXT,
  to_tier TEXT,
  stripe_event_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Step 6: Update useSubscription Hook

Replace the demo upgrade code with real Stripe integration:

```typescript
// In hooks/useSubscription.ts

const upgradeToTier = async (tier: UserTier) => {
  try {
    setLoading(true)
    
    if (tier === 'pro' || tier === 'family') {
      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier,
          userId: user.id 
        }),
      })
      
      const { url } = await response.json()
      
      // Redirect to Stripe checkout
      window.location.href = url
      
      return { success: true }
    }
    
    return { success: false, error: 'Invalid tier' }
  } catch (error) {
    console.error('Upgrade error:', error)
    return { success: false, error: 'Failed to upgrade' }
  } finally {
    setLoading(false)
  }
}
```

---

## 🎣 Step 7: Setup Stripe Webhook

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local dev:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret to `.env.local`

5. For production, add webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

---

## ✅ Step 8: Test the Integration

### Local Testing:

1. Start your app:
   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Test upgrade flow:
   - Go to Settings → Billing
   - Click "Upgrade to Pro"
   - Should redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

4. After payment:
   - Should redirect back to `/settings?upgrade=success`
   - User tier should update to "pro"
   - Check Supabase: subscription_tier should be "pro"

---

## 🚨 Testing with Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

## 🎯 Checklist Before Going Live

- [ ] Test cards work in test mode
- [ ] Webhook receives events successfully
- [ ] Supabase updates correctly
- [ ] Success/cancel redirects work
- [ ] User can access pro features after upgrade
- [ ] Subscription shows in Stripe dashboard
- [ ] Cancel flow works correctly
- [ ] Switch to live API keys
- [ ] Add production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Set up billing alerts in Stripe

---

## 💰 Pricing Recommendations

Based on competitor analysis:

| Plan | Price | What's Included |
|------|-------|----------------|
| Free | $0 | 3 accounts, basic tracking, 2 goals |
| Pro | $5-7/month | Unlimited accounts, AI, bank parser, tax |
| Family | $10-15/month | Everything + family sharing, priority support |

**Recommendation**: Start with $5 Pro, $10 Family

---

## 🔐 Security Best Practices

1. **Never expose Stripe secret key**
   - Only use in API routes (server-side)
   - Never in client components

2. **Verify webhook signatures**
   - Always use `stripe.webhooks.constructEvent()`

3. **Rate limit API routes**
   - Prevent abuse of checkout creation

4. **Log all subscription events**
   - Store in `subscription_logs` table

5. **Handle failed payments gracefully**
   - Send email notifications
   - Grace period before downgrading

---

## 📊 Monitoring & Analytics

Track these metrics:

- Conversion rate (free → pro)
- Monthly recurring revenue (MRR)
- Churn rate
- Average revenue per user (ARPU)
- Failed payment rate

Use Stripe Dashboard for these insights.

---

## 🎉 You're Ready!

Your app now has:
- ✅ Working upgrade flow (localStorage demo)
- ✅ Feature gating by plan
- ✅ Stripe-ready API routes (commented out)
- ✅ Database schema ready
- ✅ Professional UX

**Next**: Follow this guide to go live with real payments! 💳
