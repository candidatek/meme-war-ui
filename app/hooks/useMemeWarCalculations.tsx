import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { formatNumber } from '@/lib/utils';
import { PublicKey } from '@solana/web3.js';

import { IMemeWarState } from '../api/getMemeWarStateInfo';
import { useSolPrice } from '../api/getSolPrice';
import { getTokenRatio } from '../utils';
import useConnection from './useConnection';
import { useMintInfo } from './useMintInfo';

interface MemeWarCalculations {
  rfPlusMintADeposited: string;
  rfPlusMintBDeposited: string;
  mintADepositedInSol: string;
  mintBDepositedInSol: string;
  mintAPercentage: number;
  mintBPercentage: number;
  mintARiskFreeDeposited: number;
  mintBRiskFreeDeposited: number;
  mintARFPercentage: number;
  mintBRFPercentage: number;
  mintADepositedRaw: number;
  mintBDepositedRaw: number;
  mintADepositedInDollar: number;
  mintBDepositedInDollar: number;
  mintAPrice: number;
  mintBPrice: number;
  mintAExpectedPayout: (num: number) => number;
  mintBExpectedPayout: (num: number) => number;
}

export const useMemeWarCalculations = (
  memeWarState: IMemeWarState | undefined
): MemeWarCalculations => {
  // This useMemeWarCalculations is being used w 3 types: IDashboardWar, War, IMemeWarState.
  const { data: { price = 170 } = {} } = useSolPrice();

  const { data: mintAInfo } = useMintInfo(memeWarState?.mint_a || null);
  const { data: mintBInfo } = useMintInfo(memeWarState?.mint_b || null);
  const connection = useConnection();

  const [mintARatio, setMintARatio] = useState<number | null>(null);
  const [mintBRatio, setMintBRatio] = useState<number | null>(null);

  useEffect(() => {
    const fetchMintARatio = async () => {
      if (mintAInfo && connection) {
        try {
          const mintABaseVault = new PublicKey(
            mintAInfo.pool_base_token_account
          );
          const mintAQuoteVault = new PublicKey(
            mintAInfo.pool_quote_token_account
          );

          const baseBalance = await connection.getTokenAccountBalance(
            mintABaseVault
          );
          const quoteBalance = await connection.getTokenAccountBalance(
            mintAQuoteVault
          );

          const ratio = getTokenRatio(
            Number(baseBalance.value.amount),
            Number(quoteBalance.value.amount)
          );
          setMintARatio(ratio);
        } catch (error) {
          console.error("Error fetching mint A ratio:", error);
          setMintARatio(Number(memeWarState?.mint_a_sol_ratio));
        }
      }
    };

    fetchMintARatio();
  }, [mintAInfo, connection]);

  useEffect(() => {
    const fetchMintBRatio = async () => {
      if (mintBInfo && connection) {
        try {
          const mintABaseVault = new PublicKey(
            mintBInfo.pool_base_token_account
          );
          const mintAQuoteVault = new PublicKey(
            mintBInfo.pool_quote_token_account
          );

          const baseBalance = await connection.getTokenAccountBalance(
            mintABaseVault
          );
          const quoteBalance = await connection.getTokenAccountBalance(
            mintAQuoteVault
          );

          const ratio = getTokenRatio(
            Number(baseBalance.value.amount),
            Number(quoteBalance.value.amount)
          );
          setMintBRatio(ratio);
        } catch (error) {
          console.error("Error fetching mint A ratio:", error);
          setMintBRatio(Number(memeWarState?.mint_b_sol_ratio));
        }
      }
    };

    fetchMintBRatio();
  }, [mintBInfo, connection]);

  const mintADepositedRaw = useMemo(() => {
    // Would need to make all the types same in order to use it for this. If they are all the same, I will refactor to use one for all.
    if (memeWarState) {
      return (
        (Number(memeWarState.mint_a_deposit) +
          Number(memeWarState?.mint_a_risk_free_deposit) -
          Number(memeWarState?.mint_a_withdrawn) -
          Number(memeWarState?.mint_a_penalty)) /
        10 ** 6
      );
    }
    return 0;
  }, [memeWarState]);

  const mintBDepositedRaw = useMemo(() => {
    if (memeWarState) {
      return (
        (Number(memeWarState.mint_b_deposit) +
          Number(memeWarState?.mint_b_risk_free_deposit) -
          Number(memeWarState.mint_b_withdrawn) -
          Number(memeWarState?.mint_b_penalty)) /
        10 ** 6
      );
    }
    return 0;
  }, [memeWarState]);

  const rfPlusMintADeposited = useMemo(() => {
    if (memeWarState) {
      return formatNumber(
        (Number(memeWarState.mint_a_deposit) +
          Number(memeWarState?.mint_a_risk_free_deposit) -
          Number(memeWarState.mint_a_withdrawn) -
          Number(memeWarState?.mint_a_penalty)) /
        10 ** memeWarState.mint_a_decimals
      );
    }
    return "Loading...";
  }, [memeWarState]);

  const rfPlusMintBDeposited = useMemo(() => {
    if (memeWarState) {
      return formatNumber(
        (Number(memeWarState.mint_b_deposit) +
          Number(memeWarState?.mint_b_risk_free_deposit) -
          Number(memeWarState.mint_b_withdrawn) -
          Number(memeWarState?.mint_b_penalty)) /
        10 ** memeWarState.mint_b_decimals
      );
    }
    return "Loading...";
  }, [memeWarState]);

  const mintBDepositedInSol = useMemo(() => {
    if (memeWarState && mintBRatio) {
      return formatNumber(
        (Number(memeWarState.mint_b_deposit) +
          Number(memeWarState?.mint_b_risk_free_deposit) -
          Number(memeWarState?.mint_b_withdrawn) +
          Number(memeWarState?.mint_b_penalty)) /
        mintBRatio /
        10 ** 6
      );
    }
    return "0";
  }, [memeWarState, mintBRatio]);

  const mintADepositedInSol = useMemo(() => {
    if (memeWarState && mintARatio) {
      return formatNumber(
        (Number(memeWarState.mint_a_deposit) +
          Number(memeWarState?.mint_a_risk_free_deposit) -
          Number(memeWarState?.mint_a_withdrawn) +
          Number(memeWarState?.mint_a_penalty)) /
        mintARatio /
        10 ** 6
      );
    }
    return "0";
  }, [memeWarState, mintARatio]);

  const mintBDepositedInDollar = useMemo(() => {
    if (memeWarState && mintBRatio) {
      return (
        ((Number(memeWarState.mint_b_deposit) +
          Number(memeWarState?.mint_b_risk_free_deposit)) /
          mintBRatio /
          10 ** 6) *
        Number(price)
      );
    }
    return 0;
  }, [memeWarState, price, mintBRatio]);

  const mintADepositedInDollar = useMemo(() => {
    if (memeWarState && mintARatio) {
      return (
        ((Number(memeWarState.mint_a_deposit) +
          Number(memeWarState?.mint_a_risk_free_deposit)) /
          mintARatio /
          10 ** 6) *
        Number(price)
      );
    }
    return 0;
  }, [memeWarState, price, mintARatio]);

  const mintARiskFreeDeposited = useMemo(() => {
    if (memeWarState) {
      return Number(memeWarState?.mint_a_risk_free_deposit);
    }
    return 0;
  }, [memeWarState]);

  const mintARFPercentage = useMemo(() => {
    if (memeWarState) {
      const riskFreeDeposited = Number(mintARiskFreeDeposited);
      const totalDeposited = Number(memeWarState?.mint_a_deposit || 0);

      return (
        (riskFreeDeposited / (riskFreeDeposited + totalDeposited)) * 100 || 0
      );
    }
    return 0;
  }, [memeWarState, mintARiskFreeDeposited]);

  const mintBRiskFreeDeposited = useMemo(() => {
    if (memeWarState) {
      return Number(memeWarState?.mint_a_risk_free_deposit);
    }
    return 0;
  }, [memeWarState]);

  const mintBRFPercentage = useMemo(() => {
    if (memeWarState) {
      const riskFreeDeposited = Number(mintBRiskFreeDeposited);
      const totalDeposited = Number(memeWarState?.mint_b_deposit || 0);

      return (
        (riskFreeDeposited / (riskFreeDeposited + totalDeposited)) * 100 || 0
      );
    }
    return 0;
  }, [memeWarState, mintBRiskFreeDeposited]);

  const mintAPercentage = useMemo(() => {
    if (memeWarState) {
      return (
        (mintADepositedRaw / (mintADepositedRaw + mintBDepositedRaw)) * 100
      );
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintBDepositedRaw]);

  const mintBPercentage = useMemo(() => {
    if (memeWarState) {
      return (
        (mintBDepositedRaw / (mintADepositedRaw + mintBDepositedRaw)) * 100
      );
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintBDepositedRaw]);

  const mintAPrice = useMemo(() => {
    if (memeWarState && mintARatio) {
      return price / mintARatio;
    }
    return 0;
  }, [memeWarState, price, mintARatio]);

  const mintBPrice = useMemo(() => {
    if (memeWarState && mintBRatio) {
      return price / mintBRatio;
    }
    return 0;
  }, [memeWarState, price, mintBRatio]);

  const mintAExpectedPayout = useCallback(
    (pledgeAmount: number) => {
      if (!memeWarState || !Number(mintADepositedInSol) || !mintARatio) {
        return 0;
      }

      const aAmount =
        Number(mintADepositedInSol) + Number(pledgeAmount) / mintARatio;
      const bAmount = Number(mintBDepositedInSol);

      const payout = (bAmount / aAmount) * 100;
      return Math.min(payout, 100);
    },
    [memeWarState, mintADepositedInSol, mintBDepositedInSol, mintARatio]
  );

  const mintBExpectedPayout = useCallback(
    (pledgeAmount: number) => {
      if (!memeWarState || !Number(mintBDepositedInSol) || !mintBRatio) {
        return 0;
      }

      const aAmount = Number(mintADepositedInSol);
      const bAmount =
        Number(mintBDepositedInSol) + Number(pledgeAmount) / mintBRatio;

      const payout = (aAmount / bAmount) * 100;
      console.log(aAmount, bAmount, payout);
      return Math.min(payout, 100);
    },
    [memeWarState, mintADepositedInSol, mintBDepositedInSol, mintBRatio]
  );

  return {
    rfPlusMintADeposited,
    rfPlusMintBDeposited,
    mintADepositedInSol,
    mintBDepositedInSol,
    mintAPercentage,
    mintBPercentage,
    mintARiskFreeDeposited,
    mintBRiskFreeDeposited,
    mintARFPercentage,
    mintBRFPercentage,
    mintADepositedRaw,
    mintBDepositedRaw,
    mintADepositedInDollar,
    mintBDepositedInDollar,
    mintAPrice,
    mintBPrice,
    mintAExpectedPayout,
    mintBExpectedPayout,
  };
};

// Usage example:
// const {
//   mintADeposited,
//   mintBDeposited,
//   mintADepositedInSol,
//   mintBDepositedInSol,
//   mintAPercentage,
//   mintBPercentage
// } = useMemeWarCalculations();
