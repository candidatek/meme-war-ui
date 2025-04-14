import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

const useWalletInfo = () => {
  const { wallet, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const publicKey = useMemo(
    () => wallet?.adapter?.publicKey ?? null,
    [wallet?.adapter?.publicKey]
  );
  const isConnected = useMemo(() => !!publicKey, [publicKey]);
  const pubKey = useMemo(
    () => (publicKey ? publicKey?.toBase58() : null),
    [publicKey]
  );
  const formattedPublicKey = useMemo(
    () =>
      pubKey ? pubKey.substring(0, 4) + "..." + pubKey.substring(40) : null,
    [pubKey]
  );

  const { data: solBalance } = useQuery({
    queryKey: ["solBalance", pubKey],
    queryFn: async () => {
      if (!publicKey || !connection) return null;
      const balance = await connection.getBalance(publicKey);
      return balance / 10 ** 9;
    },
    // Only run query if we have both publicKey and connection
    enabled: !!publicKey && !!connection,
    // Refresh every 30 seconds
    refetchInterval: 30000,
    retry: 3,
    // Start with null as initial data
    initialData: null,
  });

  return {
    publicKey,
    isConnected,
    sendTransaction,
    formattedPublicKey,
    solBalance,
    pubKey,
  };
};

export default useWalletInfo;
