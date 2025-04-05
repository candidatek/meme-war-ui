'use client';

import { useState, useMemo } from 'react';
import { formatToDollar } from '@/lib/utils';
import { TradeEvent, useGetUserTrades } from '@/app/api/getUserTrades';


const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
};

const TradeRow = ({ trade }: { trade: TradeEvent }) => {
  const formattedAmount = useMemo(() => {
    if (!trade.amount || !trade.mint_decimals) return '';
    return formatToDollar(parseInt(trade.amount) / Math.pow(10, trade.mint_decimals));
  }, [trade.amount, trade.mint_decimals]);
  
  return(
  
  <tr className="!h-16 hover:bg-gray-900 cursor-pointer">
    <td className="border p-2">
      <span className="text-gray-200 font-medium px-3 py-1 bg-gray-700 rounded-full text-sm">
        {trade.event_type === 'RFDeposit' ? 'Risk Free Deposit' : 
          trade.event_type!.charAt(0).toUpperCase() + trade.event_type!.slice(1)}
      </span>
    </td>
    <td className="border p-2">
      <div className="flex flex-col">
        <span className="font-semibold">
        {formattedAmount} USDC
        </span>
        <span className="text-sm text-gray-400">
          ≈ {parseInt(trade.amount_in_sol!) / 10000} SOL
        </span>
      </div>
    </td>
    <td className="border p-2">
      <div className="flex flex-col items-end">
        <span className="text-sm text-gray-400">
          {formatTimestamp(trade.event_time!)}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {`${trade.meme_war_state!.slice(0, 4)}...${trade.meme_war_state!.slice(-4)}`}
        </span>
      </div>
    </td>
  </tr>
);}

const UserTrades = () => {
  const { data: trades = [], refetch: refetchTrades } = useGetUserTrades(20, 0);


  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <TradeRow key={trade.sequence_number} trade={trade} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTrades;