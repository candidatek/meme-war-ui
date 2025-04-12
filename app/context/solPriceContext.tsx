"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSolPrice } from '@/app/api/getSolPrice';

interface SolPriceContextType {
  solPrice: number | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<any>;
}

const SolPriceContext = createContext<SolPriceContextType | undefined>(undefined);

interface SolPriceProviderProps {
  children: ReactNode;
}

export const SolPriceProvider: React.FC<SolPriceProviderProps> = ({ children }) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useSolPrice();

  const contextValue = {
    solPrice: data?.price || null,
    isLoading,
    error,
    refetch
  };

  return (
    <SolPriceContext.Provider value={contextValue}>
      {children}
    </SolPriceContext.Provider>
  );
};

export const useSolPriceContext = (): SolPriceContextType => {
  const context = useContext(SolPriceContext);
  if (!context) {
    throw new Error('useSolPriceContext must be used within a SolPriceProvider');
  }
  return context;
};