import { formatNumber } from '@/lib/utils';
import { useMemo } from 'react';

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
}

export const useMemeWarCalculations = (memeWarState: any): MemeWarCalculations => { // This useMemeWarCalculations is being used w 3 types: IDashboardWar, War, IMemeWarState. 
  const mintADepositedRaw = useMemo(() => {                                         // Would need to make all the types same in order to use it for this. If they are all the same, I will refactor to use one for all.
    if(memeWarState) {
      return ((Number(memeWarState.mint_a_deposit) + Number(memeWarState?.mint_a_risk_free_deposit)) -
      Number(memeWarState.mint_a_withdrawn) -
      Number(memeWarState?.mint_a_penalty)) /
    10 ** memeWarState.mint_a_decimals;
    }
    return 0;

  }, [memeWarState]);

  const mintBDepositedRaw = useMemo(() => {
    if (memeWarState) {
      return (((Number(memeWarState.mint_b_deposit) + Number(memeWarState?.mint_b_risk_free_deposit)) -
          Number(memeWarState.mint_b_withdrawn) -
          Number(memeWarState?.mint_b_penalty)) /
        10 ** memeWarState.mint_b_decimals
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
        (Number(memeWarState.mint_b_deposit) + Number(memeWarState?.mint_b_risk_free_deposit))  /
        Number(memeWarState?.mint_b_sol_ratio)
      );
    }
    return '0';
  }, [memeWarState]);

  const mintADepositedInSol = useMemo(() => {
    if (memeWarState) {
      return formatNumber(
        (Number(memeWarState.mint_a_deposit) + Number(memeWarState?.mint_a_risk_free_deposit))  /
        Number(memeWarState?.mint_a_sol_ratio)
      );
    }
    return '0';
  }, [memeWarState]);


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
      ) * 100 - mintARFPercentage;
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintARFPercentage, mintBDepositedRaw]);

  const mintBPercentage = useMemo(() => {
    if (memeWarState) {
      return (
        mintBDepositedRaw /
        (mintADepositedRaw + mintBDepositedRaw)
      ) * 100 - mintBRFPercentage;
    }
    return 0;
  }, [memeWarState, mintADepositedRaw, mintBDepositedRaw, mintBRFPercentage]);





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
    mintBRFPercentage
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
