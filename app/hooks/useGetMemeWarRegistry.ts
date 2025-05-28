import axios from 'axios';

import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

import {
  getProgramDerivedAddressForPair,
  sortTokensAddresses,
  validateSolanaAddress,
} from '../utils';

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface IMemeWarRegistryExists {
  meme_war_state: string;
  war_ended: boolean;
  pool_index: number;
  end_time: string;
}


const getMemeWarRegistry = async (token1: string, token2: string) => {
  const sortedTokens = sortTokensAddresses(token1, token2);
  const memeWarRegistry = getProgramDerivedAddressForPair(new PublicKey(sortedTokens[0]), new PublicKey(sortedTokens[1]));

  const { data } = await axios.get(SERVER_URL + `/getMemeWarRegistry`, {
    params: { memeWarRegistry }
  });

  return data.data as IMemeWarRegistryExists;
};

export const useGetMemeWarRegistry = (token1: string, token2: string) => {
  return useQuery({
    queryKey: ['memeWarRegistry', token1, token2],
    queryFn: () => getMemeWarRegistry(token1, token2),
    enabled: validateSolanaAddress(token1) && validateSolanaAddress(token2),
    staleTime: 1000 * 60 * 2, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // 3 minute
    refetchIntervalInBackground: true,
  }

  );
};