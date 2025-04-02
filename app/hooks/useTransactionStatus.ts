import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { toast } from 'sonner';

import { useConnection } from '@solana/wallet-adapter-react';
import { type TransactionSignature } from '@solana/web3.js';

type TransactionDetails = {
  signature: TransactionSignature;
  action: string;
  setIsLoading: Dispatch<SetStateAction<any>>; 
  refresh?: () => void;
  stopLoadingWithInteger?: boolean;
};

export const useTransactionStatus = () => {
  const { connection } = useConnection();

  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);

  useEffect(() => {
    const checkTransactionStatus = async () => {
      if (!txDetails) return;

      const { signature, action, setIsLoading } = txDetails;
      try {
        const latestBlockhash = await connection.getLatestBlockhash();
        const res = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );

        if (!res.value.err) {
          setIsLoading(false);
          const toastMessage = action

          // Show success toast
          toast.dismiss();
          toast.success(toastMessage);

          // Invalidate token balance queries to fetch the latest balances
          if(txDetails.refresh) {
            txDetails.refresh();
          } 
        } else {
          setIsLoading(false);
          toast.error('Transaction error: ' + res.value.err.toString());
        }
      } catch (err) {
        setIsLoading(txDetails.stopLoadingWithInteger ? -1 : false);
        toast.error('Failed to confirm transaction: ' + err);
      } finally {
        setIsLoading(txDetails.stopLoadingWithInteger ? -1 : false);
          setTxDetails(null);
      }
    };

    if (txDetails) {
      checkTransactionStatus();
    }
  }, [txDetails, connection]);

  const checkStatus = (transactionDetails: TransactionDetails) => {

    toast.dismiss();
    
    toast(
      <div>Confirming Transaction</div>,
      { dismissible: false, duration: Infinity }
    );

    setTxDetails(transactionDetails);
    return transactionDetails.signature;
  };

  return { checkStatus };
};