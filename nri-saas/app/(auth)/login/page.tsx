'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Chrome, Sparkles, TrendingUp, Shield, Globe2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: Globe2,    title: 'Multi-Currency',    desc: 'Track INR, USD, THB, AED & 20+ currencies simultaneously' },
  { icon: TrendingUp, title: 'Smart Analytics',  desc: 'Net worth, remittance optimizer, portfolio insights' },
  { icon: Shield,    title: 'NRI-First Design',  desc: 'NRE/NRO/FCNR accounts, 80C tracker, DTAA support' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      setSent(true)
      toast.success('Magic link sent! Check your inbox.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #0D0A1A 40%, #0A110F 100%)',
        }}>
        {/* Mesh gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.4) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(0,214,143,0.4) 0%, transparent 70%)' }} />
          <div className="absolute top-2/3 left-1/2 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-bold text-lg shadow-glow">
              ₹
            </div>
            <span className="text-xl font-bold gradient-text">NRI Wallet</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div className="space-y-4">
            <div className="badge-purple inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3" /> AI-Powered Finance
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Your wealth,<br />
              <span className="gradient-text">every currency.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              The only financial dashboard built for NRIs — track, remit, and grow across borders.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl glass"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4 border-t border-white/[0.07]">
            {[
              { label: 'NRI users', value: '2,400+' },
              { label: 'Currencies', value: '25+' },
              { label: 'Monthly savings tracked', value: '₹48Cr+' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold gradient-text">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground relative z-10">
          © 2026 NRI Wallet · Zero cost to start · Open source
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-bold text-lg">₹</div>
            <span className="text-xl font-bold gradient-text">NRI Wallet</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your financial dashboard</p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-premium text-center space-y-4 py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a magic link to <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-primary hover:underline"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Google SSO */}
              <Button
                variant="secondary"
                className="w-full h-12 text-sm"
                onClick={handleGoogle}
                loading={loading}
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">or continue with email</span>
                </div>
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  prefix={<Mail className="w-4 h-4" />}
                  required
                />
                <Button type="submit" className="w-full h-12" loading={loading}>
                  Send magic link
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                No password needed · No credit card · Always free
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
