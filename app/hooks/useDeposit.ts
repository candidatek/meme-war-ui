/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Program } from "@coral-xyz/anchor";
import { BN } from "bn.js";


import { useState, useCallback, Dispatch } from 'react';
import * as anchor from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getConnection, getMemeWarGlobalAccount, getPDAForMemeSigner, getProgramDerivedAddressForPair, sortPublicKeys } from "../utils";
import useWalletInfo from "./useWalletInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStatus } from "./useTransactionStatus";
import useProgramDetails from "./useProgramDetails";
import { findAssociatedTokenAddress } from "@/lib/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { toast } from "sonner";
import { SetStateAction } from "jotai";


const useDepositTokens = (mintAKey: string | null, mintBKey: string | null) => {
  const [error, setError] = useState(null);
  const { publicKey } = useWalletInfo();
  const { sendTransaction } = useWallet();

  const { checkStatus } = useTransactionStatus();
  const { memeProgram } = useProgramDetails()
  const connection = getConnection();

  const memeWarGlobalAccount = getMemeWarGlobalAccount();

  const depositTokens = useCallback(async (
    amount: number,
    mintIdentifier: 0 | 1,
    setLoading: Dispatch<SetStateAction<boolean | number>>,
    refresh: () => void,
    mintDecimal: number
  ) => {
    if (mintIdentifier > 1)
      throw new Error("Invalid mint identifier");
    let notifierId;
    try {
      if (!mintAKey || !mintBKey) {
        throw new Error("Invalid mint keys");
      }
      const mintA = new PublicKey(mintAKey)
      const mintB = new PublicKey(mintBKey)
      setLoading(mintIdentifier);
      setError(null);
      const tx = new Transaction();


      // Fetching derived addresses
      const memeWarRegistryAddress = getProgramDerivedAddressForPair(mintA, mintB);
      const memeWarRegistry = await memeProgram!.account.memeWarRegistry.fetch(memeWarRegistryAddress);
      const lastValidated = memeWarRegistry.lastValidated as number;
      const depositMint = mintIdentifier === 0 ? mintA : mintB;

      const userAta = await findAssociatedTokenAddress({ walletAddress: publicKey!, tokenMintAddress: depositMint });

      const memeWarState = await getPDAForMemeSigner(mintA, mintB, lastValidated);

      const memeWarStateAta = await findAssociatedTokenAddress({ walletAddress: memeWarState, tokenMintAddress: depositMint });

      const userState = await getProgramDerivedAddressForPair(memeWarState, publicKey!);
      const userStateValue = await connection.getAccountInfo(userState);

      if (!userStateValue) {

        const ix = await memeProgram!.methods
          .initUserAccounts()
          .accounts({
            memeWarGlobalAccount,
            payer: publicKey!,
            memeWarState,
            memeWarRegistry: memeWarRegistryAddress,
            mintA,
            mintB,
            userState,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();
        tx.add(ix);
      }

      const depositIx = await memeProgram!.methods.depositToken(new BN(amount * (10 ** mintDecimal)))
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
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
      tx.add(depositIx);
      toast.dismiss();
      notifierId = toast.message("Approve Transaction from Wallet", { duration: 20000 });
      const signature = await sendTransaction(tx, connection);
      console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      checkStatus({ signature, action: `Deposit ${amount} tokens`, setIsLoading: setLoading, refresh, stopLoadingWithInteger: true });

    } catch (err) {
      toast.dismiss(notifierId);
      console.log(err);
      throw err;
    }
  }, [mintAKey, mintBKey, memeProgram, publicKey, connection, memeWarGlobalAccount, sendTransaction, checkStatus]);

  return {
    error,
    depositTokens,
  };
};

export default useDepositTokens;