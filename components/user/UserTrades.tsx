'use client';

import { useMemo } from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  TradeEvent,
  useGetUserTrades,
} from '@/app/api/getUserTrades';
import {
  formatPublicKey,
  formatToDollar,
} from '@/lib/utils';

const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
};

const TradeRow = ({ trade }: { trade: TradeEvent }) => {
  const formattedAmount = useMemo(() => {
    if (!trade.amount) return '';
    return formatToDollar(parseInt(trade.amount) / Math.pow(10, 6));
  }, [trade.amount]);

  let eventTypeLabel = 'Unknown';
  let eventTypeColor = 'bg-gray-500/20 text-gray-400';

  if (trade.event_type === 'RFDeposit') {
    eventTypeLabel = 'Risk Free Deposit';
    eventTypeColor = 'bg-blue-500/20 text-blue-400';
  } else if (trade.event_type === 'deposit') {
    eventTypeLabel = 'Deposit';
    eventTypeColor = 'bg-green-500/20 text-green-400';
  } else if (trade.event_type === 'withdraw') {
    eventTypeLabel = 'Withdraw';
    eventTypeColor = 'bg-red-500/20 text-red-400';
  } else if (trade.event_type) {
    eventTypeLabel = trade.event_type.charAt(0).toUpperCase() + trade.event_type.slice(1);
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
    >
      <td className="py-4 px-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${eventTypeColor}`}>
          {eventTypeLabel}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {formattedAmount} {trade.mint_symbol}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            ≈ {parseInt(trade.amount_in_sol!) / 10000} SOL
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col items-end">
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(trade.event_time!)}
          </span>
          <a
            href={`/meme-wars/${trade.meme_war_state}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary hover:text-primary/80 font-mono mt-1 transition-colors"
          >
            {formatPublicKey(trade.meme_war_state || '')}
          </a>
        </div>
      </td>
    </motion.tr>
  );
};

const UserTrades = () => {
  const { data: trades = [], isLoading, refetch: refetchTrades } = useGetUserTrades(20, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2 text-muted-foreground">Loading trades...</span>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <h3 className="text-lg font-medium">No Trades Found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You haven't made any trades yet. Participate in a meme coin war by pledging to see your trades here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3 px-4">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3 px-4">Amount</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {trades.map((trade) => (
                <TradeRow key={trade.sequence_number} trade={trade} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTrades;