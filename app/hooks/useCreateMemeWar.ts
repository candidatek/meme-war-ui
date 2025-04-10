import { useCallback, useState } from "react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  getConnection,
  getMemeWarGlobalAccount,
  getProgramDerivedAddressForPair,
  sleep,
  sortTokensAddresses,
  getPDAForMemeSigner,
} from "../utils";
import { findAssociatedTokenAddress } from "@/lib/utils";
import useProgramDetails from "./useProgramDetails";
import { useTransactionStatus } from "./useTransactionStatus";
import useWalletInfo from "./useWalletInfo";
import { PROGRAM_ID } from "@/lib/constants";
import BN from "bn.js";
import toast from "react-hot-toast";

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
    async (hours: number, indexerPublicKey: PublicKey) => {
      console.log(
        `Creating meme war registry for ${hours} hours between ${mint_a} and ${mint_b}`
      );
      const connection = getConnection();
      setIsCreateWarLoading(true);
      setError(null);

      if (!payer) {
        console.error("User not connected");
        throw new Error("User not connected");
      }

      if (hours > 48) {
        console.error(
          "Invalid duration: Meme War duration cannot be more than 48 hours"
        );
        throw new Error("Meme War duration cannot be more than 48 hours");
      }

      try {
        console.log("Sorting token addresses");
        const arr = sortTokensAddresses(mint_a, mint_b);
        const mintA = new PublicKey(arr[0]);
        const mintB = new PublicKey(arr[1]);
        console.log(
          `Sorted tokens: mintA=${mintA.toString()}, mintB=${mintB.toString()}`
        );

        console.log("Getting meme war global account");
        const memeWarGlobalAccount = await getMemeWarGlobalAccount();
        console.log(`Global account: ${memeWarGlobalAccount.toString()}`);

        console.log("Generating meme war registry PDA");
        const memeWarRegistryPDA = anchor.web3.PublicKey.findProgramAddressSync(
          [mintA.toBuffer(), mintB.toBuffer()],
          PROGRAM_ID
        )[0];
        console.log(`Registry PDA: ${memeWarRegistryPDA.toString()}`);

        const tx = new Transaction();

        if (indexerPublicKey) {
          console.log(
            `Adding transfer to indexer ${indexerPublicKey.toString()}`
          );
          const transferIx = SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: indexerPublicKey,
            lamports: 0.001 * anchor.web3.LAMPORTS_PER_SOL,
          });
          tx.add(transferIx);
          console.log("Added indexer transfer instruction");
        }
        tx.feePayer = payer;

        console.log("Checking if registry already exists");
        const memeWarRegistry = await connection.getAccountInfo(
          memeWarRegistryPDA
        );
        if (!memeWarRegistry) {
          console.log(
            "Registry doesn't exist. Creating initialize instruction"
          );
          const initIx = await memeProgram!.methods
            .initializeMemeRegistry()
            .accounts({
              payer: payer,
              mintA: mintA,
              mintB: mintB,
              memeWarGlobalAccount: memeWarGlobalAccount,
              memeWarRegistry: memeWarRegistryPDA,
              systemProgram: SystemProgram.programId,
            })
            .instruction();
          tx.add(initIx);
          console.log("Added initialize instruction");
        } else {
          console.log("Registry already exists, skipping initialization");
        }

        console.log("Getting program derived address for pair");
        const pair_pda = await getProgramDerivedAddressForPair(mintA, mintB);
        console.log(`Pair PDA: ${pair_pda.toString()}`);

        console.log("Creating meme war instruction");
        const createIx = await memeProgram!.methods
          .createMemeWar(hours)
          .accounts({
            payer: payer,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: pair_pda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();
        tx.add(createIx);
        console.log("Added create meme war instruction");

        const initialValidationIndex = 1;
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
          .validateMemeWar(new BN(riskFreeDeposit))
          .accounts({
            payer: payer,
            mintA: mintA,
            mintB: mintB,
            memeWarGlobalAccount: memeWarGlobalAccount,
            memeWarRegistry: pair_pda,
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
        const signature = await sendTransaction(tx, connection);
        console.log(`Transaction signed with signature: ${signature}`);

        toast.dismiss();
        toast("Creating and Validating Meme War", { duration: 20000 });
        console.log("Waiting for transaction confirmation");

        await sleep(5000);
        console.log("Checking transaction status");
        return await checkStatus({
          signature,
          action: "Creating Meme War",
          setIsLoading: setIsCreateWarLoading,
        });
      } catch (e) {
        toast.dismiss();
        setIsCreateWarLoading(false);
        console.error("Error creating meme war registry:", e);
        throw e;
      } finally {
        console.log("Meme war registry creation process completed");
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
