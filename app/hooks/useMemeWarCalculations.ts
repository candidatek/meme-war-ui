import { useMemo } from "react";

export function useMemeWarCalculations(memeWarStateInfo: any) {
  return useMemo(() => {
    if (!memeWarStateInfo)
      return {
        mintADepositedRaw: 0,
        mintBDepositedRaw: 0,
      };

    const mintADepositedRaw =
      Number(memeWarStateInfo.mint_a_total_deposited) /
      10 ** (memeWarStateInfo.mint_a_decimals || 9);

    const mintBDepositedRaw =
      Number(memeWarStateInfo.mint_b_total_deposited) /
      10 ** (memeWarStateInfo.mint_b_decimals || 9);

    return {
      mintADepositedRaw,
      mintBDepositedRaw,
    };
  }, [memeWarStateInfo]);
}
