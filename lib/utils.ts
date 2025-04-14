import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./constants";
import { Connection, PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatToDollar = (amount: number): string => {
  return `${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const getConnection = () => {
  if (!process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL) {
    throw new Error("Solana cluster URL is not defined");
  }
  return new Connection(
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL,
    "confirmed"
  );
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

export const fetchTokenBalance = async (
  publicKey: PublicKey,
  tokenMintAddress: PublicKey,
  connection: Connection
): Promise<number> => {
  if (!publicKey || !tokenMintAddress) {
    return 0;
  }

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        mint: tokenMintAddress,
      }
    );

    if (tokenAccounts.value.length > 0) {
      const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
      const amount = tokenAccountInfo.tokenAmount.uiAmount;
      return amount;
    } else {
      return 0;
    }
  } catch (err) {
    return 0;
  }
};

export function formatNumber(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  } else if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  } else {
    return num ? num.toFixed(2) : "0";
  }
}

export function formatWalletAddress(address: string): string {
  if (address.length <= 8) {
    return address; // If the address is too short, return it as is
  }

  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const formatPublicKey = (publicKey: string) => {
  return `${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`;
};

export const validateSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (e) {
    return false;
  }
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
    duration: options?.duration ?? 5000,
    style: { backgroundColor: "#FF8A8A", color: "#FFFFFF" },
  });
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

export const findAssociatedTokenAddress = ({
  walletAddress,
  tokenMintAddress,
}: {
  walletAddress: PublicKey;
  tokenMintAddress: PublicKey;
}): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
};

export async function getAssetFromMint(assetId: string) {
  const requestBody = {
    jsonrpc: "2.0",
    id: "test",
    method: "getAsset",
    params: { id: assetId },
  };

  const url =
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL ||
    "https://mainnet.helius-rpc.com/?api-key=d2d5073c-e14c-49f9-b6b7-92e094f7d489";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log(data);
  return data;
}
