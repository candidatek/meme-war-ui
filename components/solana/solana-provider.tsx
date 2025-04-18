"use client";

import dynamic from "next/dynamic";
import { ReactNode, useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { Toaster } from "sonner";
import { useCluster } from "../cluster/cluster-data-access";
import {
  UnifiedWalletProvider,
  UnifiedWalletButton,
} from "@jup-ag/wallet-adapter";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import type { Adapter } from "@solana/wallet-adapter-base";

export const WalletButton = dynamic(
  async () => {
    return function StyledWalletButton(props: any) {
      return (
        <div className="wallet-button-wrapper">
          <UnifiedWalletButton {...props} />
        </div>
      );
    };
  },
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);

  const wallets: Adapter[] = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const basicWallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ];

    return basicWallets.filter(
      (item) => item && item.name && item.icon
    ) as Adapter[];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <UnifiedWalletProvider
        wallets={wallets}
        config={{
          autoConnect: true,
          env: cluster.network === "mainnet-beta" ? "mainnet-beta" : "devnet",
          metadata: {
            name: "Meme Coin Wars",
            description: "Meme Coin Wars - Battle your favorite tokens",
            url: typeof window !== "undefined" ? window.location.origin : "",
            iconUrls: [
              typeof window !== "undefined"
                ? window.location.origin + "/logo.png"
                : "",
            ],
          },
          walletlistExplanation: {
            href: "https://station.jup.ag/docs/additional-topics/wallet-list",
          },
          theme: "dark",
          lang: "en",
        }}
      >
        {children}

        <Toaster
          position="bottom-left"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex items-center bg-green rounded-sm p-5 text-green-1 bg-card text-xl rounded-2 min-w-[100px]",
              title: "font-semibold pr-4 text-xl",
              description: "text-xl",
              icon: "flex items-center justify-center size-10",
            },
            style: {
              border: "5px solid rgba(76, 175, 80, 0.75)",
              padding: "20px",
              borderRadius: "12px",
              fontSize: "40px",
              boxShadow: "0 0 15px rgba(76, 175, 80, 0.5)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              background: "rgba(0, 0, 0, 0)",
            },
          }}
        />
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}
