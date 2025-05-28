import { fetchTokenBalance } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

import useConnection from './useConnection';

export const useTokenBalance = (mintA: string | null, mintB: string | null) => {
  const { publicKey } = useWallet();
  const connection = useConnection();

  const query = useQuery({
    queryKey: ["tokenBalances", publicKey],
    queryFn: async () => {
      if (!publicKey) throw new Error("Public key is required");
      if (!mintA || !mintB) throw new Error("Mint keys are required");
      try {
        const mintAKey = new PublicKey(mintA);
        const mintBKey = new PublicKey(mintB);
        const tokenBalance = await Promise.all([
          fetchTokenBalance(publicKey, mintAKey, connection),
          fetchTokenBalance(publicKey, mintBKey, connection),
        ]);
        return tokenBalance;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        throw new Error("Invalid token mint keys: ", e);
      }
    },
    enabled:
      !!publicKey &&
      mintA !== "" &&
      mintB !== "" &&
      mintA !== null &&
      mintB !== null,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 1,
    refetchIntervalInBackground: true,
  });

  const refreshTokenBalance = async () => {
    try {
      query.refetch();
    } catch (error) {
      console.error("Error refreshing token balance:", error);
      throw error;
    }
  };

  return {
    ...query,
    refreshTokenBalance,
  };
};
