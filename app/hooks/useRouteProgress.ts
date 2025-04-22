"use client";

import { useCallback } from "react";

const listeners: Set<() => void> = new Set();

let isRouteChanging = false;

export const useRouteProgress = () => {
  const startProgress = useCallback(() => {
    isRouteChanging = true;
    listeners.forEach((listener) => listener());

    setTimeout(() => {
      isRouteChanging = false;
      listeners.forEach((listener) => listener());
    }, 500);
  }, []);

  const endProgress = useCallback(() => {
    isRouteChanging = false;
    listeners.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    startProgress,
    endProgress,
    subscribe,
    isRouteChanging,
  };
};

export const getRouteChangeState = () => isRouteChanging;
