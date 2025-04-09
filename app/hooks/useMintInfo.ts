import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

// Define the async function to fetch the mint info
const fetchMintInfo = async (mintAddress: string) => {
    // const heliusResponse = await fetch(SOLANA_RPC_URL, {
    //   method: 'POST',
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     "jsonrpc": "2.0",
    //     "id": "test",
    //     "method": "getAssetBatch",
    //     "params": {
    //       "ids": [mintAddress]
    //     }
    //   }),
    // });

    // const heliusData = await heliusResponse.json();
    // optimize later

    const response = await axios.get(SERVER_URL + `/getMintInfoV2`, {
        params: { mintAddress }
    });
    return response.data.data;
};

// Custom hook to use the fetchMintInfo query
export const useMintInfo = (mintAddress: string) => {
    return useQuery({
        queryKey: ['mintInfo', mintAddress],
        queryFn: () => fetchMintInfo(mintAddress),
        enabled: mintAddress !== '' && mintAddress !== undefined,
        staleTime: 1000 * 20, // 5 minutes
        refetchInterval: 1000 * 60 * 3, // 3 minute
        refetchIntervalInBackground: true,
    });
};