import axios from 'axios';

import { SERVER_URL } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

const getHomePageDetails = async () => {
  const response = await axios.get(SERVER_URL + `/getHomePageDetails`);
  return response.data.data;
};

const getWarDetails = async (sortBy: string, filterBy: string, limit: number, offset: number) => {
  const response = await axios.get(SERVER_URL + `/getWarDetails`, {
    params: {
      sortBy,
      filterBy,
      limit,
      offset,
    }
  });
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

export const useGetWarDetails = (sortBy: string, filterBy: string, limit: number, offset: number) => {
  return useQuery({
    queryKey: ['getWarDetails', sortBy, filterBy, limit, offset],
    queryFn: () => getWarDetails(sortBy, filterBy, limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: false,
  });
};