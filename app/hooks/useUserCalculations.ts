import { useMemo } from "react";
import { UserState } from "@/app/Interfaces";

export function useUserCalculations(userState: UserState | null | undefined) {
  return useMemo(() => {
    if (!userState)
      return {
        userMintADeposit: 0,
        userMintBDeposit: 0,
        userMintAPenalty: 0,
        userMintBPenalty: 0,
        userMintAWithdrawn: 0,
        userMintBWithdrawn: 0,
        userMintARiskFreeDeposit: 0,
        userMintBRiskFreeDeposit: 0,
        userMintATotalDeposited: 0,
        userMintBTotalDeposited: 0,
      };

    const userMintADeposit = Number(userState.mint_a_deposit || 0) / 10 ** 6;
    const userMintBDeposit = Number(userState.mint_b_deposit || 0) / 10 ** 6;
    const userMintAPenalty = Number(userState.mint_a_penalty || 0) / 10 ** 6;
    const userMintBPenalty = Number(userState.mint_b_penalty || 0) / 10 ** 6;
    const userMintAWithdrawn =
      Number(userState.mint_a_withdrawn || 0) / 10 ** 6;
    const userMintBWithdrawn =
      Number(userState.mint_b_withdrawn || 0) / 10 ** 6;
    const userMintARiskFreeDeposit =
      Number(userState.mint_a_risk_free_deposit || 0) / 10 ** 6;
    const userMintBRiskFreeDeposit =
      Number(userState.mint_b_risk_free_deposit || 0) / 10 ** 6;

    const userMintATotalDeposited = userMintADeposit + userMintARiskFreeDeposit;
    const userMintBTotalDeposited = userMintBDeposit + userMintBRiskFreeDeposit;

    return {
      userMintADeposit,
      userMintBDeposit,
      userMintAPenalty,
      userMintBPenalty,
      userMintAWithdrawn,
      userMintBWithdrawn,
      userMintARiskFreeDeposit,
      userMintBRiskFreeDeposit,
      userMintATotalDeposited,
      userMintBTotalDeposited,
    };
  }, [userState]);
}
