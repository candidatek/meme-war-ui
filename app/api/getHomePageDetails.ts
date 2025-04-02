import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

const getHomePageDetails = async () => {
  const response = await axios.get(SERVER_URL + `/getHomePageDetails`);
  return response.data.data;
};


export const useGetHomePageDetails = () => {
  return useQuery({
    queryKey: ['getHomePageDetails'],
    queryFn: () => getHomePageDetails(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: false,
  }

  );
};