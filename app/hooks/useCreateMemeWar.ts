import {
  useCallback,
  useState,
} from 'react';

import * as anchor from '@project-serum/anchor';
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
import { PROGRAM_ID } from '@/lib/constants';
import { findAssociatedTokenAddress } from '@/lib/utils';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'sonner';

export function useCreateMemeWarRegistry(mint_a: string, mint_b: string) {
    const [isCreateWarLoading, setIsCreateWarLoading] = useState(false);
    const [error, setError] = useState(null);
    const { publicKey } = useWalletInfo();
    const { sendTransaction } = useWallet();
    const payer = publicKey;
    const { checkStatus } = useTransactionStatus();
    const { memeProgram } = useProgramDetails()
    const createMemeRegistry = useCallback(async (hours: number, indexerPublicKey: PublicKey) => {
      const connection = getConnection();
      setIsCreateWarLoading(true);
      setError(null);
      if (!payer) {
        throw new Error('User not connected');
      }
  
      if (hours > 48) {
        throw new Error('Meme War duration cannot be more than 48 hours');
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
  
        // Add indexer payment instruction
        if (indexerPublicKey) {
          const transferIx = SystemProgram.transfer({
            fromPubkey: payer!,
            toPubkey: indexerPublicKey,
            lamports: 0.001 * anchor.web3.LAMPORTS_PER_SOL // 0.001 SOL
          });
          tx.add(transferIx);
        }
        tx.feePayer = payer;
  
        const memeWarRegistry = await connection.getAccountInfo(memeWarRegistryPDA);
        if (!memeWarRegistry) {
          const initIx = await memeProgram!.methods.initializeMemeRegistry()
            .accounts({
              payer: payer as PublicKey,
              mintA: mintA,
              mintB: mintB,
              memeWarGlobalAccount: memeWarGlobalAccount,
              memeWarRegistry: memeWarRegistryPDA,
              systemProgram: SystemProgram.programId
            }).instruction();
          tx.add(initIx);
        }

        console.log("Getting program derived address for pair");
        const memeWarRegistryAddr = await getProgramDerivedAddressForPair(mintA, mintB);
        console.log(`Pair PDA: ${memeWarRegistryAddr.toString()}`);

        console.log("Creating meme war instruction");
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
        let initialValidationIndex = 1

        console.log("Added create meme war instruction");
        try {
          const data = await memeProgram!.account.memeWarRegistry.fetch(
            memeWarRegistryAddr
          );
          console.log(data)
          if(data) {
            //@ts-expect-error some error in types
            initialValidationIndex = data.lastValidated + 1;
          }
  
        }
        catch(err) {
          initialValidationIndex = 1
        }
       
      
        console.log(
          `Getting PDA for meme signer with validation index ${initialValidationIndex}`
        );
        const memeWarState = await getPDAForMemeSigner(
          mintA,
          mintB,
          initialValidationIndex
        );
        console.log(`Meme war state: ${memeWarState.toString()}`);
        console.log("Finding associated token addresses");
        const mintAAta = await findAssociatedTokenAddress({
          walletAddress: memeWarState,
          tokenMintAddress: mintA,
        });
        console.log(`Token A ATA: ${mintAAta.toString()}`);

        const mintBAta = await findAssociatedTokenAddress({
          walletAddress: memeWarState,
          tokenMintAddress: mintB,
        });
        console.log(`Token B ATA: ${mintBAta.toString()}`);

        const riskFreeDeposit = 2;
        console.log(
          `Creating validate instruction with risk free deposit of ${riskFreeDeposit}`
        );
        const validateIx = await memeProgram!.methods
          .validateMemeWar(new anchor.BN(riskFreeDeposit))
          .accounts({
            payer: payer,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: memeWarRegistryAddr,
            memeWarState: memeWarState,
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
        console.log("Added validate instruction");

        toast.dismiss();
        toast("Approve Transaction from Wallet", { duration: 20000 });
        console.log("Sending transaction to wallet for approval");
        const signature = await sendTransaction(tx, connection, {skipPreflight: true});
        console.log(`Transaction signed with signature: ${signature}`);

        toast.dismiss();
        toast.message("Creating Meme war", { duration: 20000 });
        sleep(5 * 1000)
        // return await checkStatus({ signature, action: 'Creating Meme war', setIsLoading: setIsCreateWarLoading });
  
        // Prepare and send the transaction
  
      } catch (e) {
        toast.dismiss();
        setIsCreateWarLoading(false);
        console.error(e);
        throw e;
      } finally {
        setIsCreateWarLoading(false);
      }
    }, [memeProgram, mint_a, mint_b, payer, checkStatus, sendTransaction]);
  
    return {
      isCreateWarLoading,
      error,
      createMemeRegistry,
    };
  }

