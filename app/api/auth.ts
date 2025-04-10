// src/api/authService.ts
import { SERVER_URL } from '@/lib/constants';
import { WalletContextState } from '@solana/wallet-adapter-react';
import axios from 'axios';
import bs58 from 'bs58';

interface LoginPayload {
  signature: string;
  walletAddress: string;
  message: string;
}

interface AuthResponse {
  token: string;
}

export interface TokenPayload {
  wallet: string;
  exp: number;
  iat: number;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auth = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>(SERVER_URL + '/login', payload);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Authentication failed: ${error.response?.data || error.message}`);
      }
      throw error;
    }
  },

  async signMessage(wallet: WalletContextState, message: string): Promise<{ signature: string; message: string }> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await wallet.signMessage!(encodedMessage);
    const signatureBase58 = bs58.encode(signature);

    return {
      signature: signatureBase58,
      message,
    };
  },

  decodeToken(token: string): TokenPayload {
    try {
      const parts = token.split('.');
      return JSON.parse(atob(parts[1]));
    } catch (err) {
      console.error('Error decoding token:', err);
      throw new Error('Invalid token format');
    }
  }
};