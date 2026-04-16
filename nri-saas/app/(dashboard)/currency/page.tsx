'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown, RefreshCw, Clock, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
]

// Demo exchange rates (base: INR)
const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  THB: 0.41,
  AED: 0.044,
  SGD: 0.016,
  EUR: 0.011,
  GBP: 0.0093,
  JPY: 1.85,
  AUD: 0.019,
  CAD: 0.017,
}

// Historical data (last 30 days) - USD/INR
const HISTORICAL_DATA = [
  { day: '1', rate: 83.12 },
  { day: '3', rate: 83.25 },
  { day: '5', rate: 83.08 },
  { day: '7', rate: 83.45 },
  { day: '9', rate: 83.62 },
  { day: '11', rate: 83.51 },
  { day: '13', rate: 83.78 },
  { day: '15', rate: 83.93 },
  { day: '17', rate: 83.85 },
  { day: '19', rate: 84.12 },
  { day: '21', rate: 84.05 },
  { day: '23', rate: 83.88 },
  { day: '25', rate: 83.72 },
  { day: '27', rate: 83.55 },
  { day: '29', rate: 83.42 },
  { day: '30', rate: 83.50 },
]

const POPULAR_PAIRS = [
  { from: 'USD', to: 'INR', name: 'Dollar to Rupee' },
  { from: 'INR', to: 'USD', name: 'Rupee to Dollar' },
  { from: 'THB', to: 'INR', name: 'Baht to Rupee' },
  { from: 'AED', to: 'INR', name: 'Dirham to Rupee' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function CurrencyPage() {
  const [amount, setAmount] = useState('1000')
  const [fromCurrency, setFromCurrency] = useState('INR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [result, setResult] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    calculateConversion()
  }, [amount, fromCurrency, toCurrency])

  const calculateConversion = () => {
    const amt = parseFloat(amount) || 0
    const fromRate = EXCHANGE_RATES[fromCurrency]
    const toRate = EXCHANGE_RATES[toCurrency]
    
    // Convert to INR first, then to target currency
    const inrAmount = amt / fromRate
    const convertedAmount = inrAmount * toRate
    
    setResult(convertedAmount)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getExchangeRate = () => {
    const fromRate = EXCHANGE_RATES[fromCurrency]
    const toRate = EXCHANGE_RATES[toCurrency]
    return (toRate / fromRate).toFixed(6)
  }

  const getRateChange = () => {
    // Simulate 24h change
    const change = (Math.random() - 0.5) * 2
    return change
  }

  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency)!
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency)!
  const rateChange = getRateChange()

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp}>
        <div className="page-header">
          <h1>Currency Converter</h1>
          <p>Live exchange rates with FEMA LRS compliance</p>
        </div>
      </motion.div>

      {/* Main Converter */}
      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(108,99,255,0.02) 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* From Currency */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">From</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl h-14 font-bold font-tabular"
                    placeholder="0"
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <div className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span className="font-semibold">{curr.code}</span>
                            <span className="text-muted-foreground text-xs">- {curr.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={swapCurrencies}
                  className="rounded-full w-12 h-12"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>

              {/* To Currency */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">To</label>
                <div className="space-y-2">
                  <div className="h-14 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center">
                    <span className="text-2xl font-bold font-tabular text-emerald-400">
                      {result.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <div className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span className="font-semibold">{curr.code}</span>
                            <span className="text-muted-foreground text-xs">- {curr.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  1 {fromCurrency} = {getExchangeRate()} {toCurrency}
                </span>
                <Badge variant={rateChange >= 0 ? 'success' : 'destructive'} size="sm">
                  {rateChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(rateChange).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Convert - Popular Pairs */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">Popular Currency Pairs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_PAIRS.map((pair) => {
            const fromRate = EXCHANGE_RATES[pair.from]
            const toRate = EXCHANGE_RATES[pair.to]
            const rate = (toRate / fromRate).toFixed(4)
            const fromCurr = CURRENCIES.find(c => c.code === pair.from)!
            const toCurr = CURRENCIES.find(c => c.code === pair.to)!

            return (
              <Card 
                key={`${pair.from}-${pair.to}`}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => {
                  setFromCurrency(pair.from)
                  setToCurrency(pair.to)
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{fromCurr.flag}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl">{toCurr.flag}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{pair.name}</p>
                <p className="text-lg font-bold font-tabular">{rate}</p>
                <p className="text-xs text-muted-foreground">1 {pair.from} = {rate} {pair.to}</p>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Exchange Rate Chart */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h3 className="font-semibold mb-5">USD/INR Rate History (30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={HISTORICAL_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip 
                formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Rate']}
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* All Rates Quick View */}
        <Card>
          <h3 className="font-semibold mb-4">INR Exchange Rates</h3>
          <div className="space-y-3">
            {CURRENCIES.filter(c => c.code !== 'INR').slice(0, 6).map((curr) => {
              const rate = EXCHANGE_RATES[curr.code]
              const inrRate = (1 / rate).toFixed(2)
              
              return (
                <div key={curr.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{curr.flag}</span>
                    <div>
                      <p className="text-sm font-semibold">{curr.code}</p>
                      <p className="text-xs text-muted-foreground">{curr.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-tabular">₹{inrRate}</p>
                    <p className="text-xs text-muted-foreground">per 1 {curr.code}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* FEMA LRS Info */}
      <motion.div variants={fadeUp}>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">FEMA LRS Limit Reminder</h4>
              <p className="text-sm text-muted-foreground mb-3">
                As per RBI's Liberalized Remittance Scheme (LRS), Indian residents can remit up to <span className="font-semibold text-amber-400">USD $250,000 per financial year</span> for permitted current or capital account transactions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning" size="sm">Education</Badge>
                <Badge variant="warning" size="sm">Medical Treatment</Badge>
                <Badge variant="warning" size="sm">Travel</Badge>
                <Badge variant="warning" size="sm">Investment</Badge>
                <Badge variant="warning" size="sm">Gift/Donation</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
