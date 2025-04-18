"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  useGetWarDetails,
  useSearchMemeWars,
} from "@/app/api/getHomePageDetails";
// A minimal wrapper component to use the hook properly
import { useMemeWarCalculations } from "@/app/hooks/useMemeWarCalculations";
import { SearchInput } from "@/components/common/SearchInput";
import { formatNumber } from "@/lib/utils";
import useCountdown from "@/app/hooks/useCountdown";
import VsComponent from "./VsComponent";
import SimpleCustomizableModal from "./ui/modal";
import CryptoStyleModal from "./ui/modal";
import ToastStyleModal from "./ui/modal";
import { useFirstVisitModal } from "@/app/hooks/useFirstVisitModal";

interface Pledge {
  id: string;
  amount: number;
  timestamp: Date;
  pledger: string;
  coinTicker: string;
}

interface CoinData {
  ticker: string;
  name: string;
  marketCap: number;
  pledgers: number;
  amountPledged: number;
  emoji: string;
  recentPledges?: Pledge[];
  imageUrl?: string;
  amountPledgedInSol?: number;
  mintAddress?: string;
}

interface War {
  coin1: CoinData;
  coin2: CoinData;
  warId: string;
  meme_war_state: string;
  mint_a_image: string;
  mint_a_name: string;
  mint_a_symbol: string;
  mint_b_image: string;
  mint_b_name: string;
  mint_b_symbol: string;
  war_ended: boolean;
  end_time: string;
  mint_a: string;
  mint_b: string;
  tx_count?: number;
}

// Emoji mapping for common coins
const coinEmojis: Record<string, string> = {
  USDC: "💲",
  USDT: "💵",
  PEPE: "🐸",
  WOJAK: "😐",
  MOON: "🌙",
  LAMBO: "🚗",
  SOL: "💎",
  BTC: "₿",
  ETH: "Ξ",
};

