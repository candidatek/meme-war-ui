import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';

import { toast } from 'react-hot-toast';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';

import { getConnection } from '../utils';
import useProgramDetails from './useProgramDetails';
import { useTransactionStatus } from './useTransactionStatus';

// Constants
const PUMP_FUN_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const EVENT_AUTHORITY = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
const MPL_TOKEN_METADATA_PROGRAM_ID =
new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const MINT_AUTHORITY_SEED = "mint_authority";
const BONDING_CURVE_SEED = "bonding_curve";
const GLOBAL_ACCOUNT_SEED = "global";
const METADATA_SEED = "metadata";

const useCreatePumpToken = () => {
  const [error, setError] = useState<Error | null>(null);
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { checkStatus } = useTransactionStatus();
  const { memeProgram } = useProgramDetails();
  const connection = getConnection();
  const { sendTransaction } = useWallet();


  const createPumpToken = useCallback(async (
    mintAName: string,
    mintASymbol: string,
    mintAUri: string,
    mintBName: string,
    mintBSymbol: string,
    mintBUri: string,
    setLoading: Dispatch<SetStateAction<number | boolean>>,
    refresh: () => void
  ) => {
    let notifierId;
    try {
      if (!publicKey || !signTransaction) {
        setError(new Error("Wallet not connected or doesn't support signing"));
        return;
      }

      if (!memeProgram) {
        setError(new Error("Program not initialized"));
        return;
      }

      //setLoading(true);
      setError(null);

      // Generate new keypairs for mints
      const mintA = Keypair.generate();
      const mintB = Keypair.generate();

      // Find PDAs
      const [mintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(MINT_AUTHORITY_SEED)],
        PUMP_FUN_PROGRAM_ID
      );

      const [mintABondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from(BONDING_CURVE_SEED), mintA.publicKey.toBuffer()],
        PUMP_FUN_PROGRAM_ID
      );

      const [mintBBondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from(BONDING_CURVE_SEED), mintB.publicKey.toBuffer()],
        PUMP_FUN_PROGRAM_ID
      );

      const [globalAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_ACCOUNT_SEED)],
        PUMP_FUN_PROGRAM_ID
      );

      const [mintAMetadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(METADATA_SEED),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintA.publicKey.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      );

      const [mintBMetadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(METADATA_SEED),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintB.publicKey.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      );

      // Get associated token accounts
      const mintAAssociatedBondingCurve = await getAssociatedTokenAddress(
        mintA.publicKey,
        mintABondingCurve,
        true
      );

      const mintBAssociatedBondingCurve = await getAssociatedTokenAddress(
        mintB.publicKey,
        mintBBondingCurve,
        true
      );

      // Create transaction
      const transaction = new Transaction();
      
      // Add compute budget to transaction
      // const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
      //   units: 1000000 
      // });
      // transaction.add(modifyComputeUnits);

      // Get blockhash

      const connection = getConnection();
      

      // Create the instruction
      const ix = await memeProgram!.methods
        .createPumpToken(
          mintAName,
          mintASymbol,
          mintAUri,
          mintBName,
          mintBSymbol,
          mintBUri
        )
        .accounts({
          mintAAddress: mintA.publicKey,
          mintBAddress: mintB.publicKey,
          mintAuthority:mintAuthority,
          mintABondingCurve:mintABondingCurve,
          mintBBondingCurve:mintBBondingCurve,
          mintAAssociatedBondingCurve:mintAAssociatedBondingCurve,
          mintBAssociatedBondingCurve:mintBAssociatedBondingCurve,
          global: globalAccount,
          mplTokenMetadata: MPL_TOKEN_METADATA_PROGRAM_ID,
          mintAMetadata: mintAMetadataPDA,
          mintBMetadata: mintBMetadataPDA,
          user: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          eventAuthority: EVENT_AUTHORITY,
          pumpFunProgram: PUMP_FUN_PROGRAM_ID
        }).signers([mintA,mintB])
        .instruction();

      transaction.add(ix);

      toast("Approve Transaction from Wallet", { duration: 20000 });
      console.log("Sending transaction to wallet for approval");
      const signature = await sendTransaction(transaction, connection,{skipPreflight:true});
      console.log("Transaction sent to wallet for approval",signature);
      
      checkStatus({ 
        signature, 
        action: "Create Pump Tokens", 
        setIsLoading: setLoading, 
        refresh 
      });

    } catch (err) {
      toast.dismiss(notifierId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error creating pump tokens:', errorMessage);
      
      // More detailed error logging
      if (err instanceof Error) {
        console.error('Error stack:', err.stack);
        
        // Try to extract more details from the error
        const errorObj = JSON.stringify(err, Object.getOwnPropertyNames(err));
        console.error('Full error object:', errorObj);
      }
      
      setError(err instanceof Error ? err : new Error(`Failed to create pump token: ${errorMessage}`));
      setLoading(false);
    }
  }, [publicKey, signTransaction, memeProgram, connection, checkStatus]);

  return {
    error,
    createPumpToken,
  };
};

export default useCreatePumpToken;