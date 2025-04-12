import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '../../lib/constants';

export interface ISolPrice {
  price: number;
}

const getSolPrice = async () => {
  const response = await axios.get(SERVER_URL + `/getSolPrice`);
  return response.data.data as ISolPrice;
};

export const useSolPrice = () => {
  return useQuery({
    queryKey: ['solPrice'],
    queryFn: () => getSolPrice(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
    refetchIntervalInBackground: true,
  });
};