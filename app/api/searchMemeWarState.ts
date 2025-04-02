import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

// Define the async function to fetch the mint info
const searchMemeWarState = async (searchInput1: string, searchInput2: string | undefined) => {
  const response = await axios.get(SERVER_URL + `/searchMemeWar`, {
    params: { searchInput1, searchInput2 }
  });
  return response.data.data;
};

// Custom hook to use the fetchMintInfo query
export const useSearchMemeWarState = (searchInput1: string, searchInput2: string | undefined, enableSearch: boolean) => {
  return useQuery({
    queryKey: ['searchMemeWar', searchInput1, searchInput2],
    queryFn: () => searchMemeWarState(searchInput1, searchInput2),
    enabled: (!!searchInput1 || !!searchInput2) && enableSearch,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: true,
  }
  );
};