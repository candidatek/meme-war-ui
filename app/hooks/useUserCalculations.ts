import { useMemo } from "react";
import { } from "../api/getSolPrice"


export const useUserCalculations = (userState: any) => {

    const userMintADeposit = useMemo(() => {
        if (userState) {
            return Number(userState.mint_a_deposit);
        }
        return 0;

    }, [userState]);

    const userMintBDeposit = useMemo(() => {
        if (userState) {
            return Number(userState.mint_b_deposit);
        }
        return 0;

    }, [userState]);

    const userMintARiskFreeDeposit = useMemo(() => {
        if (userState) {
            return Number(userState.mint_a_risk_free_deposit);
        }
        return 0;
    }, [userState])

    const userMintBRiskFreeDeposit = useMemo(() => {
        if (userState) {
            return Number(userState.mint_b_risk_free_deposit);
        }
        return 0;
    }, [userState])

    const userMintAPenalty = useMemo(() => {
        if (userState) {
            return Number(userState.mint_a_penalty);
        }
        return 0;
    }, [userState]);
    const userMintBPenalty = useMemo(() => {
        if (userState) {
            return Number(userState.mint_b_penalty);
        }
        return 0;
    }, [userState]);
    const userMintAWithdrawn = useMemo(() => {
        if (userState) {
            return Number(userState.mint_a_withdrawn);
        }
        return 0;
    }, [userState]);
    const userMintBWithdrawn = useMemo(() => {
        if (userState) {
            return Number(userState.mint_b_withdrawn);
        }
        return 0;
    }, [userState]);

    const userMintATotalDeposited = useMemo(() => {
        if (userState) {
            return (
                (Number(userState.mint_a_deposit) +
                Number(userState.mint_a_risk_free_deposit) -
                Number(userState.mint_a_penalty) -
                Number(userState.mint_a_withdrawn)) / 10 ** 6
            );
        }
        return 0;
    }, [userState]);
    const userMintBTotalDeposited = useMemo(() => {
        if (userState) {
            return ((
                Number(userState.mint_b_deposit) +
                Number(userState.mint_b_risk_free_deposit) -
                Number(userState.mint_b_penalty) -
                Number(userState.mint_b_withdrawn)) / 10 ** 6
            );
        }
        return 0;
    }, [userState]);


    return {
        userMintADeposit,
        userMintBDeposit,
        userMintARiskFreeDeposit,
        userMintBRiskFreeDeposit,
        userMintAPenalty,
        userMintBPenalty,
        userMintAWithdrawn,
        userMintBWithdrawn,
        userMintATotalDeposited,
        userMintBTotalDeposited,
    }
}
