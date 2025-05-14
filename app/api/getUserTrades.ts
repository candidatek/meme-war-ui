import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';
import { useWallet } from '@solana/wallet-adapter-react';

export interface TradeEvent {
  sequence_number?: string;
  event_type?: 'RFDeposit' | 'deposit' | 'withdraw' | 'penalty';
  amount?: string;
  penalty?: string;
  fee?: string;
  mint?: string;
  amount_in_sol?: string;
  event_time?: string;
  meme_war_state?: string;
  wallet_address?: string;
  // mint_decimals?: number;
  mint_symbol?: string;
}

interface TradeResponse {
  data: TradeEvent[];
}

const getUserTrades = async (params: { 
  limit: number; 
  offset: number;
  walletAddress: string | undefined;
}): Promise<TradeEvent[]> => {
  const response = await axios.get<TradeResponse>(
    `${SERVER_URL}/getUserTrades`,
    {
      params,
      headers: { 'Content-Type': 'application/json' }
    }
  );
  return response.data.data;
};

export const useGetUserTrades = (limit = 30, offset = 0) => {
  const { wallet } = useWallet();
  const walletAddress = wallet?.adapter.publicKey?.toBase58();

  return useQuery({
    queryKey: ['userTrades', walletAddress, limit, offset],
    queryFn: () => getUserTrades({ limit, offset, walletAddress }),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
    refetchIntervalInBackground: true,
  });
};