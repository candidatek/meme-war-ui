import { formatNumber } from "@/lib/utils";
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSolPrice } from "../api/getSolPrice";
import { IMemeWarState } from "../api/getMemeWarStateInfo";
import { useMintInfo } from "./useMintInfo";
import { PublicKey } from "@solana/web3.js";
import { getTokenRatio } from "../utils";
import useConnection from "./useConnection";

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
  const { data: { price = 170 } = {} } = useSolPrice();
  const { data: mintAInfo } = useMintInfo(memeWarState?.mint_a || null);
  const { data: mintBInfo } = useMintInfo(memeWarState?.mint_b || null);
  const connection = useConnection();

  const { data: mintARatio = Number(memeWarState?.mint_a_sol_ratio) } = useQuery({
    queryKey: ["mintARatio", mintAInfo?.pool_base_token_account, mintAInfo?.pool_quote_token_account],
    queryFn: async () => {
      if (!mintAInfo || !connection) return Number(memeWarState?.mint_a_sol_ratio);

      const mintABaseVault = new PublicKey(mintAInfo.pool_base_token_account);
      const mintAQuoteVault = new PublicKey(mintAInfo.pool_quote_token_account);
      const [baseBalance, quoteBalance] = await Promise.all([
        connection.getTokenAccountBalance(mintABaseVault),
        connection.getTokenAccountBalance(mintAQuoteVault),
      ]);

      return getTokenRatio(
        Number(baseBalance.value.amount),
        Number(quoteBalance.value.amount)
      );
    },
    enabled: !!mintAInfo && !!connection,
    staleTime: 120_000,
  });

  const { data: mintBRatio = Number(memeWarState?.mint_b_sol_ratio) } = useQuery({
    queryKey: ["mintBRatio", mintBInfo?.pool_base_token_account, mintBInfo?.pool_quote_token_account],
    queryFn: async () => {
      if (!mintBInfo || !connection) return Number(memeWarState?.mint_b_sol_ratio);

      const mintBBaseVault = new PublicKey(mintBInfo.pool_base_token_account);
      const mintBQuoteVault = new PublicKey(mintBInfo.pool_quote_token_account);
      const [baseBalance, quoteBalance] = await Promise.all([
        connection.getTokenAccountBalance(mintBBaseVault),
        connection.getTokenAccountBalance(mintBQuoteVault),
      ]);

      return getTokenRatio(
        Number(baseBalance.value.amount),
        Number(quoteBalance.value.amount)
      );
    },
    enabled: !!mintBInfo && !!connection,
    staleTime: 120_000,
  });

  const mintADepositedRaw = useMemo(() => {
    if (!memeWarState) return 0;
    return (
      (Number(memeWarState.mint_a_deposit) +
        Number(memeWarState?.mint_a_risk_free_deposit) -
        Number(memeWarState?.mint_a_withdrawn) -
        Number(memeWarState?.mint_a_penalty)) /
      10 ** 6
    );
  }, [memeWarState]);

  const mintBDepositedRaw = useMemo(() => {
    if (!memeWarState) return 0;
    return (
      (Number(memeWarState.mint_b_deposit) +
        Number(memeWarState?.mint_b_risk_free_deposit) -
        Number(memeWarState.mint_b_withdrawn) -
        Number(memeWarState?.mint_b_penalty)) /
      10 ** 6
    );
  }, [memeWarState]);

  const rfPlusMintADeposited = useMemo(() => {
    if (!memeWarState) return "Loading...";
    return formatNumber(
      (Number(memeWarState.mint_a_deposit) +
        Number(memeWarState?.mint_a_risk_free_deposit) -
        Number(memeWarState.mint_a_withdrawn) -
        Number(memeWarState?.mint_a_penalty)) /
      10 ** memeWarState.mint_a_decimals
    );
  }, [memeWarState]);

  const rfPlusMintBDeposited = useMemo(() => {
    if (!memeWarState) return "Loading...";
    return formatNumber(
      (Number(memeWarState.mint_b_deposit) +
        Number(memeWarState?.mint_b_risk_free_deposit) -
        Number(memeWarState.mint_b_withdrawn) -
        Number(memeWarState?.mint_b_penalty)) /
      10 ** memeWarState.mint_b_decimals
    );
  }, [memeWarState]);

  const mintADepositedInSol = useMemo(() => {
    if (!memeWarState || !mintARatio) return "0";
    return formatNumber(
      (Number(memeWarState.mint_a_deposit) +
        Number(memeWarState?.mint_a_risk_free_deposit) -
        Number(memeWarState?.mint_a_withdrawn) +
        Number(memeWarState?.mint_a_penalty)) /
      mintARatio /
      10 ** 6
    );
  }, [memeWarState, mintARatio]);

  const mintBDepositedInSol = useMemo(() => {
    if (!memeWarState || !mintBRatio) return "0";
    return formatNumber(
      (Number(memeWarState.mint_b_deposit) +
        Number(memeWarState?.mint_b_risk_free_deposit) -
        Number(memeWarState?.mint_b_withdrawn) +
        Number(memeWarState?.mint_b_penalty)) /
      mintBRatio /
      10 ** 6
    );
  }, [memeWarState, mintBRatio]);

  const mintADepositedInDollar = useMemo(() => {
    if (!memeWarState || !mintARatio) return 0;
    return (
      ((Number(memeWarState.mint_a_deposit) +
        Number(memeWarState?.mint_a_risk_free_deposit)) /
        mintARatio /
        10 ** 6) *
      Number(price)
    );
  }, [memeWarState, price, mintARatio]);

  const mintBDepositedInDollar = useMemo(() => {
    if (!memeWarState || !mintBRatio) return 0;
    return (
      ((Number(memeWarState.mint_b_deposit) +
        Number(memeWarState?.mint_b_risk_free_deposit)) /
        mintBRatio /
        10 ** 6) *
      Number(price)
    );
  }, [memeWarState, price, mintBRatio]);

  const mintARiskFreeDeposited = useMemo(
    () => Number(memeWarState?.mint_a_risk_free_deposit || 0),
    [memeWarState]
  );

  const mintBRiskFreeDeposited = useMemo(
    () => Number(memeWarState?.mint_b_risk_free_deposit || 0),
    [memeWarState]
  );

  const mintARFPercentage = useMemo(() => {
    const total = mintARiskFreeDeposited + Number(memeWarState?.mint_a_deposit || 0);
    return total ? (mintARiskFreeDeposited / total) * 100 : 0;
  }, [mintARiskFreeDeposited, memeWarState]);

  const mintBRFPercentage = useMemo(() => {
    const total = mintBRiskFreeDeposited + Number(memeWarState?.mint_b_deposit || 0);
    return total ? (mintBRiskFreeDeposited / total) * 100 : 0;
  }, [mintBRiskFreeDeposited, memeWarState]);

  const mintAPercentage = useMemo(() => {
    const total = mintADepositedRaw + mintBDepositedRaw;
    return total ? (mintADepositedRaw / total) * 100 : 0;
  }, [mintADepositedRaw, mintBDepositedRaw]);

  const mintBPercentage = useMemo(() => {
    const total = mintADepositedRaw + mintBDepositedRaw;
    return total ? (mintBDepositedRaw / total) * 100 : 0;
  }, [mintADepositedRaw, mintBDepositedRaw]);

  const mintAPrice = useMemo(() => (mintARatio ? price / mintARatio : 0), [price, mintARatio]);
  const mintBPrice = useMemo(() => (mintBRatio ? price / mintBRatio : 0), [price, mintBRatio]);

  const mintAExpectedPayout = useCallback(
    (pledgeAmount: number) => {
      if (!memeWarState || !Number(mintADepositedInSol) || !mintARatio) return 0;
      const aAmount = Number(mintADepositedInSol) + pledgeAmount / mintARatio;
      const bAmount = Number(mintBDepositedInSol);
      return Math.min((bAmount / aAmount) * 100, 100);
    },
    [memeWarState, mintADepositedInSol, mintBDepositedInSol, mintARatio]
  );

  const mintBExpectedPayout = useCallback(
    (pledgeAmount: number) => {
      if (!memeWarState || !Number(mintBDepositedInSol) || !mintBRatio) return 0;
      const bAmount = Number(mintBDepositedInSol) + pledgeAmount / mintBRatio;
      const aAmount = Number(mintADepositedInSol);
      return Math.min((aAmount / bAmount) * 100, 100);
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