import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface CoinData {
  ticker: string;
  name: string;
  marketCap: number;
  pledgers: number;
  amountPledged: number;
  emoji: string;
}

interface MemeCoinWarProps {
  war: {
    coin1: CoinData;
    coin2: CoinData;
  };
  isTopWar: boolean;
}

export function MemeCoinWar({ war, isTopWar }: MemeCoinWarProps) {
  const { coin1, coin2 } = war;

  return (
    <Card
      className={`
        overflow-hidden transition-all duration-200 relative
        ${
          isTopWar
            ? "border-4 border-primary shadow-lg scale-102 bg-accent/5"
            : ""
        }
      `}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-2 relative">
          <CoinColumn coin={coin1} isTopWar={isTopWar} />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
              ${isTopWar ? "bg-primary text-primary-foreground" : "bg-muted"}
            `}
            >
              VS
            </div>
          </div>
          <CoinColumn coin={coin2} isTopWar={isTopWar} />
        </div>
      </CardContent>
    </Card>
  );
}

function CoinColumn({ coin, isTopWar }: { coin: CoinData; isTopWar: boolean }) {
  return (
    <div className={`p-3 ${isTopWar ? "bg-accent/10" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{coin.emoji}</span>
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            ${coin.ticker.toUpperCase()}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {coin.name}
          </p>
        </div>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        <p>💰 Market Cap: ${formatNumber(coin.marketCap)}</p>
        <p>👥 Pledgers: {formatNumber(coin.pledgers)}</p>
        <p>💎 Pledged: ${formatNumber(coin.amountPledged)}</p>
      </div>
    </div>
  );
}
