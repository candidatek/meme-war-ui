'use client'

import { MemeCoinWars } from "@/components/meme-coin-wars"
import { Suspense } from 'react'
import { Analytics } from "@/components/Analytics"

export default function Home() {
 

  return (
    <div className="flex-1">
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
      <MemeCoinWars />
    </div>
  )
}

