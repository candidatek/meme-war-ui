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
  getProgramDerivedAddressForPair,
  sleep,
  sortTokensAddresses,
} from '../utils';
import useProgramDetails from './useProgramDetails';
import { useTransactionStatus } from './useTransactionStatus';
import useWalletInfo from './useWalletInfo';
import { PROGRAM_ID } from '@/lib/constants';

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
        new PublicKey(mint_a.toString());
        new PublicKey(mint_b.toString());
        const arr = sortTokensAddresses(mint_a, mint_b);
        const mintA = new PublicKey(arr[0])
        const mintB = new PublicKey(arr[1])
        const memeWarGlobalAccount = await getMemeWarGlobalAccount();
        // Fetch the Program Derived Address for the pair
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
        const pair_pda = await getProgramDerivedAddressForPair(mintA, mintB);
        const createIx = await memeProgram!.methods
          .createMemeWar(hours)
          .accounts({
            payer: payer!,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: pair_pda,
            systemProgram: anchor.web3.SystemProgram.programId
          }).instruction();
  
        tx.add(createIx);
        toast.dismiss();
        toast.message("Approve Transaction from Wallet", { duration: 20000 });
        const signature = await sendTransaction(tx, connection);
        toast.dismiss();
        toast.message("Creating Meme war", { duration: 20000 });
        sleep(5 * 1000)
        return await checkStatus({ signature, action: 'Creating Meme war', setIsLoading: setIsCreateWarLoading });
  
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

