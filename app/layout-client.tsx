"use client"

import { Header } from "@/components/header"
import { LiveFeedCarousel } from "@/components/live-feed-carousel"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { MemeWarProvider } from "./context/memeWarStateContext"
import { SolanaProvider } from "@/components/solana/solana-provider"
import { ClusterProvider } from "@/components/cluster/cluster-data-access"
import { ReactQueryProvider } from "./react-query-provider"
import { SolPriceProvider } from "./context/solPriceContext"

// Can be set to 'devnet', 'testnet', or 'mainnet-beta'
const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const wallets = [new PhantomWalletAdapter()]

export function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryProvider>
      <ClusterProvider>
        <SolanaProvider>
          <MemeWarProvider>
            <SolPriceProvider>
              <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      {/* <LiveFeedCarousel /> */}
                      <main className="flex-1">
                        <div className="min-h-screen bg-background/95 backdrop-blur-sm">
                          {children}
                        </div>
                      </main>
                    </div>
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </SolPriceProvider>
          </MemeWarProvider>
        </SolanaProvider>
      </ClusterProvider>
    </ReactQueryProvider>
  )
} 