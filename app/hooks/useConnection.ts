import { Connection } from "@solana/web3.js";
import { useState, useEffect } from "react";

const useConnection = () => {
  const [connection, setConnection] = useState<Connection>(
    new Connection("https://api.devnet.solana.com")
  );

  useEffect(() => {
    const con = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_CLUSTER_URL || "",
      "confirmed"
    );
    setConnection(con);
  }, []);

  return connection;
};

export default useConnection;
