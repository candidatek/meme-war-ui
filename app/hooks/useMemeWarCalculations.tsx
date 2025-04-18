import { formatNumber } from '@/lib/utils';
import { useCallback, useMemo } from 'react';
import { useSolPrice } from '../api/getSolPrice';
import { IMemeWarState } from '../api/getMemeWarStateInfo';

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
  mintAExpectedPayout: (num: number) => number ;
  mintBExpectedPayout: (num: number) => number;
}

export const useMemeWarCalculations = (memeWarState: IMemeWarState | undefined): MemeWarCalculations => { // This useMemeWarCalculations is being used w 3 types: IDashboardWar, War, IMemeWarState. 
  const { data: { price = 130 } = {} } = useSolPrice()
  const mintADepositedRaw = useMemo(() => {                                         // Would need to make all the types same in order to use it for this. If they are all the same, I will refactor to use one for all.
    if (memeWarState) {
      return ((Number(memeWarState.mint_a_deposit) + Number(memeWarState?.mint_a_risk_free_deposit)) -
        Number(memeWarState?.mint_a_withdrawn) -
        Number(memeWarState?.mint_a_penalty)) /
        10 ** 6;
    }
    return 0;

  }, [memeWarState]);

  const mintBDepositedRaw = useMemo(() => {
    if (memeWarState) {
      return (((Number(memeWarState.mint_b_deposit) + Number(memeWarState?.mint_b_risk_free_deposit)) -
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
        ((Number(memeWarState.mint_a_deposit) + Number(memeWarState?.mint_a_risk_free_deposit)) -
          Number(memeWarState.mint_a_withdrawn) -
          Number(memeWarState?.mint_a_penalty)) /
        10 ** memeWarState.mint_a_decimals
      );
    }
    return 'Loading...';
  }, [memeWarState]);

  const rfPlusMintBDeposited = useMemo(() => {
    if (memeWarState) {
      return formatNumber(
        ((Number(memeWarState.mint_b_deposit) + Number(memeWarState?.mint_b_risk_free_deposit)) -
          Number(memeWarState.mint_b_withdrawn) -
          Number(memeWarState?.mint_b_penalty)) /
        10 ** memeWarState.mint_b_decimals
      );
    }
    return 'Loading...';
  }, [memeWarState]);

  const mintBDepositedInSol = useMemo(() => {

    if (memeWarState) {

      return formatNumber(
        ((Number(memeWarState.mint_b_deposit)
          + Number(memeWarState?.mint_b_risk_free_deposit)
          - Number(memeWarState?.mint_b_withdrawn) +
          Number(memeWarState?.mint_b_penalty))
          /
          Number(memeWarState?.mint_b_sol_ratio)) / 10 ** 6
      );
    }
    return '0';
  }, [memeWarState]);

  const mintADepositedInSol = useMemo(() => {
    if (memeWarState) {

      return formatNumber(
        (((Number(memeWarState.mint_a_deposit) +
          Number(memeWarState?.mint_a_risk_free_deposit) -
          Number(memeWarState?.mint_a_withdrawn) +
          Number(memeWarState?.mint_a_penalty)
        ) /
          Number(memeWarState?.mint_a_sol_ratio)) / 10 ** 6)
      );
    }
    return '0';
  }, [memeWarState]);

  const mintBDepositedInDollar = useMemo(() => {

    if (memeWarState) {

      return (
        (((Number(memeWarState.mint_b_deposit) + Number(memeWarState?.mint_b_risk_free_deposit)) /
          Number(memeWarState?.mint_b_sol_ratio)) / 10 ** 6) * Number(price)
      );
    }
    return 0;
  }, [memeWarState, price]);

  const mintADepositedInDollar = useMemo(() => {
    if (memeWarState) {

      return (
        (((Number(memeWarState.mint_a_deposit) + Number(memeWarState?.mint_a_risk_free_deposit)) /
          Number(memeWarState?.mint_a_sol_ratio)) / 10 ** 6) * Number(price)
      );
    }
    return 0;
  }, [memeWarState, price]);


  const mintARiskFreeDeposited = useMemo(() => {
    if (memeWarState) {
      return Number(memeWarState?.mint_a_risk_free_deposit)
    }
    return 0;
  }, [memeWarState])

  const mintARFPercentage = useMemo(() => {
    if (memeWarState) {
      const riskFreeDeposited = Number(mintARiskFreeDeposited);
      const totalDeposited = Number(memeWarState?.mint_a_deposit || 0);

      return (riskFreeDeposited / (riskFreeDeposited + totalDeposited)) * 100 || 0;
    }
    return 0;
  }, [memeWarState, mintARiskFreeDeposited]);

  const mintBRiskFreeDeposited = useMemo(() => {
    if (memeWarState) {
      return Number(memeWarState?.mint_a_risk_free_deposit)
    }
    return 0;
  }, [memeWarState])

  const mintBRFPercentage = useMemo(() => {
    if (memeWarState) {
      const riskFreeDeposited = Number(mintBRiskFreeDeposited);
      const totalDeposited = Number(memeWarState?.mint_b_deposit || 0);

      return (riskFreeDeposited / (riskFreeDeposited + totalDeposited)) * 100 || 0;
    }
    return 0;
  }, [memeWarState, mintBRiskFreeDeposited]);

  const mintAPercentage = useMemo(() => {
    if (memeWarState) {
      return (
        mintADepositedRaw /
        (mintADepositedRaw + mintBDepositedRaw)
      ) * 100;
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintBDepositedRaw]);

  const mintBPercentage = useMemo(() => {
    if (memeWarState) {
      return (
        mintBDepositedRaw /
        (mintADepositedRaw + mintBDepositedRaw)
      ) * 100;
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintBDepositedRaw]);


  const mintAPrice = useMemo(() => {
    if (memeWarState) {
      return price / Number(memeWarState.mint_a_sol_ratio);
    }
    return 0;
  }, [memeWarState, price]);

  const mintBPrice = useMemo(() => {
    if (memeWarState) {
      return price / Number(memeWarState.mint_b_sol_ratio);
    }
    return 0;
  }, [memeWarState, price]);

  const mintAExpectedPayout = useCallback((pledgeAmount: number) => {
    if (!memeWarState || !Number(mintADepositedInSol)) {
      return 0;
    }
    
    const aAmount = Number(mintADepositedInSol) + (Number(pledgeAmount) / Number(memeWarState.mint_a_sol_ratio));
    const bAmount = Number(mintBDepositedInSol);
    
    const payout = bAmount / aAmount * 100;
    return Math.min(payout, 100);
  }, [memeWarState, mintADepositedInSol, mintBDepositedInSol]);
  
  const mintBExpectedPayout = useCallback((pledgeAmount: number) => {
    if (!memeWarState || !Number(mintBDepositedInSol)) {
      return 0;
    }
    
    const aAmount = Number(mintADepositedInSol) ;
    const bAmount = Number(mintBDepositedInSol) + (Number(pledgeAmount) / Number(memeWarState.mint_b_sol_ratio));
    
    const payout = aAmount / bAmount * 100;
    console.log(aAmount, bAmount, payout)
    return Math.min(payout, 100);
  }, [memeWarState, mintADepositedInSol, mintBDepositedInSol]);

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
