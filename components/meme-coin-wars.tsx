"use client"

import { MemeCoinWar } from "./meme-coin-war"
import { Card } from "@/components/ui/card"
import { formatNumber, formatTimeAgo } from "@/lib/utils"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Pledge {
  id: string
  amount: number
  timestamp: Date
  pledger: string
  coinTicker: string
}

interface CoinData {
  ticker: string
  name: string
  marketCap: number
  pledgers: number
  amountPledged: number
  emoji: string
  recentPledges?: Pledge[]
}

interface War {
  coin1: CoinData
  coin2: CoinData
}

// Generate more mock data for testing scrolling
const generateMoreWars = () => {
  const baseWars = [
    {
      coin1: {
        ticker: "DOGE",
        name: "Dogecoin",
        marketCap: 10000000000,
        pledgers: 50000,
        amountPledged: 5000000,
        emoji: "🐶",
      },
      coin2: {
        ticker: "SHIB",
        name: "Shiba Inu",
        marketCap: 5000000000,
        pledgers: 40000,
        amountPledged: 4000000,
        emoji: "🐕",
      },
    },
    {
      coin1: {
        ticker: "PEPE",
        name: "Pepe",
        marketCap: 1000000000,
        pledgers: 20000,
        amountPledged: 2000000,
        emoji: "🐸",
      },
      coin2: {
        ticker: "WOJAK",
        name: "Wojak",
        marketCap: 500000000,
        pledgers: 15000,
        amountPledged: 1500000,
        emoji: "😐",
      },
    },
    {
      coin1: {
        ticker: "MOON",
        name: "MoonCoin",
        marketCap: 100000000,
        pledgers: 5000,
        amountPledged: 500000,
        emoji: "🌙",
      },
      coin2: {
        ticker: "LAMBO",
        name: "LamboCoin",
        marketCap: 50000000,
        pledgers: 3000,
        amountPledged: 300000,
        emoji: "🚗",
      },
    },
  ]

  // Generate 50 more wars with random variations
  const moreWars = Array.from({ length: 50 }, (_, index) => {
    const randomMultiplier = Math.random() * 2 + 0.1 // Random number between 0.1 and 2.1
    return {
      coin1: {
        ticker: `MEME${index + 1}`,
        name: `MemeCoin ${index + 1}`,
        marketCap: Math.floor(1000000 * randomMultiplier),
        pledgers: Math.floor(1000 * randomMultiplier),
        amountPledged: Math.floor(100000 * randomMultiplier),
        emoji: ["🚀", "💎", "🌙", "🎮", "��", "🎲"][Math.floor(Math.random() * 6)],
      },
      coin2: {
        ticker: `COIN${index + 1}`,
        name: `FunCoin ${index + 1}`,
        marketCap: Math.floor(900000 * randomMultiplier),
        pledgers: Math.floor(900 * randomMultiplier),
        amountPledged: Math.floor(90000 * randomMultiplier),
        emoji: ["🦊", "🐱", "🐼", "🦁", "🐯", "🐸"][Math.floor(Math.random() * 6)],
      },
    }
  })

  return [...baseWars, ...moreWars]
}

const memeCoinWars = generateMoreWars()

