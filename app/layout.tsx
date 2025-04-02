import { LayoutClient } from "./layout-client"
import "./globals.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Meme Coin Wars",
  description: "Watch and participate in epic battles between meme coins!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-[url('/images/grid-bg.png')] bg-repeat`}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  )
}

