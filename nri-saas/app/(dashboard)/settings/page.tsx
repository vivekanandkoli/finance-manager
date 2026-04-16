'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, Sparkles, Globe2, Bell, Shield, CreditCard, User, LogOut, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CURRENCIES, UserTier } from '@/types'
import { useSubscription } from '@/hooks/useSubscription'

const TIERS = [
  {
    id: 'free', name: 'Free', price: 0, badge: null,
    features: [
      '3 accounts (1 currency each)',
      'Manual expense tracking',
      'Basic analytics',
      'Currency converter',
      'Goal tracking (2 goals)',
    ],
    missing: ['AI Insights', 'Remittance optimizer', 'Rate alerts', 'Tax module (80C/DTAA)', 'Bank statement parsing', 'Unlimited accounts'],
  },
  {
    id: 'pro', name: 'Pro', price: 5, badge: 'POPULAR',
    features: [
      'Unlimited accounts & currencies',
      'AI Insights (Groq / Llama 3)',
      'Remittance optimizer + rate alerts',
      'Tax dashboard (80C, 80D, DTAA)',
      'Bank statement parsing (HDFC, SBI, SCB)',
      'Wealth report PDF export',
      'Email notifications',
    ],
    missing: ['5-member family access', 'CA/accountant sharing'],
  },
  {
    id: 'family', name: 'Family', price: 10, badge: null,
    features: [
      'Everything in Pro',
      'Up to 5 family members',
      'Shared wealth view',
      'CA / accountant read-only access',
      'Family goal tracking',
      'Priority support',
    ],
    missing: [],
  },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function SettingsPage() {
  const { currentTier, loading: subLoading, upgradeToTier, isPro, isFamily } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async (tier: UserTier) => {
    if (tier === currentTier) return
    
    setUpgrading(true)
    const result = await upgradeToTier(tier)
    setUpgrading(false)
    
    if (result.success) {
      alert(`Successfully upgraded to ${tier.toUpperCase()} plan! 🎉\n\nYou now have access to all ${tier} features including bank statement parsing.`)
      // Refresh the page to update UI
      window.location.reload()
    } else {
      alert(`Failed to upgrade: ${result.error}`)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="page-header mb-0">
        <h1>Settings</h1>
        <p>Profile, preferences, and subscription</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
            <TabsTrigger value="preferences"><Globe2 className="w-3.5 h-3.5" />Preferences</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="billing"><CreditCard className="w-3.5 h-3.5" />Billing</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-3.5 h-3.5" />Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white text-xl font-bold">
                  U
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">User Name</h3>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={isPro || isFamily ? 'default' : 'gray'} className="capitalize">
                      {currentTier} Plan
                    </Badge>
                    <Badge variant="gray">🇮🇳 NRI</Badge>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Change Photo</Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue="User Name" />
                  <Input label="Email" defaultValue="user@example.com" disabled />
                </div>
                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">NRI Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Select>
                      <SelectTrigger label="Home Currency (India)">
                        <SelectValue placeholder="INR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">🇮🇳 INR — Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger label="Work Currency">
                        <SelectValue placeholder="THB" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CURRENCIES).map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger label="Resident Country">
                        <SelectValue placeholder="Thailand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TH">🇹🇭 Thailand</SelectItem>
                        <SelectItem value="AE">🇦🇪 UAE</SelectItem>
                        <SelectItem value="US">🇺🇸 United States</SelectItem>
                        <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                        <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                        <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger label="Financial Year">
                        <SelectValue placeholder="Apr–Mar (India)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="04">Apr–Mar (India)</SelectItem>
                        <SelectItem value="01">Jan–Dec (Calendar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Save Preferences</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <h3 className="font-semibold mb-5">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Monthly summaries and important alerts', key: 'email' },
                  { label: 'Rate Alerts', desc: 'When THB/INR or USD/INR hits your target', key: 'rate' },
                  { label: 'Bill Reminders', desc: '3 days before bills are due', key: 'bills' },
                  { label: 'Weekly Digest', desc: 'Friday summary of your week', key: 'digest' },
                  { label: 'Goal Milestones', desc: 'When you hit 25%, 50%, 75%, 100% of goals', key: 'goals' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                    </div>
                    <div className="w-10 h-6 rounded-full bg-primary/80 relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Current plan */}
              <Card className="bg-primary/[0.06] border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="text-xl font-bold mt-0.5 capitalize">
                      {currentTier === 'free' ? 'Free Forever' : `${currentTier} Plan`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTier === 'free' && '3 accounts · basic features'}
                      {currentTier === 'pro' && 'Unlimited accounts · all pro features'}
                      {currentTier === 'family' && 'Family sharing · priority support'}
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-amber-400" />
                </div>
              </Card>

              {/* Tier cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TIERS.map(tier => (
                  <div key={tier.id}
                    className={`card-premium relative ${tier.id === 'pro' ? 'border-primary/35 glow-purple' : ''}`}>
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="default" className="flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> {tier.badge}
                        </Badge>
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{tier.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        {tier.price === 0
                          ? <span className="text-2xl font-bold">Free</span>
                          : <><span className="text-3xl font-bold">${tier.price}</span><span className="text-muted-foreground text-sm">/mo</span></>
                        }
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      {tier.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={tier.id === currentTier ? 'secondary' : tier.id === 'pro' ? 'default' : 'secondary'}
                      disabled={tier.id === currentTier || upgrading || subLoading}
                      onClick={() => handleUpgrade(tier.id as UserTier)}
                    >
                      {upgrading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {tier.id === currentTier ? 'Current Plan' : `Upgrade to ${tier.name}`}
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Payments processed by Stripe · Cancel anytime · No hidden fees
              </p>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <h3 className="font-semibold mb-5">Security</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/08 border border-emerald-500/15 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Your account is secure</p>
                    <p className="text-xs text-muted-foreground">Signed in with Google OAuth. No password required.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                    Export all my data (GDPR)
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <LogOut className="w-4 h-4" />
                    Sign out all devices
                  </Button>
                  <Button variant="destructive" className="w-full justify-start opacity-60">
                    Delete account permanently
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
