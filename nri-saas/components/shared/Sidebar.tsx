'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, TrendingUp, ArrowLeftRight, Target,
  PieChart, Bell, Wallet, BarChart3, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, Send, Receipt, Landmark, BookOpen,
  Sparkles, Crown, Command, Menu
} from 'lucide-react'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { cn } from '@/lib/utils/cn'
import { getInitials } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Profile } from '@/types'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/analytics',   icon: BarChart3,        label: 'Analytics' },
      { href: '/wealth',      icon: FileText,         label: 'Wealth Report' },
    ],
  },
  {
    label: 'Money',
    items: [
      { href: '/accounts',    icon: CreditCard,       label: 'Accounts' },
      { href: '/income',      icon: Wallet,           label: 'Income' },
      { href: '/expenses',    icon: Receipt,          label: 'Expenses' },
      { href: '/budgets',     icon: PieChart,         label: 'Budgets' },
      { href: '/bills',       icon: Bell,             label: 'Bills & Recurring' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { href: '/investments', icon: TrendingUp,       label: 'Investments' },
      { href: '/deposits',    icon: Landmark,         label: 'Deposits & FD' },
      { href: '/loans',       icon: BookOpen,         label: 'Loan Tracker' },
      { href: '/goals',       icon: Target,           label: 'Goals' },
    ],
  },
  {
    label: 'NRI',
    items: [
      { href: '/remittance',  icon: Send,             label: 'Remittance', badge: 'NRI' },
      { href: '/tax',         icon: FileText,         label: 'Tax (80C/DTAA)', badge: 'NRI' },
      { href: '/currency',    icon: ArrowLeftRight,   label: 'Currency' },
    ],
  },
  {
    label: 'AI',
    items: [
      { href: '/insights',    icon: Sparkles,         label: 'AI Insights', badge: 'NEW' },
    ],
  },
]

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const supabase = createClient()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Compute x offset: on mobile, hide unless mobileOpen; on desktop always 0
  const sidebarX = isMobile ? (mobileOpen ? 0 : -280) : 0

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile hamburger — only visible on small screens */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-card border border-white/10"
        onClick={() => setMobileOpen(v => !v)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <motion.aside
      animate={{
        width: collapsed ? 72 : 260,
        x: sidebarX,
      }}
      initial={false}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(8,8,12,1) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0',
        collapsed && 'justify-center'
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow-sm">
          ₹
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-lg gradient-text whitespace-nowrap"
            >
              NRI Wallet
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Cmd+K hint */}
      {!collapsed && (
        <div className="px-3 py-2 flex-shrink-0">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/05 transition-colors border border-white/[0.07]"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <Command className="w-3 h-3" />
            <span className="flex-1 text-left">Quick search…</span>
            <kbd className="text-[10px] bg-white/08 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 no-scrollbar">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {section.label}
              </p>
            )}
            {section.items.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    'nav-item mx-2',
                    isActive && 'active',
                    collapsed && 'justify-center px-0 mx-1'
                  )}>
                    <item.icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <span className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded',
                        item.badge === 'NRI' && 'bg-emerald-500/15 text-emerald-400',
                        item.badge === 'NEW' && 'bg-primary/15 text-primary',
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Pro upgrade hint */}
      {!collapsed && profile?.tier === 'free' && (
        <div className="px-3 pb-2 flex-shrink-0">
          <Link href="/settings?tab=billing">
            <div className="p-3 rounded-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(108,99,255,0.06))',
                border: '1px solid rgba(108,99,255,0.2)',
              }}>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-muted-foreground">AI insights, rate alerts & more</p>
            </div>
          </Link>
        </div>
      )}

      {/* User + settings */}
      <div className={cn(
        'border-t border-white/[0.06] p-3 flex-shrink-0 space-y-1',
      )}>
        <div className={cn('flex items-center gap-1', collapsed && 'justify-center')}>
          <Link href="/settings" className="flex-1">
            <div className={cn('nav-item', collapsed && 'justify-center')}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </div>
          </Link>
          {!collapsed && <ThemeToggle />}
        </div>

        {/* Profile */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {profile?.full_name ? getInitials(profile.full_name) : '?'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{profile?.full_name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={handleSignOut} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/08 transition-colors flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-[4.5rem] w-6 h-6 rounded-full bg-[#1A1A2E] border border-white/15 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50 hidden md:flex"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
    </>
  )
}
