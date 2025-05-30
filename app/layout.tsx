import { LayoutClient } from "./layout-client";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import { ReactQueryProvider } from "./react-query-provider";
import { MemeWarProvider } from "./context/memeWarStateContext";
import { SolanaProvider } from "@/components/solana/solana-provider";
import { ClusterProvider } from "@/components/cluster/cluster-data-access";
import { SocketProvider } from "./context/socketContext";
import { ProgressBar } from "@/components/ui/progress-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meme Coin Wars",
  description: "Watch and participate in epic battles between meme coins!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-[url('/images/grid-bg.png')] bg-repeat`}>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <MemeWarProvider>
                <SocketProvider>
                  <LayoutClient>{children}</LayoutClient>
                </SocketProvider>
              </MemeWarProvider>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
