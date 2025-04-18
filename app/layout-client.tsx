"use client";

import { Header } from "@/components/header";
import { LiveFeedCarousel } from "@/components/live-feed-carousel";
import { SolanaProvider } from "@/components/solana/solana-provider";
import { ClusterProvider } from "@/components/cluster/cluster-data-access";
import { ReactQueryProvider } from "./react-query-provider";
import { MemeWarProvider } from "./context/memeWarStateContext";
import { SolPriceProvider } from "./context/solPriceContext";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ClusterProvider>
        <SolanaProvider>
          <MemeWarProvider>
            <SolPriceProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <LiveFeedCarousel />
                <main className="flex-1">
                  <div className="min-h-screen bg-background/95 backdrop-blur-sm">
                    {children}
                  </div>
                </main>
              </div>
            </SolPriceProvider>
          </MemeWarProvider>
        </SolanaProvider>
      </ClusterProvider>
    </ReactQueryProvider>
  );
}
