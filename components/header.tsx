"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Swords, User, Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { WalletButton } from "./solana/solana-provider";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const handleProfileClick = () => {
    if (connected && publicKey) {
      router.push(`/profile/${publicKey.toString()}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center gap-2 sm:gap-8 flex-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                <Image
                  src="/logo.png"
                  alt="Meme Coin Wars"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xs sm:text-sm md:text-lg hidden xs:inline">
                Meme Coin Wars
              </span>
            </Link>
          </div>

          {/* Center Section - Start War Button - Only show on larger screens */}
          <div className="hidden sm:flex flex-1 justify-center">
            <Link href="/start-war">
              <button className="holo-gradient px-3 sm:px-5 md:px-8 h-8 sm:h-10 md:h-11 rounded-full text-xs sm:text-sm text-primary-foreground font-semibold flex items-center gap-1 sm:gap-2 transition-all hover:scale-105 hover:-translate-y-0.5">
                <Swords className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Start a War</span>
              </button>
            </Link>
          </div>

          {/* Right Section - Wallet */}
          <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
            {/* Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleProfileClick}
              disabled={!connected}
              className="flex items-center gap-1 h-8 sm:h-10 text-xs sm:text-sm"
              title={
                connected ? "View Profile" : "Connect wallet to view profile"
              }
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>

            {/* Show the wallet button but smaller on mobile */}
            <WalletButton className="phantom-button !px-2 xs:!px-3 sm:!px-4 !text-xs sm:!text-sm !h-8 sm:!h-10 md:!h-10" />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
                {/* Profile Link in Mobile Menu */}
                <button
                  onClick={handleProfileClick}
                  disabled={!connected}
                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground"
                >
                  My Profile
                </button>
                {/* Show Start War button in mobile menu */}
                <Link href="/start-war" className="block px-4">
                  <button className="holo-gradient w-full h-9 sm:h-11 rounded-full text-xs sm:text-sm text-primary-foreground font-semibold flex items-center justify-center gap-2">
                    <Swords className="h-3 w-3 sm:h-4 sm:w-4" />
                    Start a War
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
