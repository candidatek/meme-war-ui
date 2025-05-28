"use client"

import {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import { formatNumber } from '@/lib/utils';

interface PledgeNotification {
  id: string
  amount: number
  ticker: string
  timestamp: Date
}

export function LiveFeedCarousel() {
  const [livePledges, setLivePledges] = useState<PledgeNotification[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newPledge = {
        id: Math.random().toString(),
        amount: Math.random() * 10000,
        ticker: ["DOGE", "SHIB", "PEPE", "WOJAK"][Math.floor(Math.random() * 4)],
        timestamp: new Date()
      }
      setLivePledges(prev => [newPledge, ...prev].slice(0, 10))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-muted/30 border-y border-border">
      <div className="container mx-auto">
        <div className="relative h-10 overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            <div className="flex gap-8 animate-scroll">
              <AnimatePresence mode="popLayout">
                {livePledges.map((pledge) => (
                  <motion.div
                    key={pledge.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <span className="text-primary font-medium">
                      +${formatNumber(pledge.amount)}
                    </span>
                    <span className="text-muted-foreground">pledged to {pledge.ticker}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 