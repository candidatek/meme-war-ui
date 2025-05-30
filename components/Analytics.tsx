import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import ReactGA from 'react-ga4'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const GA_MEASUREMENT_ID = "G-P2ZFKY4WCV"
    
    if (GA_MEASUREMENT_ID) {
      ReactGA.initialize(GA_MEASUREMENT_ID)
      
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      ReactGA.send({ hitType: "pageview", page: url })
    }
  }, [pathname, searchParams])
  
  return null
}