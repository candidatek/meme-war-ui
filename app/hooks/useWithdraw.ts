/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";
import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import * as anchor from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getConnection, getMemeWarGlobalAccount, getPDAForMemeSigner, getProgramDerivedAddressForPair } from "../utils";
import useWalletInfo from "./useWalletInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStatus } from "./useTransactionStatus";
import useProgramDetails from "./useProgramDetails";
import { checkIsDevnet, findAssociatedTokenAddress } from "@/lib/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { toast } from "sonner";
import { useMintInfo } from './useMintInfo';


const useWithdrawTokens = (mintAKey: string | null, mintBKey: string | null) => {
  const [error, setError] = useState(null);
  const { publicKey } = useWalletInfo();
  const { sendTransaction } = useWallet();

  const { checkStatus } = useTransactionStatus();
  const { memeProgram } = useProgramDetails()
  const connection = getConnection();

  const { data: mintAInfo } = useMintInfo(mintAKey);
  const { data: mintBInfo } = useMintInfo(mintBKey);


  const withdrawTokens = useCallback(async (mintIdentifier: number,
    setIsLoading: Dispatch<SetStateAction<boolean | number>>,
    refresh: () => void
  ) => {
    if (mintIdentifier > 1)
      throw new Error("Invalid mint identifier");
    try {
      if (!mintAKey || !mintBKey) {
        throw new Error("Mint keys are not available");
      }
      setError(null);
      const tx = new Transaction();
      const memeWarGlobalAccount = getMemeWarGlobalAccount();
      const mintA = new PublicKey(mintAKey)
      const mintB = new PublicKey(mintBKey)
      // Fetching derived addresses
      const memeWarRegistryAddress = getProgramDerivedAddressForPair(mintA, mintB);
      const memeWarRegistry = await memeProgram!.account.memeWarRegistry.fetch(memeWarRegistryAddress);
      const lastValidated = memeWarRegistry.lastValidated as number;
      const depositMint = mintIdentifier === 0 ? mintA : mintB;


      const userAta = await findAssociatedTokenAddress({ walletAddress: publicKey!, tokenMintAddress: depositMint });

      const memeWarState = await getPDAForMemeSigner(mintA, mintB, lastValidated);
      const mintAATA = await findAssociatedTokenAddress({ walletAddress: memeWarState!, tokenMintAddress: mintA });
      const mintBATA = await findAssociatedTokenAddress({ walletAddress: memeWarState!, tokenMintAddress: mintB });

      const userState = await getProgramDerivedAddressForPair(memeWarState, publicKey!);

      const withdrawIx = await memeProgram!.methods.withdrawToken(mintIdentifier)
        .accounts({
          payer: publicKey!,
          memeWarGlobalAccount: memeWarGlobalAccount,
          mintA: mintA,
          mintB: mintB,
          userAta: userAta,
          mintAAta: mintAATA,
          mintBAta: mintBATA,
          mintABaseVault: new PublicKey(mintAInfo.pool_base_token_account),
          mintBBaseVault: new PublicKey(mintBInfo.pool_base_token_account),
          mintAQuoteVault: new PublicKey(mintAInfo.pool_quote_token_account),
          mintBQuoteVault: new PublicKey(mintBInfo.pool_quote_token_account),
          memeWarRegistry: memeWarRegistryAddress,
          memeWarState: memeWarState,
          userState: userState,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
      tx.add(withdrawIx);
      toast.dismiss();
      toast.message("Approve Transaction from Wallet", { duration: 20000 });
      const devStr = checkIsDevnet()
      const signature = await sendTransaction(tx, connection);
      console.log(`https://explorer.solana.com/tx/${signature}${devStr}`);

      checkStatus({ signature, action: `Withdraw tokens`, setIsLoading, stopLoadingWithInteger: true, refresh });

    } catch (err) {
      console.log(err);
      throw new Error("Error in withdrawing tokens");
    }
  }, [mintAKey, mintBKey, memeProgram, publicKey, mintAInfo, mintBInfo]);

  return {
    error,
    withdrawTokens,
  };
};

export default useWithdrawTokens;