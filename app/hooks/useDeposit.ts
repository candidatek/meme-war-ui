import { BN } from "bn.js";

import { useState, useCallback, Dispatch } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getConnection,
  getMemeWarGlobalAccount,
  getPDAForMemeSigner,
  getProgramDerivedAddressForPair,
} from "../utils";
import useWalletInfo from "./useWalletInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStatus } from "./useTransactionStatus";
import useProgramDetails from "./useProgramDetails";
import { findAssociatedTokenAddress } from "@/lib/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { toast } from "sonner";
import { SetStateAction } from "jotai";
import { useMintInfo } from "./useMintInfo";

const useDepositTokens = (mintAKey: string | null, mintBKey: string | null) => {
  const [error, setError] = useState(null);
  const { publicKey } = useWalletInfo();
  const { sendTransaction } = useWallet();

  const { checkStatus } = useTransactionStatus();
  const { memeProgram } = useProgramDetails();
  const connection = getConnection();

  const memeWarGlobalAccount = getMemeWarGlobalAccount();

  const { data: mintAInfo } = useMintInfo(mintAKey!);
  const { data: mintBInfo } = useMintInfo(mintBKey!);

  const depositTokens = useCallback(
    async (
      amount: number,
      mintIdentifier: 0 | 1,
      setLoading: Dispatch<SetStateAction<boolean | number>>
    ) => {
      if (mintIdentifier > 1) throw new Error("Invalid mint identifier");
      let notifierId;
      try {
        if (!mintAKey || !mintBKey) {
          throw new Error("Invalid mint keys");
        }

        const mintA = new PublicKey(mintAKey);
        const mintB = new PublicKey(mintBKey);

        setLoading(mintIdentifier);
        setError(null);
        const tx = new Transaction();

        const memeWarRegistryAddress = getProgramDerivedAddressForPair(
          mintA,
          mintB
        );

        const memeWarRegistry =
          await memeProgram!.account.memeWarRegistry.fetch(
            memeWarRegistryAddress
          );

        const lastValidated = memeWarRegistry.lastValidated as number;
        const depositMint = mintIdentifier === 0 ? mintA : mintB;

        const userAta = await findAssociatedTokenAddress({
          walletAddress: publicKey!,
          tokenMintAddress: depositMint,
        });

        const memeWarState = await getPDAForMemeSigner(
          mintA,
          mintB,
          lastValidated
        );

        const memeWarStateAta = await findAssociatedTokenAddress({
          walletAddress: memeWarState,
          tokenMintAddress: depositMint,
        });

        const userState = await getProgramDerivedAddressForPair(
          memeWarState,
          publicKey!
        );

        const userStateValue = await connection.getAccountInfo(userState);

        if (!userStateValue) {
          const ix = await memeProgram!.methods
            .initUserAccounts()
            .accounts({
              memeWarGlobalAccount,
              payer: publicKey!,
              memeWarState,
              memeWarRegistry: memeWarRegistryAddress,
              feeReceiver: new PublicKey("indxzHYZWjjCrfphURMyLoMmfLrDU3RuaYx56hmMv5x"), 
              mintA,
              mintB,
              userState,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction();
          tx.add(ix);
        }

        const depositIx = await memeProgram!.methods
          .depositToken(new BN(amount * 10 ** 6))
          .accounts({
            payer: publicKey!,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            userAta: userAta,
            memeWarStateAta: memeWarStateAta,
            memeWarRegistry: memeWarRegistryAddress,
            memeWarState: memeWarState,
            userState: userState,
            mintABaseVault: new PublicKey(mintAInfo.pool_base_token_account),
            mintBBaseVault: new PublicKey(mintBInfo.pool_base_token_account),
            mintAQuoteVault: new PublicKey(mintAInfo.pool_quote_token_account),
            mintBQuoteVault: new PublicKey(mintBInfo.pool_quote_token_account),
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();
        tx.add(depositIx);

        toast.dismiss();
        notifierId = toast.message("Approve Transaction from Wallet", {
          duration: 20000,
        });

        const signature = await sendTransaction(tx, connection);
        console.log(
          `Explorer URL: https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );

        checkStatus({
          signature,
          action: `Deposit ${amount} tokens.`,
          setIsLoading: setLoading,
          stopLoadingWithInteger: true,
        });
        return signature;
      } catch (err) {
        toast.dismiss(notifierId);
        console.log("Error in depositTokens:", err);
        throw err;
      }
    },
    [
      mintAKey,
      mintBKey,
      memeProgram,
      publicKey,
      connection,
      memeWarGlobalAccount,
      sendTransaction,
      checkStatus,
      mintAInfo,
      mintBInfo
    ]
  );

  return {
    error,
    depositTokens,
  };
};

export default useDepositTokens;
