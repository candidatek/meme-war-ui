import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

// Define the async function to fetch the mint info
const fetchMintInfo = async (mintAddress: string | null) => {
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
     if(!mintAddress) {
        console.log('no mint fount')
        return
    }
    const response = await axios.get(SERVER_URL + `/getMintInfoV2`, {
        params: { mintAddress }
    });
     return response.data.data;
};

// Custom hook to use the fetchMintInfo query
export const useMintInfo = (mintAddress: string| null) => {
    return useQuery({
        queryKey: ['mintInfo', mintAddress],
        enabled: !!mintAddress,
        queryFn: () => fetchMintInfo(mintAddress),
        staleTime: 1000 * 20, // 5 minutes
        refetchInterval: 1000 * 60 * 3, // 3 minute
        refetchIntervalInBackground: true
    });
};