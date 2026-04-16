'use client'

import { useState, useEffect } from 'react'
import { UserTier } from '@/types'

// For now, we'll use local storage. Later, this will connect to Supabase + Stripe
export function useSubscription() {
  const [currentTier, setCurrentTier] = useState<UserTier>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const savedTier = localStorage.getItem('userTier') as UserTier | null
    if (savedTier) {
      setCurrentTier(savedTier)
    }
    setLoading(false)
  }, [])

  const upgradeToTier = async (tier: UserTier) => {
    try {
      setLoading(true)
      
      // In production, this would call Stripe API
      // For now, simulate upgrade
      if (tier === 'pro' || tier === 'family') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In production: Create Stripe checkout session
        // const response = await fetch('/api/stripe/create-checkout', {
        //   method: 'POST',
        //   body: JSON.stringify({ tier }),
        // })
        // const { url } = await response.json()
        // window.location.href = url
        
        // For demo: Just upgrade locally
        localStorage.setItem('userTier', tier)
        setCurrentTier(tier)
        
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

  const cancelSubscription = async () => {
    try {
      setLoading(true)
      
      // In production: Call Stripe to cancel
      // await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
      
      // For demo: Downgrade to free
      localStorage.setItem('userTier', 'free')
      setCurrentTier('free')
      
      return { success: true }
    } catch (error) {
      console.error('Cancel error:', error)
      return { success: false, error: 'Failed to cancel' }
    } finally {
      setLoading(false)
    }
  }

  // Feature access checks
  const hasFeature = (feature: string): boolean => {
    const features: Record<UserTier, string[]> = {
      free: [
        'basic_tracking',
        'currency_converter',
        '2_goals',
        '3_accounts',
      ],
      pro: [
        'basic_tracking',
        'currency_converter',
        'unlimited_goals',
        'unlimited_accounts',
        'ai_insights',
        'remittance_optimizer',
        'rate_alerts',
        'tax_dashboard',
        'bank_parser',
        'pdf_export',
        'email_notifications',
      ],
      family: [
        'basic_tracking',
        'currency_converter',
        'unlimited_goals',
        'unlimited_accounts',
        'ai_insights',
        'remittance_optimizer',
        'rate_alerts',
        'tax_dashboard',
        'bank_parser',
        'pdf_export',
        'email_notifications',
        'family_sharing',
        'ca_access',
        'priority_support',
      ],
    }
    
    return features[currentTier]?.includes(feature) || false
  }

  return {
    currentTier,
    loading,
    upgradeToTier,
    cancelSubscription,
    hasFeature,
    isPro: currentTier === 'pro' || currentTier === 'family',
    isFamily: currentTier === 'family',
    isFree: currentTier === 'free',
  }
}
