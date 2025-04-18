import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, formatWalletAddress } from "@/lib/utils";
import { TradeData, WarData } from "@/app/Interfaces";
import { TransactionBadge } from "@/components/ui/transactionBadge";
import { formatTimeAgo } from "../utils/formatTimeAgo";

interface LiveFeedProps {
  tradesData: {
    mintA: TradeData[];
    mintB: TradeData[];
  } | null;
  warData: WarData;
  memeWarStateInfo: any;
  handleRefresh: () => void;
  animateTrade: {
    index: number;
    tradeId: string | null;
  };
}

export function LiveFeed({
  tradesData,
  warData,
  memeWarStateInfo,
  handleRefresh,
  animateTrade,
}: LiveFeedProps) {
  return (
    <div className="bg-card border border-border rounded-lg">

      <div className="p-4 border-b border-border flex justify-between">
        <h2 className="text-lg md:text-xl font-medium">Live Feed</h2>
        <div onClick={handleRefresh} className="cursor-pointer text-sm">
          Refresh
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="popLayout">
            {tradesData &&
              [...(tradesData.mintA || []), ...(tradesData.mintB || [])]
                .map((trade) => ({
                  ...trade,
                  uniqueId:
                    trade.tx_signature ||
                    `${trade.wallet_address}-${trade.event_time}`,
                }))
                .filter(
                  (trade, index, self) =>
                    index ===
                    self.findIndex((t) => t.uniqueId === trade.uniqueId)
                )
                .sort((a, b) => b.event_time - a.event_time)
                .slice(0, 10)
                .map((trade, i) => {
                  const isMintA = trade.mint === warData.coin1.address;
                  const coin = isMintA ? warData.coin1 : warData.coin2;
                  const decimals = isMintA
                    ? memeWarStateInfo?.mint_a_decimals
                    : memeWarStateInfo?.mint_b_decimals;
                  const amount = Number(trade.amount) / 10 ** (decimals || 9);

                  // Get SOL value from trade data
                  const solValue = trade.amount_in_sol
                    ? Number(trade.amount_in_sol) / 10 ** 6
                    : 0;

                  return (
                    <motion.div
                      key={`${trade.wallet_address}-${trade.event_time}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex items-center justify-between p-2.5 rounded-lg border-b border-border/10 last:border-0 transition-all duration-200
                  ${animateTrade.index === (isMintA ? 0 : 1) &&
                          animateTrade.tradeId ===
                          (trade.tx_signature || `${trade.event_time}`) &&
                          i === 0
                          ? "animate-pulse bg-emerald-50/30"
                          : "hover:bg-muted/40 hover:shadow-sm"
                        }`}
                    >
                      <a
                        href={`https://solscan.io/tx/${trade.tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full hover:no-underline"
                      >
                        {/* Left Side: Token Image, Amount, Event Type */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-muted/80 flex items-center justify-center overflow-hidden">
                            <img
                              src={
                                isMintA
                                  ? memeWarStateInfo?.mint_a_image
                                  : memeWarStateInfo?.mint_b_image
                              }
                              alt={coin.ticker}
                              className="w-6 h-6 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle">${coin.ticker.charAt(
                                  0
                                )}</text></svg>`;
                              }}
                            />
                          </div>


                          {animateTrade.index === 0 && <div className={`absolute left-0 top-[50vh] max-w-[200px] h-20  animate-scroll-top  
                    
                    `}>
                             <div className=" rounded-md   flex items-center justify-center overflow-hidden">
                            <img
                              src={
                                isMintA
                                  ? memeWarStateInfo?.mint_a_image
                                  : memeWarStateInfo?.mint_b_image
                              }
                              alt={coin.ticker}
                              className="w-[60px] h-[60px] object-cover rounded-lg"
                             
                            />
                           
                            <div className="text-[32px] text-primary">
                             +{formatNumber(amount)}
                            </div>
                          </div>
                          </div>}


                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatNumber(amount)} {coin.ticker}
                              </span>

                              {/* Using the reusable TransactionBadge component */}
                              <TransactionBadge type={trade.event_type} />
                            </div>

                            {/* SOL Value and Time */}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {solValue > 0
                                  ? `${formatNumber(solValue)} SOL`
                                  : ""}
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                {formatTimeAgo(trade.event_time)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Wallet Address */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-mono truncate w-[90px] md:w-[100px] text-right">
                            {formatWalletAddress(trade.wallet_address)}
                          </span>

                          {/* External Link Icon */}
                          <div className="opacity-0 group-hover:opacity-100 ml-1 transition-opacity flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-muted-foreground/50 group-hover:text-emerald-600 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
