'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  LayoutDashboard, CreditCard, TrendingUp, Send, Target, Bell,
  BarChart3, FileText, Settings, ArrowLeftRight, Landmark, Receipt,
  Wallet, PieChart, BookOpen, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COMMANDS = [
  { group: 'Navigate',  icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard' },
  { group: 'Navigate',  icon: CreditCard,      label: 'Accounts',        href: '/accounts' },
  { group: 'Navigate',  icon: Wallet,          label: 'Income',          href: '/income' },
  { group: 'Navigate',  icon: Receipt,         label: 'Expenses',        href: '/expenses' },
  { group: 'Navigate',  icon: TrendingUp,      label: 'Investments',     href: '/investments' },
  { group: 'Navigate',  icon: Landmark,        label: 'Deposits & FD',   href: '/deposits' },
  { group: 'Navigate',  icon: BookOpen,        label: 'Loans',           href: '/loans' },
  { group: 'Navigate',  icon: PieChart,        label: 'Budgets',         href: '/budgets' },
  { group: 'Navigate',  icon: Bell,            label: 'Bills',           href: '/bills' },
  { group: 'Navigate',  icon: Target,          label: 'Goals',           href: '/goals' },
  { group: 'Navigate',  icon: BarChart3,       label: 'Analytics',       href: '/analytics' },
  { group: 'Navigate',  icon: FileText,        label: 'Wealth Report',   href: '/wealth' },
  { group: 'NRI Tools', icon: Send,            label: 'Remittance',      href: '/remittance' },
  { group: 'NRI Tools', icon: FileText,        label: 'Tax (80C/DTAA)',  href: '/tax' },
  { group: 'NRI Tools', icon: ArrowLeftRight,  label: 'Currency Rates',  href: '/currency' },
  { group: 'NRI Tools', icon: Sparkles,        label: 'AI Insights',     href: '/insights' },
  { group: 'Account',   icon: Settings,        label: 'Settings',        href: '/settings' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setSearch('')
  }

  const groups = [...new Set(COMMANDS.map(c => c.group))]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="cmd-overlay"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="cmd-box"
            onClick={e => e.stopPropagation()}
          >
            <Command shouldFilter={true} label="Global Command Menu">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search pages, features…"
                autoFocus
              />
              <Command.List>
                <Command.Empty>No results for &ldquo;{search}&rdquo;</Command.Empty>
                {groups.map(group => {
                  const items = COMMANDS.filter(c => c.group === group)
                  return (
                    <Command.Group key={group} heading={group}>
                      {items.map(cmd => (
                        <Command.Item
                          key={cmd.href}
                          value={cmd.label}
                          onSelect={() => navigate(cmd.href)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-white/06 flex items-center justify-center flex-shrink-0">
                            <cmd.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span>{cmd.label}</span>
                          {cmd.group === 'NRI Tools' && (
                            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">NRI</span>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )
                })}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
