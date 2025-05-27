import { Connection } from "@solana/web3.js";

const useConnection = () => {
    return new Connection(process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL || "", "confirmed")
};

export default useConnection;
