"use client";
import useWalletInfo from '@/app/hooks/useWalletInfo';
import { getProgramDerivedAddressForPair } from '@/lib/utils';
import { PublicKey } from '@solana/web3.js';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the context type, allowing `null` for initial values
interface MemeWarContextType {
  memeWarState: string | null;
  setMemeWarState: (value: string | null) => void;
  userState: string | null;
  setUserState: (value: string | null) => void;
  setMintA: (value: string | null) => void;
  setMintB: (value: string | null) => void;
  mintA: string | null;
  mintB: string | null;
}

// Create the context with an initial `undefined` value
const MemeWarContext = createContext<MemeWarContextType | undefined>(undefined);

// Provider component
interface MemeWarProviderProps {
  children: ReactNode;
}

export const MemeWarProvider: React.FC<MemeWarProviderProps> = ({ children }) => {
  const [memeWarState, setMemeWarState] = useState<string | null>(null);
  const [mintA, setMintA] = useState<string | null>(null);
  const [mintB, setMintB] = useState<string | null>(null);
  const [userState, setUserState] = useState<string | null>(null);
  const { publicKey } = useWalletInfo()
  
  useEffect(() => {
    const getMemeWarState = async () => {
      if (memeWarState && publicKey) {
        const userState = await getProgramDerivedAddressForPair(new PublicKey(memeWarState), publicKey);
        setUserState(userState.toString());
      }
    }
    getMemeWarState()

    return () => {
      setUserState(null)
    }
  }, [memeWarState, publicKey])

  return (
    <MemeWarContext.Provider value={{
      memeWarState, setMemeWarState, userState, setUserState
      , mintA, setMintA, mintB, setMintB
    }}>
      {children}
    </MemeWarContext.Provider>
  );
};

// Custom hook for using the context
export const useMemeWarContext = (): MemeWarContextType => {
  const context = useContext(MemeWarContext);
  if (!context) {
    throw new Error('useMemeWarContext must be used within a MemeWarProvider');
  }
  return context;
};