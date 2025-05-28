"use client";

import React, { useMemo } from 'react';

import { motion } from 'framer-motion';

import {
  TradeEvent,
  useGetUserTrades,
} from '@/app/api/getUserTrades';
import {
  formatTimeAgo,
  formatToDollar,
} from '@/lib/utils';

const UserEarnings: React.FC = () => {
  const { data: trades = [], isLoading } = useGetUserTrades(50, 0);

  const earningsData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalEarnings: 0,
        creatorFees: 0,
        warWinnings: 0,
        recentTransactions: [],
      };
    }

    const earningsTransactions = trades.filter(
      (trade) =>
        parseFloat(trade.amount_in_sol || "0") > 0 ||
        parseFloat(trade.fee || "0") > 0
    );

    const sortedTransactions = [...earningsTransactions].sort((a, b) => {
      const dateA = a.event_time ? new Date(a.event_time).getTime() : 0;
      const dateB = b.event_time ? new Date(b.event_time).getTime() : 0;
      return dateB - dateA;
    });

    const totalEarnings = earningsTransactions.reduce(
      (sum, trade) =>
        sum +
        parseFloat(trade.amount_in_sol || "0") +
        parseFloat(trade.fee || "0"),
      0
    );

    const creatorFees = earningsTransactions.reduce(
      (sum, trade) => sum + parseFloat(trade.fee || "0"),
      0
    );

    const warWinnings = earningsTransactions.reduce(
      (sum, trade) =>
        trade.event_type === "withdraw" || trade.event_type === "deposit"
          ? sum + parseFloat(trade.amount_in_sol || "0")
          : sum,
      0
    );

    return {
      totalEarnings,
      creatorFees,
      warWinnings,
      recentTransactions: sortedTransactions.slice(0, 10),
    };
  }, [trades]);

  const getTransactionDescription = (trade: TradeEvent) => {
    const mintSymbol = trade.mint?.substring(0, 4) || "";

    switch (trade.event_type) {
      case "deposit":
        return `${mintSymbol} War Win`;
      case "RFDeposit":
        return `${mintSymbol} Risk-Free Deposit`;
      case "withdraw":
        return `${mintSymbol} vs ${trade.meme_war_state?.substring(0, 4) || ""
          } War Win`;
      case "penalty":
        return `${mintSymbol} War Penalty`;
      default:
        if (parseFloat(trade.fee || "0") > 0) {
          return `${mintSymbol} vs ${trade.meme_war_state?.substring(0, 4) || ""
            } Creator Fee`;
        }
        return "Transaction";
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-background border rounded-lg p-6 flex flex-col">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">
            Total Earnings
          </h3>
          <p className="text-2xl font-bold text-green-500">
            ${formatToDollar(earningsData.totalEarnings)}
          </p>
        </div>

        <div className="bg-background border rounded-lg p-6 flex flex-col">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">
            Creator Fees
          </h3>
          <p className="text-2xl font-bold text-green-500">
            ${formatToDollar(earningsData.creatorFees)}
          </p>
        </div>

        <div className="bg-background border rounded-lg p-6 flex flex-col">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">
            War Winnings
          </h3>
          <p className="text-2xl font-bold text-green-500">
            ${formatToDollar(earningsData.warWinnings)}
          </p>
        </div>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium">Recent Transactions</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : earningsData.recentTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y">
            {earningsData.recentTransactions.map((trade, index) => (
              <motion.div
                key={`${trade.sequence_number}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-secondary/5"
              >
                <div>
                  <p className="font-medium">
                    {getTransactionDescription(trade)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trade.event_time
                      ? formatTimeAgo(new Date(trade.event_time))
                      : "Unknown date"}
                  </p>
                </div>
                <div className="text-green-500 font-medium">
                  +$
                  {formatToDollar(
                    parseFloat(trade.amount_in_sol || "0") +
                    parseFloat(trade.fee || "0")
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEarnings;
