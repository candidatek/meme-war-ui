import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/lib/constants";

export interface IMemeWarState {
  mint_a_sol_ratio: string;
  mint_b_sol_ratio: string;
  mint_a_decimals: number;
  mint_b_decimals: number;
  mint_a_deposit: string;
  mint_b_withdrawn: string;
  mint_a_withdrawn: string;
  mint_b_deposit: string;
  mint_a_risk_free_deposit: string;
  mint_b_risk_free_deposit: string;
  mint_a_penalty: string;
  mint_b_penalty: string;
  start_time: string;
  risk_free_sol: string;
  end_time: string;
  meme_war_registry: string;
  meme_war_state: string;
  mint_a_image: string;
  mint_b_image: string;
  mint_a_name: string;
  mint_b_name: string;
  mint_a_symbol: string;
  mint_b_symbol: string;
  mint_a: string;
  mint_b: string;
  war_ended: boolean;
  winner_declared: string;
  mint_a_total_deposited: string;
  mint_b_total_deposited: string;
  mint_a_price: string;
  mint_b_price: string;
  mint_a_supply: string;
  mint_a_volume: string;
  mint_a_price_change: string;
  mint_a_holders: string;
  mint_a_depositors: string;
  mint_a_description: string;
  mint_b_supply: string;
  mint_b_volume: string;
  mint_b_price_change: string;
  mint_b_holders: string;
  mint_b_depositors: string;
  mint_b_description: string;
  tx_count?: number;
  reply_count?: number;
  is_verified: boolean;
}
// Define the async function to fetch the mint info
const getMemeWarStateInfo = async (mintAddress: string | null) => {
  const response = await axios.get(SERVER_URL + `/getMemeWarState`, {
    params: { mintAddress },
  });
  return response.data.data as IMemeWarState;
};

// Custom hook to use the fetchMintInfo query
export const useMemeWarStateInfo = (memeWarState: string | null) => {
  return useQuery({
    queryKey: ["memeWarState", memeWarState],
    queryFn: () => getMemeWarStateInfo(memeWarState),
    enabled:
      memeWarState !== "" || !!memeWarState || memeWarState !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 3 minute
    refetchIntervalInBackground: true,
  });
};
