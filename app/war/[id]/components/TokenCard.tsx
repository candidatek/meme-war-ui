import { useState, useMemo, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { formatNumber, formatWalletAddress } from "@/lib/utils";
import { TokenCardProps } from "@/app/Interfaces";
import { useMemeWarCalculations } from "@/app/hooks/useMemeWarCalculations";
import { useUserCalculations } from "@/app/hooks/useUserCalculations";
import { WarRoomDialog } from "./WarRoomDialog";

export function TokenCard({
  memeWarStateInfo,
  token,
  totalPledged,
  handleDeposit,
  handleWithdraw,
  pledgeAmount,
  setPledgeAmount,
  tokenBalance,
  btnLoading,
  userState,
  index,
  publicKey,
  isWarEnded,
  disablePledgeBtn,
  disableUnpledgeBtn,
}: TokenCardProps) {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [localBtnLoading, setLocalBtnLoading] = useState<boolean>(
    Boolean(btnLoading)
  );

  const { mintADepositedRaw, mintBDepositedRaw, mintADepositedInSol, mintBDepositedInSol } =
    useMemeWarCalculations(memeWarStateInfo);

  const {
    userMintADeposit,
    userMintBDeposit,
    userMintAPenalty,
    userMintBPenalty,
    userMintAWithdrawn,
    userMintBWithdrawn,
    userMintARiskFreeDeposit,
    userMintBRiskFreeDeposit,
    userMintATotalDeposited,
    userMintBTotalDeposited,
  } = useUserCalculations(userState);

  useEffect(() => {
    setLocalBtnLoading(Boolean(btnLoading));

    let timeoutId: NodeJS.Timeout | null = null;

    if (btnLoading) {
      timeoutId = setTimeout(() => {
        setLocalBtnLoading(false);
      }, 15000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [btnLoading]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (localBtnLoading && !btnLoading) {
      timeoutId = setTimeout(() => {
        setLocalBtnLoading(false);
      }, 15000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [localBtnLoading, btnLoading]);

  const calculateExpectedPayout = (amount: number, percent: number): number => {
    if (!amount || !percent) return 0;
    return amount * (1 + percent / 100);
  };

  const formatSharePercentage = (amount: number, total: number): string => {
    if (!total || !amount) return "0.00";
    return ((amount / total) * 100).toFixed(2);
  };

  const usersWarShare = useMemo(() => {
    try {
      if (!memeWarStateInfo || !userState) return 0;
      if (!userMintATotalDeposited && !userMintBTotalDeposited) return 0;

      if (index === 0) {
        return formatSharePercentage(
          userMintATotalDeposited,
          mintADepositedRaw
        );
      } else {
        return formatSharePercentage(
          userMintBTotalDeposited,
          mintBDepositedRaw
        );
      }
    } catch (e) {
      return 0;
    }
  }, [
    memeWarStateInfo,
    userState,
    index,
    userMintATotalDeposited,
    mintADepositedRaw,
    userMintBTotalDeposited,
    mintBDepositedRaw,
  ]);

  const handleMax = (): void => {
    setPledgeAmount(tokenBalance.toString());
  };

  // Handler for half button
  const handleHalf = (): void => {
    setPledgeAmount((tokenBalance / 2).toString());
  };

  const { mintAPrice, mintBPrice, mintAExpectedPayout, mintBExpectedPayout } =
    useMemeWarCalculations(memeWarStateInfo);
  const userAmountPledged =
    index === 0 ? userMintATotalDeposited : userMintBTotalDeposited;
  const poolAmountPledged = index === 0 ? mintADepositedRaw : mintBDepositedRaw;
  const payoutPercent =
    index === 0
      ? mintAExpectedPayout(Number(pledgeAmount ?? 0))
      : mintBExpectedPayout(Number(pledgeAmount ?? 0));
  const expectedPayout = calculateExpectedPayout(
    Number(userAmountPledged + Number(pledgeAmount)),
    payoutPercent
  );
  const expectedPayoutFormatted = formatNumber(expectedPayout);
  const expectedPayoutDollar =
    expectedPayout * (index === 0 ? mintAPrice : mintBPrice);
  const hasMintA = Number(mintADepositedInSol) > 0;
  const hasMintB = Number(mintBDepositedInSol) > 0;

  let borderClass = '';
  if (!hasMintA || !hasMintB) {
    borderClass = 'border-gray-500 border-2';
  } else {
    const isLeading = index === 0
      ? mintADepositedInSol > mintBDepositedInSol
      : mintBDepositedInSol > mintADepositedInSol;
    borderClass = isLeading ? 'border-primary border-[2px]' : 'border-red-500 border-[2px]';
  }
  return (
    <div 
    className={`bg-card border rounded-lg p-4 sm:p-6 ${borderClass}`}>
      {/* Token Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
        {/* Left Side: Icon, Name, Socials */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-24 h-24 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-xl sm:text-2xl overflow-hidden shrink-0">
            {token.image ? (
              <img
                src={token.image}
                alt={token.name}
                className="w-full h-full object-cover"
              />
            ) : (
              token.emoji
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base sm:text-lg">{token.name}</h3>
              <span className="text-sm font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                ${token.ticker.toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                {token.socialLinks.twitter && (
                  <a
                    href={token.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {token.socialLinks.telegram && (
                  <a
                    href={token.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Telegram"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </a>
                )}
                {token.socialLinks.website && (
                  <a
                    href={token.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Website"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Price and Contract Address Section (Under Name/Socials) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-mono">
                  ${(index === 0 ? mintAPrice : mintBPrice).toFixed(8)}
                </span>
                <span
                  className={`text-xs sm:text-sm ${token.priceChange24h >= 0 ? "text-primary" : "text-red-500"
                    }`}
                >
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(2)}%
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(token.address);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {isCopied ? (
                  <span className="text-primary">Copied!</span>
                ) : (
                  <>
                    <span className="font-mono">
                      {token.address.slice(0, 4)}...{token.address.slice(-4)}
                    </span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Support Button */}
        <div className="sm:ml-4 shrink-0">
          <button
            onClick={() => setIsWarRoomOpen(true)}
            className="p-2 hover:bg-muted rounded-full transition-colors group"
          >
            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">MC:</span>
          <span className="font-mono">${formatNumber(token.marketCap)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Vol:</span>
          <span className="font-mono">${formatNumber(token.volume24h)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Holders:</span>
          <span className="font-mono">{formatNumber(token.holders)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Supply:</span>
          <span className="font-mono">{formatNumber(token.totalSupply)}</span>
        </div>
      </div>

      {/* Pledge Section */}
      <div className="bg-background/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Amount Pledged</span>
          <span className="font-medium retro-text">
            {formatNumber(index === 0 ? mintADepositedRaw : mintBDepositedRaw)}{" "}
            {token.ticker}{" "}
            <span className="text-xs text-gray-400">
              $
              {formatNumber(
                index === 0
                  ? mintADepositedRaw * mintAPrice
                  : mintBDepositedRaw * mintBPrice
              )}{" "}
            </span>
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">War Share</span>
          <span className="font-medium">{usersWarShare}%</span>
        </div>

        {/* Balance and Utility Buttons */}
        <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
          <div className="flex gap-2">
            <button
              onClick={handleHalf}
              disabled={isWarEnded}
              className="px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              HALF
            </button>
            <button
              onClick={handleMax}
              disabled={isWarEnded}
              className="px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
          <div className="text-muted-foreground truncate ml-2">
            Balance: {formatNumber(tokenBalance)} {token.ticker}
          </div>
        </div>

        <input
          type="text"
          value={pledgeAmount}
          onChange={(e) => setPledgeAmount(e.target.value)}
          placeholder={`Enter amount`}
          disabled={isWarEnded}
          className="w-full bg-muted border-border rounded px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Expected Payout Section */}
        {(userAmountPledged || (pledgeAmount && Number(pledgeAmount) > 0)) && (
          <div className="bg-muted/30 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
            <div className="text-xs text-muted-foreground">
              Expected Payout if {token.ticker} Wins
            </div>
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-mono retro-text">
                {formatNumber(
                  calculateExpectedPayout(
                    Number(userAmountPledged + Number(pledgeAmount)),
                    payoutPercent
                  )
                )}{" "}
              </span>
              <span className="text-xs text-primary">
                (+{payoutPercent && payoutPercent.toFixed(2)}% ROI)
              </span>
              <span className="text-base sm:text-lg font-mono retro-text">
                $
                {expectedPayoutDollar ? expectedPayoutDollar?.toFixed(2) : null}{" "}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Your share:{" "}
              <span className="text-primary">
                {usersWarShare}
                {"% "}
              </span>
              of {token.ticker} pool
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {publicKey ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDeposit}
              disabled={localBtnLoading || isWarEnded || disablePledgeBtn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {localBtnLoading ? "Processing..." : `Pledge ${token.ticker}`}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={localBtnLoading || isWarEnded || disableUnpledgeBtn}
              className="bg-muted hover:bg-muted/90 text-foreground py-2 rounded text-xs sm:text-sm font-medium border border-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {localBtnLoading ? "Processing..." : "Unpledge"}
            </button>
          </div>
        ) : (
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-xs sm:text-sm font-medium">
            Connect Wallet
          </button>
        )}

        {/* User Stats */}
        {userState && (
          <div className="mt-2 space-y-1 text-xs sm:text-sm border-t border-border/50 pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposited:</span>
              <span>
                {formatNumber(
                  index === 0 ? userMintADeposit : userMintBDeposit
                )}{" "}
                {token.ticker}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Free:</span>
              <span>
                {formatNumber(
                  index === 0
                    ? userMintARiskFreeDeposit
                    : userMintBRiskFreeDeposit
                )}{" "}
                {token.ticker}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawn:</span>
              <span>
                {formatNumber(
                  index === 0 ? userMintAWithdrawn : userMintBWithdrawn
                )}{" "}
                {token.ticker}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penalty:</span>
              <span>
                {formatNumber(
                  index === 0 ? userMintAPenalty : userMintBPenalty
                )}{" "}
                {token.ticker}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* War Room Modal */}
      <WarRoomDialog
        isOpen={isWarRoomOpen}
        setIsOpen={setIsWarRoomOpen}
        token={token}
      />
    </div>
  );
}
