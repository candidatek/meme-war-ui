"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Swords, Wallet, Menu } from "lucide-react"
import Image from "next/image"
import { useState } from 'react'
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { connected } = useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center gap-8 flex-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image 
                  src="/logo.png" 
                  alt="Meme Coin Wars" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Meme Coin Wars</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/wars" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Active Wars
              </Link>
            </nav>
          </div>

          {/* Center Section - Start War Button */}
          <div className="flex-1 flex justify-center">
            <Link href="/start-war">
              <button className="holo-gradient px-8 h-11 rounded-full text-primary-foreground font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:-translate-y-0.5">
                <Swords className="h-4 w-4" />
                Start a War
              </button>
            </Link>
          </div>

          {/* Right Section - Wallet */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <WalletMultiButton className="phantom-button" />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="py-4 space-y-4">
                <Link 
                  href="/wars" 
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  Active Wars
                </Link>
                <Link href="/start-war" className="block px-4">
                  <button className="holo-gradient w-full h-11 rounded-full text-primary-foreground font-semibold flex items-center justify-center gap-2">
                    <Swords className="h-4 w-4" />
                    Start a War
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