export function MemeCoinWars() {
  const [wars, setWars] = useState<War[]>(memeCoinWars.slice(0, 10))
  const [shakingWarId, setShakingWarId] = useState<number | null>(null)

  useEffect(() => {
    const simulatePledge = () => {
      // Randomly select 2-3 wars to receive pledges
      const numPledges = Math.floor(Math.random() * 2) + 2 // 2-3 pledges
      const pledgedWars = new Set<number>()
      
      while (pledgedWars.size < numPledges) {
        pledgedWars.add(Math.floor(Math.random() * 10))
      }

      pledgedWars.forEach(warIndex => {
        const randomCoinSide = Math.random() > 0.5 ? 'coin1' : 'coin2'
        const pledgeAmount = Math.floor(Math.random() * 50000) + 1000

        const newPledge: Pledge = {
          id: Math.random().toString(),
          amount: pledgeAmount,
          timestamp: new Date(),
          pledger: `Whale${Math.floor(Math.random() * 1000)}`,
          coinTicker: wars[warIndex][randomCoinSide].ticker
        }

        setWars(currentWars => {
          const newWars = [...currentWars]
          const war = {...newWars[warIndex]}
          const coin = {...war[randomCoinSide]}
          
          coin.amountPledged += pledgeAmount
          coin.pledgers += 1
          coin.recentPledges = [newPledge]
          
          war[randomCoinSide] = coin
          newWars[warIndex] = war

          setShakingWarId(warIndex)
          setTimeout(() => setShakingWarId(null), 300)

          // Sort wars and maintain top 10
          const allWars = [...memeCoinWars]
          const updatedWarIndex = allWars.findIndex(w => 
            w.coin1.ticker === war.coin1.ticker && 
            w.coin2.ticker === war.coin2.ticker
          )
          allWars[updatedWarIndex] = war
          
          return allWars
            .sort((a, b) => 
              (b.coin1.amountPledged + b.coin2.amountPledged) - 
              (a.coin1.amountPledged + a.coin2.amountPledged)
            )
            .slice(0, 10)
        })
      })
    }

    // Simulate pledges every 400-500ms (2-2.5 pledges per second)
    const interval = setInterval(() => {
      simulatePledge()
    }, Math.random() * 100 + 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 h-full flex flex-col">
      <h2 className="text-xl font-medium mb-6">MARKET</h2>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {wars.map((war, index) => (
              <motion.div
                key={`war-${war.coin1.ticker}-${war.coin2.ticker}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  layout: { duration: 0.3 }
                }}
                className={`${shakingWarId === index ? 'animate-shake' : ''}`}
              >
                <div className="grid grid-cols-5 gap-4">
                  {/* Left Side */}
                  <div className="col-span-2">
                    <CoinCard 
                      coin={war.coin1}
                      isTopWar={index === 0}
                      align="right"
                    />
                    {/* Animated pledge notification */}
                    <AnimatePresence mode="popLayout">
                      {war.coin1.recentPledges?.[0] && (
                        <motion.div
                          key={war.coin1.recentPledges[0].id}
                          initial={{ opacity: 0, y: -10, x: 20 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 text-xs text-right"
                        >
                          <span className="text-primary">+${formatNumber(war.coin1.recentPledges[0].amount)}</span>
                          <span className="text-muted-foreground ml-2">
                            by {war.coin1.recentPledges[0].pledger}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Center VS */}
                  <div className="flex items-center justify-center">
                    <motion.div 
                      className="vs-badge opacity-50"
                      animate={{ scale: shakingWarId === index ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      vs
                    </motion.div>
                  </div>

                  {/* Right Side */}
                  <div className="col-span-2">
                    <CoinCard 
                      coin={war.coin2}
                      isTopWar={index === 0}
                      align="left"
                    />
                    {/* Animated pledge notification */}
                    <AnimatePresence mode="popLayout">
                      {war.coin2.recentPledges?.[0] && (
                        <motion.div
                          key={war.coin2.recentPledges[0].id}
                          initial={{ opacity: 0, y: -10, x: -20 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 text-xs text-left"
                        >
                          <span className="text-primary">+${formatNumber(war.coin2.recentPledges[0].amount)}</span>
                          <span className="text-muted-foreground ml-2">
                            by {war.coin2.recentPledges[0].pledger}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Divider */}
                {index < wars.length - 1 && (
                  <motion.div 
                    layout
                    className="h-px bg-border mt-4" 
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

interface CoinCardProps {
  coin: {
    ticker: string
    name: string
    marketCap: number
    pledgers: number
    amountPledged: number
    emoji: string
  }
  isTopWar: boolean
  align: 'left' | 'right'
}

function CoinCard({ coin, isTopWar, align }: CoinCardProps) {
  const percentChange = Math.random() * 200 - 100;
  const isPositive = percentChange > 0;

  return (
    <div className={`coin-card p-4 ${isTopWar ? "top-war" : ""}`}>
      <div className="flex flex-col gap-3">
        {/* Header: Ticker, Change %, and Social Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {coin.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="ticker font-semibold">{coin.ticker}</span>
                <span className={`text-xs ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{coin.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Market Cap</span>
            <span className="stat-value">${formatNumber(coin.marketCap)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Total Pledgers</span>
            <span className="stat-value">{formatNumber(coin.pledgers)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Amount Pledged</span>
            <span className="stat-value text-primary">${formatNumber(coin.amountPledged)}</span>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => window.location.href = `/war/${coin.ticker}`}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Pledge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}