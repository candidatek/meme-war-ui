"use client";

import dynamic from "next/dynamic";

import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useCallback, useEffect, useMemo } from "react";

import { toast, Toaster } from "sonner";
import { useCluster } from "../cluster/cluster-data-access";

// require('@solana/wallet-adapter-react-ui/styles.css');

// Create a styled wallet button component
const StyledWalletMultiButton = dynamic(
  async () => {
    const { WalletMultiButton } = await import(
      "@solana/wallet-adapter-react-ui"
    );
    return function StyledWalletMultiButton(props: any) {
      return (
        <div className="wallet-button-wrapper">
          <WalletMultiButton {...props} />
        </div>
      );
    };
  },
  { ssr: false }
);

export const WalletButton = StyledWalletMultiButton;

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  //   useEffect(() => {
  //     // This will only run in the browser, not during SSR
  //     import('@solana/wallet-adapter-react-ui/styles.css')
  //       .catch(err => console.error('Error loading wallet styles:', err));
  //   }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          {children}

          <Toaster
            position="bottom-left"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex items-center bg-green rounded-sm p-5 text-green-1 bg-card text-xl rounded-2 min-w-[100px]", // Added p-5 for 20px padding, text-xl for larger font
                title: "font-semibold pr-4 text-xl", // Added text-xl for 20px font
                description: "text-xl",
                icon: "flex items-center justify-center size-10",
              },
              style: {
                border: "5px solid #4CAF50", // Solid green border
                padding: "20px",
                borderRadius: "12px",
                fontSize: "40px",
                background: "rgba(0, 0, 0, 0.75)", // Slightly less transparent background
              },
            }}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
