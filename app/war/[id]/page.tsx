"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from "@/lib/utils"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TokenData {
  ticker: string
  name: string
  marketCap: number
  price: number
  priceChange24h: number
  volume24h: number
  holders: number
  totalSupply: number
  amountPledged: number
  pledgers: number
  emoji: string
  description: string
  socialLinks: {
    twitter: string
    telegram: string
    website: string
  }
}

interface TweetTemplate {
  text: string
  hashtags: string[]
}

export default function WarPage({ params }: { params: { id: string } }) {
  const [warData, setWarData] = useState({
    coin1: {
      ticker: "DOGE",
      name: "Dogecoin",
      marketCap: 10000000000,
      price: 0.1234,
      priceChange24h: 5.67,
      volume24h: 500000000,
      holders: 1000000,
      totalSupply: 1000000000000,
      amountPledged: 5000000,
      pledgers: 50000,
      emoji: "🐶",
      description: "The original meme coin that started it all.",
      socialLinks: {
        twitter: "#",
        telegram: "#",
        website: "#"
      }
    },
    coin2: {
      ticker: "SHIB",
      name: "Shiba Inu",
      marketCap: 8000000000,
      price: 0.00001234,
      priceChange24h: -2.34,
      volume24h: 400000000,
      holders: 800000,
      totalSupply: 589736283000000,
      amountPledged: 4000000,
      pledgers: 40000,
      emoji: "🐕",
      description: "The Dogecoin killer, a decentralized meme token.",
      socialLinks: {
        twitter: "#",
        telegram: "#",
        website: "#"
      }
    },
    totalPledged: 9000000,
    timeLeft: "23:59:59",
    recentPledges: []
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWarData(prev => ({
        ...prev,
        coin1: {
          ...prev.coin1,
          price: prev.coin1.price * (1 + (Math.random() - 0.5) * 0.001),
          amountPledged: prev.coin1.amountPledged * (1 + (Math.random() - 0.5) * 0.01)
        },
        coin2: {
          ...prev.coin2,
          price: prev.coin2.price * (1 + (Math.random() - 0.5) * 0.001),
          amountPledged: prev.coin2.amountPledged * (1 + (Math.random() - 0.5) * 0.01)
        }
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      {/* War Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {warData.coin1.ticker} vs {warData.coin2.ticker}
        </h1>
      </div>

      <div className="grid grid-cols-7 gap-6">
        {/* Left Token */}
        <div className="col-span-3">
          <TokenCard 
            token={warData.coin1}
            totalPledged={warData.totalPledged}
          />
        </div>

        {/* Center VS Section */}
        <div className="col-span-1 flex flex-col items-center justify-start">
          <div className="sticky top-4 w-full">
            <div className="text-6xl font-bold mb-8 text-center">VS</div>
            
            {/* Coin Ratio */}
            <div className="mb-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Price Ratio</div>
              <div className="font-mono text-lg">
                1 : {(warData.coin2.price / warData.coin1.price).toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {warData.coin1.ticker} : {warData.coin2.ticker}
              </div>
            </div>
            
            {/* War Share Bar */}
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                War Share
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-xs mb-1">
                <span className="text-primary font-medium">
                  {((warData.coin1.amountPledged / warData.totalPledged) * 100).toFixed(1)}%
                </span>
                <span className="text-[#FF4444] font-medium">
                  {((warData.coin2.amountPledged / warData.totalPledged) * 100).toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-primary"
                  style={{ 
                    width: `${(warData.coin1.amountPledged / warData.totalPledged) * 100}%`,
                    borderRadius: '9999px 0 0 9999px'
                  }}
                  animate={{ 
                    width: `${(warData.coin1.amountPledged / warData.totalPledged) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div 
                  className="absolute right-0 top-0 bottom-0 bg-[#FF4444]"
                  style={{ 
                    width: `${(warData.coin2.amountPledged / warData.totalPledged) * 100}%`,
                    borderRadius: '0 9999px 9999px 0'
                  }}
                  animate={{ 
                    width: `${(warData.coin2.amountPledged / warData.totalPledged) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Token Amounts */}
              <div className="flex justify-between text-xs">
                <div className="text-left">
                  <div className="text-primary font-medium">
                    {formatNumber(warData.coin1.amountPledged)} {warData.coin1.ticker}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    ${formatNumber(warData.coin1.amountPledged * warData.coin1.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#FF4444] font-medium">
                    {formatNumber(warData.coin2.amountPledged)} {warData.coin2.ticker}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    ${formatNumber(warData.coin2.amountPledged * warData.coin2.price)}
                  </div>
                </div>
              </div>

              {/* Time Left */}
              <div className="mt-8 text-center">
                <div className="text-sm text-muted-foreground mb-1">Time Left</div>
                <motion.div 
                  className="text-xl font-mono"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {warData.timeLeft}
                </motion.div>
              </div>

              {/* Total Pledged */}
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Pledged</div>
                <div className="text-xl font-mono">
                  ${formatNumber(warData.totalPledged)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Token */}
        <div className="col-span-3">
          <TokenCard 
            token={warData.coin2}
            totalPledged={warData.totalPledged}
          />
        </div>
      </div>

      {/* Live Feed and Chat Section */}
      <div className="mt-8 grid grid-cols-3 gap-8">
        {/* Combined Live Feed */}
        <div>
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-medium">Live Feed</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isFirstCoin = Math.random() > 0.5
                    const coin = isFirstCoin ? warData.coin1 : warData.coin2
                    const amount = Math.random() * 10000
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                            {coin.emoji}
                          </span>
                          <span className={`text-sm ${isFirstCoin ? 'text-primary' : 'text-[#FF4444]'}`}>
                            +${formatNumber(amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Whale{Math.floor(Math.random() * 1000)}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-medium">Live Chat</h2>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
              <AnimatePresence mode="popLayout">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isSupporter = Math.random() > 0.5
                  const coin = isSupporter ? warData.coin1 : warData.coin2
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                        {coin.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Whale{Math.floor(Math.random() * 1000)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isSupporter ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {coin.ticker} Supporter
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coin.ticker} to the moon! 🚀
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">just now</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-muted border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TokenCard({ token, totalPledged }: { token: TokenData, totalPledged: number }) {
  const [pledgeAmount, setPledgeAmount] = useState("")
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TweetTemplate | null>(null)
  
  const tweetTemplates = [
    {
      text: `${token.ticker} is crushing it in the meme wars! Join me in supporting the future of memes 🚀`,
      hashtags: ['MemeCoin', 'Crypto', token.ticker]
    },
    {
      text: `The war is on and ${token.ticker} is taking the lead! Don't miss out on the next big thing 💎`,
      hashtags: ['CryptoWars', 'MemeWars', token.ticker]
    },
    {
      text: `${token.ticker} army assemble! We're making history in the meme wars 🔥`,
      hashtags: ['CryptoGems', 'MemeWar', token.ticker]
    }
  ]

  const generateTwitterIntent = (template: TweetTemplate) => {
    const text = encodeURIComponent(template.text)
    const hashtags = template.hashtags.join(',')
    return `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`
  }

  const percentage = (token.amountPledged / totalPledged) * 100

  // Calculate expected payout
  const calculateExpectedPayout = (amount: number) => {
    if (!amount) return 0
    // If this side wins, pledger gets their amount plus proportional share of losing side
    const otherSideAmount = totalPledged - token.amountPledged
    const shareOfPledge = amount / token.amountPledged
    const expectedReward = amount + (otherSideAmount * shareOfPledge)
    return expectedReward
  }

  // Calculate ROI percentage
  const calculateROI = (amount: number) => {
    if (!amount) return 0
    const payout = calculateExpectedPayout(amount)
    return ((payout - amount) / amount) * 100
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Token Header - Update to include fist button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
            {token.emoji}
          </div>
          <div>
            <h3 className="font-bold text-lg">{token.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono">${token.price.toFixed(8)}</span>
              <span className={`text-sm ${token.priceChange24h >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Support Button - renamed from Fist Button */}
        <button
          onClick={() => setIsWarRoomOpen(true)}
          className="p-2 hover:bg-muted rounded-full transition-colors group"
        >
          <Megaphone className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Market Cap" value={`$${formatNumber(token.marketCap)}`} />
        <Stat label="24h Volume" value={`$${formatNumber(token.volume24h)}`} />
        <Stat label="Holders" value={formatNumber(token.holders)} />
        <Stat label="Total Supply" value={formatNumber(token.totalSupply)} />
      </div>

      {/* Pledge Section */}
      <div className="bg-background/50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount Pledged</span>
          <span className="font-medium">${formatNumber(token.amountPledged)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Pledgers</span>
          <span className="font-medium">{formatNumber(token.pledgers)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">War Share</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>

        <input
          type="number"
          value={pledgeAmount}
          onChange={(e) => setPledgeAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full bg-muted border-border rounded px-3 py-2 text-sm"
        />

        {/* Expected Payout Section */}
        {pledgeAmount && Number(pledgeAmount) > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="text-xs text-muted-foreground">Expected Payout if {token.ticker} Wins</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono text-primary">
                ${formatNumber(calculateExpectedPayout(Number(pledgeAmount)))}
              </span>
              <span className="text-xs text-primary">
                (+{calculateROI(Number(pledgeAmount)).toFixed(2)}% ROI)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Your share: {((Number(pledgeAmount) / token.amountPledged) * 100).toFixed(2)}% of {token.ticker} pool
            </div>
          </div>
        )}

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-sm font-medium">
          Pledge {token.ticker}
        </button>
      </div>

      {/* War Room Modal */}
      <Dialog open={isWarRoomOpen} onOpenChange={setIsWarRoomOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{token.emoji}</span>
              {token.ticker} War Room
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Support {token.ticker} by spreading the word! Choose a message to share:
            </div>

            <div className="space-y-3">
              {tweetTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm mb-2">{template.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.hashtags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={selectedTemplate ? generateTwitterIntent(selectedTemplate) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                w-full inline-flex justify-center items-center px-4 py-2 rounded
                ${selectedTemplate 
                  ? 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              {selectedTemplate ? 'Share on Twitter' : 'Select a message'}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  )
} 