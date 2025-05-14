'use client'

import { MemeCoinWars } from "@/components/meme-coin-wars"
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import ReactGA from 'react-ga4'

export default function Home() {
  console.log('Home is loading for GA');

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GA_MEASUREMENT_ID = "G-P2ZFKY4WCV"

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      ReactGA.initialize(GA_MEASUREMENT_ID)
      
      ReactGA.send({ hitType: "pageview", page: pathname + searchParams.toString() })
      
    }
  }, [pathname, searchParams])

  return (
    <div className="flex-1">
      <MemeCoinWars />
    </div>
  )
}

