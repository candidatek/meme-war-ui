"use client";

import React, { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { usePathname, useSearchParams } from "next/navigation";
import { getRouteChangeState } from "@/app/hooks/useRouteProgress";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  useEffect(() => {
    setIsChangingRoute(true);
    const timeout = setTimeout(() => {
      setIsChangingRoute(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    const checkRouteState = () => {
      setIsChangingRoute(getRouteChangeState());
    };

    const intervalId = setInterval(checkRouteState, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <NextTopLoader
        color="hsl(135, 94%, 39%)"
        showSpinner={false}
        height={4}
        shadow="0 0 10px hsl(135, 94%, 39%), 0 0 5px hsl(135, 94%, 39%)"
        zIndex={1500}
        easing="ease"
        speed={200}
      />

      {isChangingRoute && (
        <div
          className="bar-of-progress"
          style={{
            width: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            height: "4px",
            zIndex: 1500,
            background: "hsl(135, 94%, 39%)",
            transition: "width 300ms ease",
          }}
        />
      )}
    </>
  );
}