export function MemeCoinWars() {
  const [sortBy, setSortBy] = useState<string>("volume");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const {
    isOpen: isModalOpen,
    closeModalPermanently,
    isInitialized,
  } = useFirstVisitModal("has-seen-pump-intro-modal", true);

  const {
    data: warArray,
    isError,
    isLoading,
  } = useGetWarDetails(
    sortBy,
    filterBy,
    itemsPerPage,
    (currentPage - 1) * itemsPerPage
  );

  const [wars, setWars] = useState<War[]>([]);
  const [shakingWarId, setShakingWarId] = useState<number | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();

  // Use server-side search API when search term is present
  const {
    data: searchResults,
    isError: isSearchError,
    isLoading: isSearchLoading,
  } = useSearchMemeWars(searchTerm);

  const sortOptions = [
    { value: "volume", label: "volume" },
    { value: "last_traded", label: "last trade" },
    { value: "last_reply", label: "last reply" },
    { value: "currently_live", label: "currently live" },
  ];

  // Initialize animationsEnabled from localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem("animationsEnabled");
    if (storedPreference !== null) {
      setAnimationsEnabled(storedPreference === "true");
    }
  }, []);

  useEffect(() => {
    if (warArray) {
      const estimatedTotal =
        warArray.length < itemsPerPage
          ? (currentPage - 1) * itemsPerPage + warArray.length
          : Math.max(currentPage * itemsPerPage, totalItems);

      setTotalItems(estimatedTotal);
      setTotalPages(Math.max(1, Math.ceil(estimatedTotal / itemsPerPage)));
    }
  }, [warArray, currentPage, itemsPerPage, totalItems]);

  // Transform API data to component format
  useEffect(() => {
    // If we have a search term, use search results, otherwise use regular war data
    const dataToTransform =
      searchTerm && searchResults ? searchResults : warArray;

    if (dataToTransform && dataToTransform.length > 0) {
      const transformedWars = dataToTransform
        .slice(0, 10)
        .map((warData: War) => {
          return {
            coin1: {
              ticker: warData.mint_a_symbol || "Unknown",
              name: warData.mint_a_name || warData.mint_a || "Unknown",
              marketCap: Math.random() * 10000000000,
              pledgers: Math.floor(Math.random() * 50000) + 1000,
              amountPledged: 0, // Will be calculated in WarItem
              emoji: coinEmojis[warData.mint_a_symbol] || "🪙",
              imageUrl: warData.mint_a_image,
              mintAddress: warData.mint_a,
            },
            coin2: {
              ticker: warData.mint_b_symbol || "Unknown",
              name: warData.mint_b_name || warData.mint_b || "Unknown",
              marketCap: Math.random() * 5000000000,
              pledgers: Math.floor(Math.random() * 40000) + 1000,
              amountPledged: 0, // Will be calculated in WarItem
              emoji: coinEmojis[warData.mint_b_symbol] || "🪙",
              imageUrl: warData.mint_b_image,
              mintAddress: warData.mint_b,
            },
            warId: warData.meme_war_state,
            warData: warData, // Pass the raw data for calculations
          };
        });

      setWars(transformedWars);
    } else if (dataToTransform && dataToTransform.length === 0) {
      // Clear wars if we got empty results
      setWars([]);
    }
  }, [warArray, searchResults, searchTerm]);

  // Simulate real-time pledge updates (in a production app, this would use WebSockets)
  useEffect(() => {
    if (wars.length === 0) return;

    const simulatePledge = () => {
      // Randomly select 2-3 wars to receive pledges
      const numPledges = Math.floor(Math.random() * 2) + 2; // 2-3 pledges
      const pledgedWars = new Set<number>();

      while (pledgedWars.size < numPledges && pledgedWars.size < wars.length) {
        pledgedWars.add(Math.floor(Math.random() * wars.length));
      }

      pledgedWars.forEach((warIndex) => {
        const randomCoinSide = Math.random() > 0.5 ? "coin1" : "coin2";
        const pledgeAmount = Math.floor(Math.random() * 50000) + 1000;

        const newPledge: Pledge = {
          id: Math.random().toString(),
          amount: pledgeAmount,
          timestamp: new Date(),
          pledger: `Whale${Math.floor(Math.random() * 1000)}`,
          coinTicker: wars[warIndex][randomCoinSide].ticker,
        };

        setWars((currentWars) => {
          const newWars = [...currentWars];
          const war = { ...newWars[warIndex] };
          const coin = { ...war[randomCoinSide] };

          coin.amountPledged += pledgeAmount;
          coin.pledgers += 1;
          coin.recentPledges = [newPledge];

          war[randomCoinSide] = coin;
          newWars[warIndex] = war;

          if (animationsEnabled) {
            setShakingWarId(warIndex);
            setTimeout(() => setShakingWarId(null), 300);
          }

          if (animationsEnabled) {
            return [...newWars].sort(
              (a, b) =>
                b.coin1.amountPledged +
                b.coin2.amountPledged -
                (a.coin1.amountPledged + a.coin2.amountPledged)
            );
          }
          return newWars;
        });
      });
    };

    // // Simulate pledges every 400-500ms (2-2.5 pledges per second)
    // const interval = setInterval(() => {
    //   simulatePledge();
    // }, Math.random() * 100 + 400);

    // return () => clearInterval(interval);
  }, [wars, animationsEnabled]);

  // Toggle animations handler
  const toggleAnimations = () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    localStorage.setItem("animationsEnabled", newValue.toString());

    // Clear shaking state when disabling animations
    if (animationsEnabled) {
      setShakingWarId(null);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    goToPage(currentPage - 1);
  };

  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (end - start + 1 < maxVisiblePages - 2) {
        if (currentPage < totalPages / 2) {
          end = Math.min(totalPages - 1, start + maxVisiblePages - 3);
        } else {
          start = Math.max(2, end - (maxVisiblePages - 3));
        }
      }

      if (start > 2) {
        pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Update search handler to use backend search API
  const handleSearch = (value: string) => {
    // Trim value to handle empty spaces and ensure better search results
    const trimmedValue = value.trim();
    setSearchTerm(trimmedValue);
  };

  // Display loading state during search
  if (isLoading || (searchTerm && isSearchLoading)) {
    return (
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <div className="text-xl">
          {searchTerm
            ? `Searching for "${searchTerm}"...`
            : "Loading wars data..."}
        </div>
      </div>
    );
  }

  if (
    (isError && !searchTerm) ||
    (isSearchError && searchTerm) ||
    !wars.length
  ) {
    return (
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <div className="text-xl">Could not load meme wars</div>
      </div>
    );
  }

  return (
    <>
      {/* Only render the modal after client-side initialization */}
      {isInitialized && (
        <ToastStyleModal
          isOpen={isModalOpen}
          onClose={closeModalPermanently}
          width={500}
          height="auto"
          position="center"
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
              how it works
            </h2>

            <p>
              pump allows <span style={{ color: "#4CAF50" }}>anyone</span> to
              create coins. all coins created on Pump are
              <br />
              <span style={{ color: "#4CAF50" }}>fair-launch</span>, meaning
              everyone has equal access to buy and sell
              <br />
              when the coin is first created.
            </p>

            <div style={{ margin: "20px 0" }}>
              <p>
                <strong>step 1:</strong> pick a coin that you like
              </p>
              <p>
                <strong>step 2:</strong> buy the coin on the bonding curve
              </p>
              <p>
                <strong>step 3:</strong> sell at any time to lock in your
                profits or losses
              </p>
            </div>

            <p>
              by clicking this button you agree to the terms and conditions and
              <br />
              certify that you are over 18 years old
            </p>

            <button
              onClick={closeModalPermanently}
              style={{
                marginTop: "20px",
                marginBottom: "20px",
                padding: "10px 0",
                width: "100%",
                backgroundColor: "#8EEFC0",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              I'm ready to pump
            </button>

            <div style={{ fontSize: "14px", color: "#aaa" }}>
              <a href="#" style={{ color: "#aaa", marginRight: "10px" }}>
                privacy policy
              </a>{" "}
              |
              <a href="#" style={{ color: "#aaa", margin: "0 10px" }}>
                terms of service
              </a>{" "}
              |
              <a href="#" style={{ color: "#aaa", marginLeft: "10px" }}>
                fees
              </a>
            </div>
          </div>
        </ToastStyleModal>
      )}

      <div className="container mx-auto px-2 sm:px-4 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl font-medium">MARKET</h2>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 hover:bg-muted text-sm font-medium"
              >
                sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-card border-2 border-primary/20">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setCurrentPage(1); // Reset to first page when sorting changes
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 ${
                          sortBy === option.value ? "bg-primary/20" : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search by Symbol or Mint Address..."
              onSearchChange={handleSearch}
              isLoading={searchTerm !== "" && isSearchLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleAnimations}
              className="relative flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80 transition-colors overflow-hidden group"
              aria-label={
                animationsEnabled ? "Disable animations" : "Enable animations"
              }
              title={
                animationsEnabled ? "Disable animations" : "Enable animations"
              }
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: "0 0 8px rgba(var(--primary-rgb), 0.4)",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-primary/40 scale-x-0 origin-left"
                animate={{ scaleX: animationsEnabled ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.div
                className="relative z-10 w-4 h-4 flex items-center justify-center"
                animate={{ rotate: animationsEnabled ? 0 : 180 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                {animationsEnabled ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 11V8.5a4.5 4.5 0 019 0v7M8 12v3.5a4.5 4.5 0 009 0V8" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="5 12 9 16" />
                    <polyline points="5 12 9 8" />
                    <line x1="19" y1="6" x2="15" y2="6" />
                    <line x1="19" y1="18" x2="15" y2="18" />
                  </svg>
                )}
              </motion.div>
              <motion.span
                className="relative z-10 hidden sm:inline"
                initial={false}
                animate={{
                  opacity: [1, 0.8, 1],
                  y: animationsEnabled ? [2, 0] : 0,
                }}
                transition={{
                  opacity: { duration: 0.3 },
                  y: { duration: 0.2 },
                }}
              >
                {animationsEnabled ? "Animations On" : "Animations Off"}
              </motion.span>
              {/* Animated decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Multiple particles that animate outward when enabled */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-primary/80"
                    style={{
                      width: `${3 + (i % 2)}px`,
                      height: `${3 + (i % 2)}px`,
                      left: `${50 + i * 5 - 10}%`,
                      top: `${50 + Math.sin(i) * 20}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      animationsEnabled
                        ? {
                            scale: [0, 1, 0],
                            opacity: [0, 0.8, 0],
                            x: [(i - 2) * 10, (i - 2) * 30],
                            y: [0, i % 2 === 0 ? -20 : 20],
                          }
                        : { scale: 0, opacity: 0 }
                    }
                    transition={{
                      duration: 0.7,
                      delay: i * 0.04,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Ripple effect */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={
                    animationsEnabled
                      ? {
                          width: ["0%", "150%"],
                          height: ["0%", "150%"],
                          opacity: [0, 0.5, 0],
                        }
                      : { width: 0, height: 0, opacity: 0 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    times: [0, 0.5, 1],
                  }}
                />
              </div>
            </motion.button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {wars.map((war, index) => (
              <motion.div
                key={war.warId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <WarItem
                  war={war}
                  index={index}
                  isShaking={index === shakingWarId}
                  onPledgeClick={() => router.push(`/war/${war.warId}`)}
                  animationsEnabled={animationsEnabled}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {searchTerm && wars.length === 0 && !isSearchLoading && (
            <div className="text-center text-muted-foreground py-8">
              No wars found matching "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface WarItemProps {
  war: War & { warData?: War };
  index: number;
  isShaking: boolean;
  onPledgeClick: () => void;
  animationsEnabled: boolean;
}

function WarItem({
  war,
  index,
  isShaking,
  onPledgeClick,
  animationsEnabled,
}: WarItemProps) {
  // Now we can safely use the hook at the top level of this component
  const {
    mintADepositedRaw,
    mintADepositedInDollar,
    mintBDepositedInDollar,
    mintBDepositedRaw,
  } = useMemeWarCalculations(war.warData);

  // Update the amountPledged values with the calculated ones
  const updatedCoin1 = {
    ...war.coin1,
    amountPledged: mintADepositedRaw,
    amountPledgedInSol: mintADepositedInDollar,
  };

  const { timeLeft } = useCountdown(war?.warData?.end_time);
  const updatedCoin2 = {
    ...war.coin2,
    amountPledged: mintBDepositedRaw,
    amountPledgedInSol: mintBDepositedInDollar,
  };

  const WarItemContent = () => (
    <>
      <div className="grid grid-cols-11 gap-1 sm:gap-2 md:gap-4">
        {/* Left Side */}
        <div className="col-span-5 sm:col-span-5">
          <CoinCard
            coin={updatedCoin1}
            isTopWar={index === 0}
            align="right"
            onClick={onPledgeClick}
          />
          {/* Animated pledge notification */}
          {animationsEnabled && (
            <AnimatePresence mode="popLayout">
              {war.coin1.recentPledges?.[0] && (
                <motion.div
                  key={war.coin1.recentPledges[0].id}
                  initial={{ opacity: 0, y: -10, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 sm:mt-2 text-xs text-right"
                >
                  <span className="text-primary">
                    +${formatNumber(war.coin1.recentPledges[0].amount)}
                  </span>
                  <span className="text-muted-foreground ml-1 sm:ml-2 hidden xs:inline">
                    by {war.coin1.recentPledges[0].pledger}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {/* Static pledge notification when animations disabled */}
          {!animationsEnabled && war.coin1.recentPledges?.[0] && (
            <div className="mt-1 sm:mt-2 text-xs text-right">
              <span className="text-primary">
                +${formatNumber(war.coin1.recentPledges[0].amount)}
              </span>
              <span className="text-muted-foreground ml-1 sm:ml-2 hidden xs:inline">
                by {war.coin1.recentPledges[0].pledger}
              </span>
            </div>
          )}
        </div>

        {/* Center VS */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center ">
            <VsComponent />

            <div className="mt-[-10px] text-[10px] sm:text-xs">Time left</div>
            <motion.div
              className="text-[30px] animated sm:text-sm"
              animate={{
                scale: isShaking ? 1.2 : 1,
                rotate: isShaking ? [0, -5, 5, -5, 0] : 0,
              }}
              transition={{
                scale: { duration: 0.3 },
                rotate: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] },
              }}
              whileHover={{
                scale: 1.5,
                boxShadow: "0 0 20px rgba(var(--primary-rgb), 0.6)",
              }}
            >
              {timeLeft}
            </motion.div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-span-5 sm:col-span-5">
          <CoinCard
            coin={updatedCoin2}
            isTopWar={index === 0}
            align="left"
            onClick={onPledgeClick}
          />
          {/* Animated pledge notification */}
          {animationsEnabled && (
            <AnimatePresence mode="popLayout">
              {war.coin2.recentPledges?.[0] && (
                <motion.div
                  key={war.coin2.recentPledges[0].id}
                  initial={{ opacity: 0, y: -10, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 sm:mt-2 text-xs text-left"
                >
                  <span className="text-primary">
                    +${formatNumber(war.coin2.recentPledges[0].amount)}
                  </span>
                  <span className="text-muted-foreground ml-1 sm:ml-2 hidden xs:inline">
                    by {war.coin2.recentPledges[0].pledger}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {/* Static pledge notification when animations disabled */}
          {!animationsEnabled && war.coin2.recentPledges?.[0] && (
            <div className="mt-1 sm:mt-2 text-xs text-left">
              <span className="text-primary">
                +${formatNumber(war.coin2.recentPledges[0].amount)}
              </span>
              <span className="text-muted-foreground ml-1 sm:ml-2 hidden xs:inline">
                by {war.coin2.recentPledges[0].pledger}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      {index < 9 && <div className="h-px bg-border mt-3 sm:mt-4" />}
    </>
  );

  // If animations are enabled, use motion.div wrapper
  if (animationsEnabled) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          layout: { duration: 0.3 },
        }}
        className={`${isShaking ? "animate-shake" : ""}`}
      >
        <WarItemContent />
      </motion.div>
    );
  }

  // No animations
  return (
    <div>
      <WarItemContent />
    </div>
  );
}

interface CoinCardProps {
  coin: CoinData;
  isTopWar: boolean;
  align: "left" | "right";
  onClick: () => void;
}

function CoinCard({ coin, isTopWar, align, onClick }: CoinCardProps) {
  const percentChange = Math.random() * 200 - 100;
  const isPositive = percentChange > 0;
  console.log(coin);
  return (
    <div
      className={`coin-card p-2 sm:p-3 md:p-4 ${
        isTopWar ? "top-war" : ""
      } cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Header: Ticker, Change %, and Social Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {coin.imageUrl ? (
                <img
                  src={coin.imageUrl}
                  alt={`${coin.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      const span = document.createElement("span");
                      span.className = "text-sm sm:text-base";
                      span.textContent = coin.emoji;
                      parent.innerHTML = "";
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-sm sm:text-base">{coin.emoji}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="ticker font-semibold text-xs sm:text-sm">
                  {coin.ticker}
                </span>
                <span
                  className={`text-xs ${
                    isPositive ? "positive" : "negative"
                  } hidden xs:inline`}
                >
                  {isPositive ? "+" : ""}
                  {percentChange.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-none">
                {coin.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground hidden sm:block"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground hidden xs:block"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground hidden md:block"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              Market Cap
            </span>
            <span className="stat-value truncate">
              ${formatNumber(coin.marketCap)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              Total Pledgers
            </span>
            <span className="stat-value truncate">
              {formatNumber(coin.pledgers)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              Tokens Pledged
            </span>
            <span className="stat-value truncate">
              <span className="text-white">
                {" "}
                {formatNumber(coin.amountPledged)}
              </span>
              {coin.amountPledgedInSol && " $" + coin.amountPledgedInSol}
            </span>
          </div>
          <div className="flex items-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors"
            >
              Pledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
