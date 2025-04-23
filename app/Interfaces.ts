import { PublicKey } from "@solana/web3.js";
import { IMemeWarState } from "./api/getMemeWarStateInfo";

export interface TokenData {
  ticker: string;
  name: string;
  marketCap: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  holders: number;
  totalSupply: number;
  amountPledged: number;
  pledgers: number;
  emoji: string;
  description: string;
  socialLinks: {
    twitter: string;
    telegram: string;
    website: string;
  };
  image?: string;
  address: string;
}

// export interface for war data
export interface WarData {
  coin1: TokenData;
  coin2: TokenData;
  totalPledged: number;
  timeLeft: string;
  recentPledges: any[]; // Could be further typed if we know the structure
  reply_count: number;
}

// export interface for trade data
export interface TradeData {
  event_type: string;
  mint: string;
  amount: string;
  amount_in_sol?: string;
  wallet_address: string;
  event_time: number;
  tx_signature?: string;
}

// export interface for chat message
export interface ChatMessage {
  id?: string;
  sender: string;
  message: string;
  sender_time: string;
  meme_war_state?: string;
}

// export interface for user state
export interface UserState {
  mint_a_deposit: string;
  mint_b_deposit: string;
  mint_a_risk_free_deposit: string;
  mint_b_risk_free_deposit: string;
  mint_a_withdrawn: string;
  mint_b_withdrawn: string;
  mint_a_penalty: string;
  mint_b_penalty: string;
}

// export interface for meme war state info
export interface MemeWarStateInfo {
  mint_a: string;
  mint_b: string;
  mint_a_decimals: number;
  mint_b_decimals: number;
  mint_a_total_deposited: string;
  mint_b_total_deposited: string;
  mint_a_symbol: string;
  mint_b_symbol: string;
  mint_a_name: string;
  mint_b_name: string;
  mint_a_price: number;
  mint_b_price: number;
  mint_a_price_change: number;
  mint_b_price_change: number;
  mint_a_volume: number;
  mint_b_volume: number;
  mint_a_holders: number;
  mint_b_holders: number;
  mint_a_supply: string;
  mint_b_supply: string;
  mint_a_depositors: number;
  mint_b_depositors: number;
  mint_a_description: string;
  mint_b_description: string;
  mint_a_image?: string;
  mint_b_image?: string;
  end_time: number;
  war_ended: boolean;
  winner_declared?: string;
}

// Interface for the token card props
export interface TokenCardProps {
  memeWarStateInfo: IMemeWarState | undefined;
  token: TokenData;
  totalPledged: number;
  handleDeposit: () => void;
  handleWithdraw: () => void;
  pledgeAmount: string;
  setPledgeAmount: (amount: string) => void;
  tokenBalance: number;
  btnLoading: boolean;
  userState: UserState | null | undefined;
  index: 0 | 1;
  publicKey: PublicKey | null;
  isWarEnded: boolean | undefined;
  disablePledgeBtn?: boolean;
  disableUnpledgeBtn: boolean;
}

// Interface for the stat component props
export interface StatProps {
  label: string;
  value: string;
}
