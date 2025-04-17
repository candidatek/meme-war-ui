import dotenv from 'dotenv';
import { toast } from 'sonner';

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import { PROGRAM_ID } from '../lib/constants';
import MemeWar from './hooks/idl.json';

dotenv.config();

export const SOLANA_RPC_URL = 'https://devnet.helius-rpc.com/?api-key=d9ee53c8-85c7-48aa-940d-a372b2020b84'
export const SOLANA_MAINNET_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=d9ee53c8-85c7-48aa-940d-a372b2020b84'
export const getConnection = () => {
  if(!process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL) {
    throw new Error('Solana cluster URL is not defined');
  }
  return new Connection(process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL, 'confirmed');
};

export const getProgram = (wallet: any) => {
  const provider = new anchor.AnchorProvider(
    getConnection(),
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  const program = new Program(
    MemeWar as any,
    PROGRAM_ID,
    provider
  );
  return program;
};

export const getProgramDerivedAddress = (
  programId: PublicKey,
  seed: string
) => {
  const pda = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(seed)],
    programId
  );
  return pda[0];
};

export const getMemeWarGlobalAccount = () => {

  const memeWarGlobalAccount = getProgramDerivedAddress(
    PROGRAM_ID,
    'meme-war-global-account'
  );
  return memeWarGlobalAccount;
};

export const getProgramDerivedAddressForPair = (
  seed1: PublicKey,
  seed2: PublicKey
) => {
  const pda = anchor.web3.PublicKey.findProgramAddressSync(
    [seed1.toBuffer(), seed2.toBuffer()],
    PROGRAM_ID
  );
  return pda[0];
};

export const getPDAForMemeSigner =  (
  seed1: PublicKey,
  seed2: PublicKey,
  index: number
) => {
  const pda =  anchor.web3.PublicKey.findProgramAddressSync(
    [seed1.toBuffer(), seed2.toBuffer(), Buffer.from([index])],
    PROGRAM_ID
  );
  return pda[0];
};

export const sortPublicKeys = (keyA: PublicKey, keyB: PublicKey) => {
  const arr = [keyA, keyB];
  arr.sort();
  return [arr[0], arr[1]];
};

export const convertIpfsUri = (uri: string): string => {
  const cfIpfsPrefix = 'https://cf-ipfs.com/ipfs/';
  const pinataPrefix = 'https://pump.mypinata.cloud/ipfs/';

  // Check if the URI starts with the cf-ipfs prefix
  if (uri.startsWith(cfIpfsPrefix)) {
    // Extract the IPFS hash and return the new Pinata URL
    const ipfsHash = uri.substring(cfIpfsPrefix.length);
    return `${pinataPrefix}${ipfsHash}`;
  }

  // If it's not in the expected format, return the original URI
  return uri;
};

export function formatWalletAddress(address: string): string {
  if (address.length <= 8) {
    return address; // If the address is too short, return it as is
  }

  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

export function formatNumber(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  } else if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  } else if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return amount.toString();
}

export const validateSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address); // This will throw an error if the address is invalid
    return true;
  } catch (e) {
    return false;
  }
};

export const sortTokensAddresses = (tokenA: string, tokenB: string): string[] => {
  return [tokenA, tokenB].sort();
};

export const getMemeWarRegistryAddress = (token1: string, token2: string): PublicKey => {
  const sortedTokens = sortTokensAddresses(token1, token2);
  return getProgramDerivedAddressForPair(
    new PublicKey(sortedTokens[0]),
    new PublicKey(sortedTokens[1])
  );
};
interface ErrorToastOptions {
  description?: string;
  duration?: number;
}

export const showErrorToast = (
  message: string,
  options?: ErrorToastOptions
) => {
  toast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000, // Default to 5 seconds
    style: { backgroundColor: "#FF8A8A", color: "#EE9191" }, // Custom styles for error
  });
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatPublicKey = (publicKey: string): string => {
  if (!publicKey) return '';
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};


export const  Billion = 1_000_000_000;