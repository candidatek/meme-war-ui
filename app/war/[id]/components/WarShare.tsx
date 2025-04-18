import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { WarData } from "@/app/Interfaces";
import { useMemeWarCalculations } from "@/app/hooks/useMemeWarCalculations";
import { IMemeWarState } from "@/app/api/getMemeWarStateInfo";
import VsComponent from "@/components/VsComponent";

interface WarShareProps {
  warData: WarData;
  memeWarStateInfo: IMemeWarState;
  endedTimeAgo: string;
  timeLeft: string;
}

export function WarShare({
  warData,
  memeWarStateInfo,
  endedTimeAgo,
  timeLeft,
}: WarShareProps) {
  const {
    mintAPercentage,
    mintBPercentage,
    mintADepositedRaw,
    mintBDepositedRaw,
    mintAPrice,
    mintBPrice,
  } = useMemeWarCalculations(memeWarStateInfo);
  const totalDeposit =
    (mintADepositedRaw + mintBDepositedRaw) * ((mintAPrice + mintBPrice) / 2);

  const isMintAHigher = mintAPercentage >= mintBPercentage;
  const mintAColorClass = isMintAHigher ? "text-green-600" : "text-red-600";
  const mintBColorClass = isMintAHigher ? "text-red-600" : "text-green-600";
  const mintABgColorClass = isMintAHigher ? "bg-green-600" : "bg-red-600";
  const mintBBgColorClass = isMintAHigher ? "bg-red-600" : "bg-green-600";

  return (
    <div className="col-span-1 flex flex-col items-center justify-start my-8 md:my-0">
      <div className="w-full md:sticky md:top-4">
        <div className="flex justify-center items-center mb-4 md:mb-8">
          <VsComponent />
        </div>

        {/* Coin Ratio */}
        <div className="mb-4 md:mb-6 text-center">
          <div className="text-sm text-muted-foreground mb-1">Price Ratio</div>
          <div className="font-mono text-base md:text-lg">
            1 : {(warData.coin2.price / warData.coin1.price || 0).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {warData.coin1.ticker} : {warData.coin2.ticker}
          </div>
        </div>

        {/* War Share Bar */}
        <div className="space-y-3 md:space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            War Share
          </div>

          {/* Progress Labels */}
          <div className="flex justify-between text-xs mb-1">
            <span className={`${mintAColorClass} font-medium`}>
              {mintAPercentage.toFixed(1)}%
            </span>
            <span className={`${mintBColorClass} font-medium`}>
              {mintBPercentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className={`absolute left-0 top-0 bottom-0 ${mintABgColorClass}`}
              style={{
                width: `${mintAPercentage}%`,
                borderRadius: "9999px 0 0 9999px",
              }}
              animate={{
                width: `${mintAPercentage}%`,
              }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className={`absolute right-0 top-0 bottom-0 ${mintBBgColorClass}`}
              style={{
                width: `${mintBPercentage}%`,
                borderRadius: "0 9999px 9999px 0",
              }}
              animate={{
                width: `${mintBPercentage}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Token Amounts */}
          <div className="flex justify-between text-xs">
            <div className="text-left">
              <div className={`${mintAColorClass} font-medium`}>
                {formatNumber(mintADepositedRaw)}{" "}
                <span className="hidden sm:inline">{warData.coin1.ticker}</span>
              </div>
              <div className="text-muted-foreground mt-0.5">
                ${formatNumber(mintADepositedRaw * mintAPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className={`${mintBColorClass} font-medium`}>
                {formatNumber(mintBDepositedRaw)}{" "}
                <span className="hidden sm:inline">{warData.coin2.ticker}</span>
              </div>
              <div className="text-muted-foreground mt-0.5">
                ${formatNumber(mintBDepositedRaw * mintBPrice)}
              </div>
            </div>
          </div>

          {/* Time Left */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="text-sm text-muted-foreground mb-1">
              {memeWarStateInfo?.war_ended ? "War Ended" : "Time Left"}
            </div>
            <motion.div
              className="text-base sm:text-xl font-mono"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {memeWarStateInfo?.war_ended ? endedTimeAgo : timeLeft}
            </motion.div>
          </div>

          {/* Winner Declaration */}
          {memeWarStateInfo?.war_ended && (
            <div className="mt-3 sm:mt-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Winner</div>
              <div className="text-base sm:text-xl font-mono">
                {memeWarStateInfo.winner_declared}
              </div>
            </div>
          )}

          {/* Total Pledged */}
          <div className="mt-3 sm:mt-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Total Pledged
            </div>
            <div className="text-base sm:text-xl font-mono">
              ${formatNumber(totalDeposit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
