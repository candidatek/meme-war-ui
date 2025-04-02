'use client';

import dynamic from 'next/dynamic';

import { WalletError } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';

import { Toaster } from 'sonner';
import { useCluster } from '../cluster/cluster-data-access';

// require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

//   useEffect(() => {
//     // This will only run in the browser, not during SSR
//     import('@solana/wallet-adapter-react-ui/styles.css')
//       .catch(err => console.error('Error loading wallet styles:', err));
//   }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}

        <Toaster
              position="bottom-left"
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast: 'flex items-center !bg-black-1 rounded-sm p-3 text-green-1 bg-card',
                  title: 'font-semibold pr-4',
                  description: 'text-sm ',
                  icon: 'flex items-center justify-center size-10',
                },
              }} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
