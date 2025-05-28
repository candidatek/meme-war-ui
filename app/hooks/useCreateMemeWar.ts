"use client";
import {
  useCallback,
  useState,
} from 'react';

import { toast } from 'sonner';

import { PROGRAM_ID } from '@/lib/constants';
import { findAssociatedTokenAddress } from '@/lib/utils';
import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  getConnection,
  getMemeWarGlobalAccount,
  getPDAForMemeSigner,
  getProgramDerivedAddressForPair,
  sleep,
  sortTokensAddresses,
} from '../utils';
import useProgramDetails from './useProgramDetails';
import { useTransactionStatus } from './useTransactionStatus';
import useWalletInfo from './useWalletInfo';

export function useCreateMemeWarRegistry(mint_a: string, mint_b: string) {
  const [isCreateWarLoading, setIsCreateWarLoading] = useState<
    boolean | number
  >(false);
  const [error, setError] = useState(null);
  const { publicKey } = useWalletInfo();
  const { sendTransaction } = useWallet();
  const payer = publicKey;
  const { checkStatus } = useTransactionStatus();
  const { memeProgram } = useProgramDetails();

  const createMemeRegistry = useCallback(
    async (
      hours: number,
      riskFreeSolAmount: number,
      indexerPublicKey: PublicKey
    ): Promise<string | null> => {
      const connection = getConnection();
      setIsCreateWarLoading(true);
      setError(null);
      let calculatedMemeWarState: PublicKey | null = null;

      if (!payer) {
        throw new Error("User not connected");
      }

      if (hours > 48) {
        throw new Error("Meme War duration cannot be more than 48 hours");
      }

      if (riskFreeSolAmount < 0 || riskFreeSolAmount > 20) {
        throw new Error("Invalid Risk Free SOL amount");
      }

      try {
        const arr = sortTokensAddresses(mint_a, mint_b);
        const mintA = new PublicKey(arr[0]);
        const mintB = new PublicKey(arr[1]);

        const memeWarGlobalAccount = await getMemeWarGlobalAccount();

        const memeWarRegistryPDA = anchor.web3.PublicKey.findProgramAddressSync(
          [mintA.toBuffer(), mintB.toBuffer()],
          PROGRAM_ID
        )[0];
        const tx = new Transaction();

        if (indexerPublicKey) {
          const transferIx = SystemProgram.transfer({
            fromPubkey: payer!,
            toPubkey: indexerPublicKey,
            lamports: 0.001 * anchor.web3.LAMPORTS_PER_SOL, // 0.001 SOL
          });
          tx.add(transferIx);
        }
        tx.feePayer = payer;

        const memeWarRegistry = await connection.getAccountInfo(
          memeWarRegistryPDA
        );
        if (!memeWarRegistry) {
          const initIx = await memeProgram!.methods
            .initializeMemeRegistry()
            .accounts({
              payer: payer as PublicKey,
              mintA: mintA,
              mintB: mintB,
              memeWarGlobalAccount: memeWarGlobalAccount,
              memeWarRegistry: memeWarRegistryPDA,
              systemProgram: SystemProgram.programId,
            })
            .instruction();
          tx.add(initIx);
        }

        const memeWarRegistryAddr = await getProgramDerivedAddressForPair(
          mintA,
          mintB
        );

        const createIx = await memeProgram!.methods
          .createMemeWar(hours)
          .accounts({
            payer: payer!,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: memeWarRegistryAddr,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();
        tx.add(createIx);
        let initialValidationIndex = 1;

        try {
          const data = await memeProgram!.account.memeWarRegistry.fetch(
            memeWarRegistryAddr
          );
          if (data) {
            //@ts-expect-error some error in types
            initialValidationIndex = data.lastValidated + 1;
          }
        } catch (err) {
          initialValidationIndex = 1;
        }

        calculatedMemeWarState = await getPDAForMemeSigner(
          mintA,
          mintB,
          initialValidationIndex
        );

        const mintAAta = await findAssociatedTokenAddress({
          walletAddress: calculatedMemeWarState,
          tokenMintAddress: mintA,
        });

        const mintBAta = await findAssociatedTokenAddress({
          walletAddress: calculatedMemeWarState,
          tokenMintAddress: mintB,
        });

        const riskFreeLamports = new anchor.BN(
          riskFreeSolAmount * anchor.web3.LAMPORTS_PER_SOL
        );

        const validateIx = await memeProgram!.methods
          .validateMemeWar(riskFreeLamports)
          .accounts({
            payer: payer,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: memeWarRegistryAddr,
            memeWarState: calculatedMemeWarState,
            mintAAta: mintAAta,
            mintBAta: mintBAta,
            creator: payer,
            systemProgram: anchor.web3.SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .instruction();
        tx.add(validateIx);

        toast.message("Creating Meme war", {
          duration: 20000,
          id: "meme-war-creation"
        });

        // Send transaction to wallet for approval
        const signature = await sendTransaction(tx, connection);
        toast.dismiss();
        toast.message("Creating and Validating Meme War", { duration: 20000 });

        await sleep(5 * 1000);

        const statusSuccess = await checkStatus({
          signature,
          action: "Creating Meme War",
          setIsLoading: setIsCreateWarLoading,
        });

        if (statusSuccess && calculatedMemeWarState) {
          return calculatedMemeWarState.toString();
        }

        return null;
      } catch (e) {
        toast.dismiss();
        setIsCreateWarLoading(false);
        console.error("Error in createMemeRegistry:", e);
        setError(e as any);
        throw e;
      } finally {
        setIsCreateWarLoading(false);
      }
    },
    [memeProgram, mint_a, mint_b, payer, checkStatus, sendTransaction]
  );

  return {
    isCreateWarLoading,
    error,
    createMemeRegistry,
  };
}
