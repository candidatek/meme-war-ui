import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';
// Define the async function to fetch the mint info
const getRecentTrades = async (memeWarState: string | undefined) => {
  const response = await axios.get(SERVER_URL + `/getTrades`, {
    params: { memeWarState }
  });
  return response.data.data;
};

// Custom hook to use the fetchMintInfo query
export const useRecentTrades = (memeWarState: string | undefined) => {
  return useQuery({
    queryKey: ['trades', memeWarState],
    queryFn: () => getRecentTrades(memeWarState),
    enabled: memeWarState !== '' || !!memeWarState,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: true,
  }

  );
};