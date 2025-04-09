import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';
import { validateSolanaAddress } from '@/lib/utils';

const getUserProfile = async (userProfile: string | null) => {
  const response = await axios.get(SERVER_URL + `/getUserProfile`, {
    params: { userProfile  }
  });
  return response.data.data;
};

// Custom hook to use the fetchMintInfo query
export const useGetUserProfile = (userProfile: string | null) => {
  const query = useQuery({
    queryKey: ['userProfile', userProfile],
    queryFn: () => getUserProfile(userProfile),
    enabled: validateSolanaAddress(userProfile ?? ''),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
    refetchIntervalInBackground: true,
  });

  // Extract the `refetch` method from the query object
  const refresh = query.refetch;

  return {
    ...query,
    refresh, // Add the refresh function to the return object
  };
};