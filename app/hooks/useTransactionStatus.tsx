import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { type TransactionSignature } from "@solana/web3.js";
import { showErrorToast } from "@/components/toast-utils";
import useConnection from "./useConnection";

type TransactionDetails = {
  signature: TransactionSignature;
  action: string;
  setIsLoading: Dispatch<SetStateAction<boolean | number>>;
  refresh?: () => void;
  stopLoadingWithInteger?: boolean;
};

export const useTransactionStatus = () => {
  const connection = useConnection();

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
          "confirmed"
        );

        if (!res.value.err) {
          setIsLoading(false);
          const toastElement = (
            <div>
              <div>{action}</div>
              {/* TODO: Add link to transaction explorer */}
              {/* <a href={`https://solscan.io/tx/${signature}`}>Txn link</a> */}
            </div>
          );
          toast.dismiss();
          toast.success(toastElement);

          // Invalidate token balance queries to fetch the latest balances
          if (txDetails.refresh) {
            txDetails.refresh();
          }
        } else {
          setIsLoading(false);
          showErrorToast("Transaction error: " + res.value.err.toString());
        }
      } catch (err) {
        setIsLoading(txDetails.stopLoadingWithInteger ? -1 : false);
        showErrorToast("Failed to confirm transaction: " + err);
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

    toast(<div>Confirming Transaction</div>, {
      dismissible: false,
      duration: 2000,
      id: "transaction-confirmation",
    });

    setTxDetails(transactionDetails);
    return transactionDetails.signature;
  };

  return { checkStatus };
};
