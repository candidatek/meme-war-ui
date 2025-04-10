import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '../../lib/constants';

export interface IUserState {
  user_state: string;
  mint_a_deposit: string;
  mint_b_deposit: string;
  mint_a_withdrawn: string;
  mint_b_withdrawn: string;
  mint_a_penalty: string;
  mint_b_penalty: string;
  mint_a_risk_free_deposit: string;
  mint_b_risk_free_deposit: string;
  reward_distributed: boolean;
  reward_distributed_amount: string;
  risk_free_distributed: boolean;
  meme_war_state: string;
  meme_war_registry: string | null;
  wallet_address: string;
}
// Define the async function to fetch the mint info
const getUserStateInfo = async (userState: string| null) => {
  if(!userState) {
    return null;
  }
  const response = await axios.get(SERVER_URL + `/getUserState`, {
    params: { userState: userState }
  });
  return response.data.data as IUserState;
};

// Custom hook to use the fetchMintInfo query
export const useGetUserStateInfo = (userState: string | null, memeWarState: string| null) => {
  return useQuery({
    queryKey: ['userState', userState, memeWarState],
    queryFn: () => getUserStateInfo(userState),
    enabled: userState !== '' || !!userState  || memeWarState !== '' || !!memeWarState || userState !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 3 minute
    refetchIntervalInBackground: true,
  }
  );
};
