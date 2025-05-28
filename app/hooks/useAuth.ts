"use client";
// src/hooks/useAuth.ts
import {
  useEffect,
  useState,
} from 'react';

import {
  auth,
  TokenPayload,
} from '@/app/api/auth';
import {
  useWallet,
  WalletContextState,
} from '@solana/wallet-adapter-react';

interface AuthState {
  token: string | null;
  decodedToken: TokenPayload | null;
  lastSignature: string | null;
  lastMessage: string | null;
  connectionStatus: string;
  lastError: string | null;
}

export const useAuth = () => {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    decodedToken: null,
    lastSignature: null,
    lastMessage: null,
    connectionStatus: 'disconnected',
    lastError: null,
  });

  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      connectionStatus: wallet.connected ? 'connected' : 'disconnected'
    }));

    const existingToken = localStorage.getItem('jwt_token');
    if (existingToken) {
      try {
        const decodedToken = auth.decodeToken(existingToken);
        setAuthState(prev => ({
          ...prev,
          token: existingToken,
          decodedToken
        }));
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, [wallet.connected]);

  const signInWithSolana = async (wallet: WalletContextState): Promise<string> => {
    const message = `Sign in to the dApp: ${new Date().toISOString()}`;

    const { signature, message: signedMessage } = await auth.signMessage(wallet, message);

    setAuthState(prev => ({
      ...prev,
      lastSignature: signature,
      lastMessage: signedMessage
    }));

    const { token } = await auth.login({
      signature,
      walletAddress: wallet.publicKey!.toBase58(),
      message: signedMessage,
    });

    localStorage.setItem('jwt_token', token);

    const decodedToken = auth.decodeToken(token);
    setAuthState(prev => ({
      ...prev,
      token,
      decodedToken
    }));

    return token;
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!wallet.connected) {
        throw new Error('Please connect your wallet first');
      }

      const existingToken = localStorage.getItem('jwt_token');
      if (existingToken) {
        console.log("Token already exists: Returning");
        return;
      }

      await signInWithSolana(wallet);
      console.log('Authentication successful');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('jwt_token');
    setAuthState({
      token: null,
      decodedToken: null,
      lastSignature: null,
      lastMessage: null,
      connectionStatus: wallet.connected ? 'connected' : 'disconnected',
      lastError: null,
    });
  };

  return {
    authState,
    isLoading,
    error,
    handleSignIn,
    handleSignOut,
    wallet
  };
};