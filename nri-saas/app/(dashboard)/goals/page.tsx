'use client'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const PAGE = __filename.split('/').slice(-2)[0]
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function Page() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 }} }} className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="capitalize">{PAGE.replace(/-/g,' ')}</h1>
          <p>Manage your {PAGE.replace(/-/g,' ')} — full feature coming soon</p>
        </div>
        <Button><Plus className="w-4 h-4"/>Add</Button>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Total', 'This Month', 'YTD'].map(label => (
          <Card key={label} hover>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold font-tabular mt-1 gradient-text">—</p>
            <p className="text-xs text-muted-foreground mt-1">No data yet</p>
          </Card>
        ))}
      </motion.div>
      <motion.div variants={fadeUp}>
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">📊</div>
          <p className="font-semibold">No {PAGE} yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Start by adding your first entry. All data is synced via Supabase.
          </p>
          <Button><Plus className="w-4 h-4"/>Add first entry</Button>
        </Card>
      </motion.div>
    </motion.div>
  )
}
