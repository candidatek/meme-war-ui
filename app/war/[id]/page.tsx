"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber, formatWalletAddress, validateSolanaAddress, showErrorToast } from "@/lib/utils"
import Link from 'next/link'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Megaphone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useParams } from 'next/navigation'
import { useMemeWarContext } from '@/app/context/memeWarStateContext'
import { useMemeWarStateInfo } from '@/app/api/getMemeWarStateInfo'
import { useGetUserStateInfo } from '@/app/api/getUserState'
import { useRecentTrades } from '@/app/api/getRecentTrades'
import useWalletInfo from '@/app/hooks/useWalletInfo'
import { useTokenBalance } from '@/app/hooks/useUserBalance'
import useDepositTokens from '@/app/hooks/useDeposit'
import useWithdrawTokens from '@/app/hooks/useWithdraw'
import useCountdown from '@/app/hooks/useCountdown'
import { useGetChatMessages } from '@/app/api/getChatMessages'
import { useSendChatMessage } from '@/app/api/sendChatMessage'
import { useAuth } from '@/app/hooks/useAuth'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { io, Socket } from "socket.io-client"

const REFRESH_DELAY = 5000;

// Interface for token data
interface TokenData {
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
}

// Interface for war data
interface WarData {
  coin1: TokenData;
  coin2: TokenData;
  totalPledged: number;
  timeLeft: string;
  recentPledges: any[]; // Could be further typed if we know the structure
}

// Interface for trade data
interface TradeData {
  mint: string;
  amount: string;
  wallet_address: string;
  event_time: number;
}

// Interface for chat message
interface ChatMessage {
  id?: string;
  sender: string;
  message: string;
  sender_time: string;
  meme_war_state?: string;
}

// Interface for user state
interface UserState {
  mint_a_deposit: string;
  mint_b_deposit: string;
  mint_a_risk_free_deposit: string;
  mint_b_risk_free_deposit: string;
  mint_a_withdrawn: string;
  mint_b_withdrawn: string;
  mint_a_penalty: string;
  mint_b_penalty: string;
}

// Interface for meme war state info
interface MemeWarStateInfo {
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
interface TokenCardProps {
  token: TokenData;
  totalPledged: number;
  handleDeposit: () => void;
  handleWithdraw: () => void;
  pledgeAmount: string;
  setPledgeAmount: (amount: string) => void;
  tokenBalance: number;
  btnLoading: boolean;
  userState: UserState | null | undefined;
  formatDeposit: (amount: string | undefined, index: number) => number;
  index: 0 | 1;
  publicKey: PublicKey | null;
  isWarEnded: boolean | undefined;
  disablePledgeBtn?: boolean;
  disableUnpledgeBtn: boolean;
}

// Interface for the stat component props
interface StatProps {
  label: string;
  value: string;
}

export default function WarPage() {
  // Get params and context
  const params = useParams();
  const { memeWarState, mintA, mintB, userState, setMemeWarState, setMintA, setMintB } = useMemeWarContext();

  // Set memeWarState from URL parameters
  useEffect(() => {
    console.log("Params:", params);
    if (params?.id) {
      setMemeWarState(params.id as string);
    }
  }, [params, setMemeWarState]);

  // Get meme war state data
  const { data: memeWarStateInfo, error, isLoading } = useMemeWarStateInfo(memeWarState);

  // Initialize deposit/withdraw hooks
  const { depositTokens } = useDepositTokens(mintA, mintB);
  const { withdrawTokens } = useWithdrawTokens(mintA, mintB);

  // Get token balances
  const { data: tokenBalanceData, refreshTokenBalance } = useTokenBalance(mintA, mintB);
  const tokenBalanceMintA = useMemo(() => Number(tokenBalanceData?.[0] ?? 0), [tokenBalanceData]);
  const tokenBalanceMintB = useMemo(() => Number(tokenBalanceData?.[1] ?? 0), [tokenBalanceData]);

  // User state data
  const { data: userStateInfo } = useGetUserStateInfo(userState, memeWarState);

  // Recent trades data
  const { data: tradesData } = useRecentTrades(memeWarState);

  // Chat messages data
  const { data: chatMessages, refresh: refreshChat } = useGetChatMessages(memeWarState!);
  const { mutate: sendMessage, status: sendStatus } = useSendChatMessage(refreshChat);

  // Get wallet info
  const { publicKey, pubKey } = useWalletInfo();
  const { authState, handleSignIn } = useAuth();
  const wallet = useWallet();

  // Loading state
  const [btnLoading, setBtnLoading] = useState<boolean | number>(-1);

  // Input states
  const [leftInput, setLeftInput] = useState<string>('1');
  const [rightInput, setRightInput] = useState<string>('1');
  const [newMessage, setNewMessage] = useState<string>('');

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[] | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // War countdown
  const { timeLeft, endedTimeAgo } = useCountdown(memeWarStateInfo?.end_time);

  // Set mint addresses when war state info is loaded
  useEffect(() => {
    if (memeWarStateInfo) {
      setMintA(memeWarStateInfo.mint_a);
      setMintB(memeWarStateInfo.mint_b);
    }
  }, [memeWarStateInfo, setMintA, setMintB]);

  useEffect(() => {
    if (!memeWarState) return;
  
    const socket: Socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
    let animationTimeoutId: NodeJS.Timeout;
  
    socket.on("connect", () => {
      socket.emit("subscribeToGame", "game-" + memeWarState);
    });
  
    socket.on("chatUpdate", (message: ChatMessage) => {
      setLastMessageId(message.id!);
      console.log("Received details from WebSocket:", message);
  
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
      }
      
      // Set timeout to clear the animation
      animationTimeoutId = setTimeout(() => {
        setLastMessageId(null);
      }, 1000);
  
      setDisplayMessages((prevMessages) => {
        const updatedMessages = [...(prevMessages || []), message];
        
        // Sort by descending time
        return updatedMessages.sort((a, b) => 
          new Date(b.sender_time).getTime() - new Date(a.sender_time).getTime()
        );
      });
    });
  
    return () => {
      socket.disconnect();
    };
  }, [memeWarState]);

  useEffect(() => {
    if (chatMessages) {
      const sortedMessages = [...chatMessages].sort((a, b) => 
        new Date(b.sender_time).getTime() - new Date(a.sender_time).getTime()
      );
      setDisplayMessages(sortedMessages);
    }
  }, [chatMessages]);

  // Handle deposit for a token
  const handleDeposit = async (mintIdentifier: 0 | 1, amount: string) => {
    try {
      setBtnLoading(mintIdentifier);
      const mintDecimal = mintIdentifier === 0 ? memeWarStateInfo?.mint_a_decimals : memeWarStateInfo?.mint_b_decimals;
      await depositTokens(parseFloat(amount), mintIdentifier, setBtnLoading, refreshTokenBalance, mintDecimal ?? 9);
    }
    catch (e) {
      showErrorToast('Failed to Deposit Tokens');
      setBtnLoading(-1);
    }
  };

  // Handle withdraw for a token
  const handleWithdraw = useCallback(async (index: 0 | 1) => {
    try {
      setBtnLoading(index);
      await withdrawTokens(index, setBtnLoading, refreshTokenBalance);
    }
    catch (e) {
      showErrorToast('Failed to Withdraw Tokens');
      setBtnLoading(-1);
    }
  }, [withdrawTokens, refreshTokenBalance]);

  // Auto refresh on invalid state
  useEffect(() => {
    const memeWarStateParam = params.memeWarState;

    if (!memeWarStateParam || !validateSolanaAddress(typeof memeWarStateParam === 'string' ? memeWarStateParam : '')) {
      return;
    }

    if (!memeWarStateInfo) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, REFRESH_DELAY);
      return () => clearTimeout(timer);
    }
  }, [memeWarStateInfo, params.memeWarState]);

  // Handle chat message sending
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!authState.token && wallet.connected) {
      await handleSignIn();
    }

    sendMessage({ pubKey: pubKey!, newMessage, memeWarState: memeWarState! });
    setNewMessage('');
  };

  // Handle Enter key for sending message
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSendMessage();
    }
  };

  // Calculate percentages and amounts for display
  const totalPledged = useMemo(() => {
    if (!memeWarStateInfo) return 0;

    const mintADeposited = Number(memeWarStateInfo.mint_a_total_deposited) / 10 ** (memeWarStateInfo.mint_a_decimals || 9);
    const mintBDeposited = Number(memeWarStateInfo.mint_b_total_deposited) / 10 ** (memeWarStateInfo.mint_b_decimals || 9);

    return mintADeposited + mintBDeposited;
  }, [memeWarStateInfo]);

  const mintAPercentage = useMemo(() => {
    if (!memeWarStateInfo || totalPledged === 0) return 0;

    const mintADeposited = Number(memeWarStateInfo.mint_a_total_deposited) / 10 ** (memeWarStateInfo.mint_a_decimals || 9);
    return (mintADeposited / totalPledged) * 100;
  }, [memeWarStateInfo, totalPledged]);

  const mintBPercentage = useMemo(() => {
    return 100 - mintAPercentage;
  }, [mintAPercentage]);

  // Convert blockchain data to UI-friendly format
  const warData = useMemo(() => {
    if (!memeWarStateInfo) {
      return null;
    }

    const mintADeposited = Number(memeWarStateInfo.mint_a_total_deposited) / 10 ** (memeWarStateInfo.mint_a_decimals || 9);
    const mintBDeposited = Number(memeWarStateInfo.mint_b_total_deposited) / 10 ** (memeWarStateInfo.mint_b_decimals || 9);
    const mintAPrice = Number(memeWarStateInfo.mint_a_price || 0);
    const mintBPrice = Number(memeWarStateInfo.mint_b_price || 0);

    return {
      coin1: {
        ticker: memeWarStateInfo.mint_a_symbol || 'TOKEN_A',
        name: memeWarStateInfo.mint_a_name || 'Token A',
        marketCap: mintAPrice * Number(memeWarStateInfo.mint_a_supply || 0),
        price: mintAPrice,
        priceChange24h: Number(memeWarStateInfo.mint_a_price_change || 0),
        volume24h: Number(memeWarStateInfo.mint_a_volume || 0),
        holders: Number(memeWarStateInfo.mint_a_holders || 0),
        totalSupply: Number(memeWarStateInfo.mint_a_supply || 0),
        amountPledged: mintADeposited,
        pledgers: memeWarStateInfo.mint_a_depositors || 0,
        emoji: "🪙",
        description: memeWarStateInfo.mint_a_description || "Token A description",
        socialLinks: {
          twitter: "#",
          telegram: "#",
          website: "#"
        },
        image: memeWarStateInfo.mint_a_image
      },
      coin2: {
        ticker: memeWarStateInfo.mint_b_symbol || 'TOKEN_B',
        name: memeWarStateInfo.mint_b_name || 'Token B',
        marketCap: mintBPrice * Number(memeWarStateInfo.mint_b_supply || 0),
        price: mintBPrice,
        priceChange24h: Number(memeWarStateInfo.mint_b_price_change || 0),
        volume24h: Number(memeWarStateInfo.mint_b_volume || 0),
        holders: Number(memeWarStateInfo.mint_b_holders || 0),
        totalSupply: Number(memeWarStateInfo.mint_b_supply || 0),
        amountPledged: mintBDeposited,
        pledgers: memeWarStateInfo.mint_b_depositors || 0,
        emoji: "🪙",
        description: memeWarStateInfo.mint_b_description || "Token B description",
        socialLinks: {
          twitter: "#",
          telegram: "#",
          website: "#"
        },
        image: memeWarStateInfo.mint_b_image
      },
      totalPledged: mintADeposited + mintBDeposited,
      timeLeft: timeLeft || "00:00:00",
      recentPledges: []
    } as WarData;
  }, [memeWarStateInfo, timeLeft]);

  // Format user deposit amounts
  const formatDeposit = useCallback((amount: string | undefined, index: number): number => {
    if (!amount) return 0;
    const decimal = index === 0
      ? memeWarStateInfo?.mint_a_decimals
      : memeWarStateInfo?.mint_b_decimals;
    return Number(amount) / 10 ** (decimal || 9);
  }, [memeWarStateInfo]);

  // Return loading state if data isn't ready
  if (!warData) {
    return <div className="container mx-auto px-4 py-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* War Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {warData.coin1.ticker} vs {warData.coin2.ticker}
        </h1>
      </div>

      <div className="grid grid-cols-7 gap-6">
        {/* Left Token */}
        <div className="col-span-3">
          <TokenCard
            token={warData.coin1}
            totalPledged={warData.totalPledged}
            handleDeposit={() => handleDeposit(0, leftInput)}
            handleWithdraw={() => handleWithdraw(0)}
            pledgeAmount={leftInput}
            setPledgeAmount={setLeftInput}
            tokenBalance={tokenBalanceMintA}
            btnLoading={btnLoading === 0}
            userState={userStateInfo}
            formatDeposit={formatDeposit}
            index={0}
            publicKey={publicKey}
            isWarEnded={memeWarStateInfo?.war_ended}
            // disablePledgeBtn={
            //   Number(leftInput) > tokenBalanceMintA || 
            //   Number(leftInput) <= 0 || 
            //   btnLoading === 0 
            //   // !!memeWarStateInfo?.war_ended
            // }
            disableUnpledgeBtn={
              btnLoading === 0 ||
              !!memeWarStateInfo?.war_ended ||
              !userStateInfo?.mint_a_deposit
            }
          />
        </div>

        {/* Center VS Section */}
        <div className="col-span-1 flex flex-col items-center justify-start">
          <div className="sticky top-4 w-full">
            <div className="text-6xl font-bold mb-8 text-center">VS</div>

            {/* Coin Ratio */}
            <div className="mb-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Price Ratio</div>
              <div className="font-mono text-lg">
                1 : {(warData.coin2.price / warData.coin1.price || 0).toFixed(8)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {warData.coin1.ticker} : {warData.coin2.ticker}
              </div>
            </div>

            {/* War Share Bar */}
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                War Share
              </div>

              {/* Progress Labels */}
              <div className="flex justify-between text-xs mb-1">
                <span className="text-primary font-medium">
                  {mintAPercentage.toFixed(1)}%
                </span>
                <span className="text-[#FF4444] font-medium">
                  {mintBPercentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-primary"
                  style={{
                    width: `${mintAPercentage}%`,
                    borderRadius: '9999px 0 0 9999px'
                  }}
                  animate={{
                    width: `${mintAPercentage}%`
                  }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute right-0 top-0 bottom-0 bg-[#FF4444]"
                  style={{
                    width: `${mintBPercentage}%`,
                    borderRadius: '0 9999px 9999px 0'
                  }}
                  animate={{
                    width: `${mintBPercentage}%`
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Token Amounts */}
              <div className="flex justify-between text-xs">
                <div className="text-left">
                  <div className="text-primary font-medium">
                    {formatNumber(warData.coin1.amountPledged)} {warData.coin1.ticker}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    ${formatNumber(warData.coin1.amountPledged * warData.coin1.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#FF4444] font-medium">
                    {formatNumber(warData.coin2.amountPledged)} {warData.coin2.ticker}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    ${formatNumber(warData.coin2.amountPledged * warData.coin2.price)}
                  </div>
                </div>
              </div>

              {/* Time Left */}
              <div className="mt-8 text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {memeWarStateInfo?.war_ended ? 'War Ended' : 'Time Left'}
                </div>
                <motion.div
                  className="text-xl font-mono"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {memeWarStateInfo?.war_ended ? endedTimeAgo : warData.timeLeft}
                </motion.div>
              </div>

              {/* Winner Declaration */}
              {memeWarStateInfo?.winner_declared && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Winner</div>
                  <div className="text-xl font-mono">
                    {memeWarStateInfo.winner_declared === mintA
                      ? warData.coin1.ticker
                      : warData.coin2.ticker}
                  </div>
                </div>
              )}

              {/* Total Pledged */}
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Pledged</div>
                <div className="text-xl font-mono">
                  ${formatNumber(warData.totalPledged * ((warData.coin1.price + warData.coin2.price) / 2))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Token */}
        <div className="col-span-3">
          <TokenCard
            token={warData.coin2}
            totalPledged={warData.totalPledged}
            handleDeposit={() => handleDeposit(1, rightInput)}
            handleWithdraw={() => handleWithdraw(1)}
            pledgeAmount={rightInput}
            setPledgeAmount={setRightInput}
            tokenBalance={tokenBalanceMintB}
            btnLoading={btnLoading === 1}
            userState={userStateInfo}
            formatDeposit={formatDeposit}
            index={1}
            publicKey={publicKey}
            isWarEnded={memeWarStateInfo?.war_ended}
            // disablePledgeBtn={
            //   Number(rightInput) > tokenBalanceMintB || 
            //   Number(rightInput) <= 0 || 
            //   btnLoading === 1 
            //   // !!memeWarStateInfo?.war_ended
            // }
            disableUnpledgeBtn={
              btnLoading === 1 ||
              !!memeWarStateInfo?.war_ended ||
              !userStateInfo?.mint_b_deposit
            }
          />
        </div>
      </div>

      {/* Live Feed and Chat Section */}
      <div className="mt-8 grid grid-cols-3 gap-8">
        {/* Combined Live Feed */}
        <div>
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border flex justify-between">
              <h2 className="text-xl font-medium">Live Feed</h2>
              <div onClick={() => refreshTokenBalance()} className="cursor-pointer text-sm">
                Refresh
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {tradesData && [
                    ...(tradesData.mintA || []),
                    ...(tradesData.mintB || [])
                  ]
                    .sort((a: TradeData, b: TradeData) => b.event_time - a.event_time)
                    .slice(0, 10)
                    .map((trade: TradeData, i: number) => {
                      const isMintA = trade.mint === mintA;
                      const coin = isMintA ? warData.coin1 : warData.coin2;
                      const decimals = isMintA
                        ? memeWarStateInfo?.mint_a_decimals
                        : memeWarStateInfo?.mint_b_decimals;
                      const amount = Number(trade.amount) / (10 ** (decimals || 9));

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                              <img src={coin.image} alt={coin.ticker} className="w-5 h-5" />
                            </span>
                            <span className={`text-sm ${isMintA ? 'text-primary' : 'text-[#FF4444]'}`}>
                              +${formatNumber(amount * coin.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {formatWalletAddress(trade.wallet_address)}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-border flex justify-between">
              <h2 className="text-xl font-medium">Live Chat</h2>
              <div onClick={() => refreshChat()} className="cursor-pointer text-sm">
                Refresh
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
              <AnimatePresence mode="popLayout">
                {displayMessages && [...displayMessages]
                  .sort((a: ChatMessage, b: ChatMessage) => new Date(b.sender_time).getTime() - new Date(a.sender_time).getTime())
                  .map((message: ChatMessage, i: number) => {
                    // Determine if sender is supporting a coin based on deposit history
                    const isCoin1Supporter = message.sender === pubKey && userStateInfo?.mint_a_deposit;
                    const isCoin2Supporter = message.sender === pubKey && userStateInfo?.mint_b_deposit;
                    const supporterType = isCoin1Supporter
                      ? warData.coin1.ticker
                      : isCoin2Supporter
                        ? warData.coin2.ticker
                        : null;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                          {isCoin1Supporter
                            ? '1️⃣'
                            : isCoin2Supporter
                              ? '2️⃣'
                              : '👤'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {formatWalletAddress(message.sender)}
                            </span>
                            {supporterType && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isCoin1Supporter
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-red-500/10 text-red-500'
                                }`}>
                                {supporterType} Supporter
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {message.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.sender_time).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-muted border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendStatus === 'pending' || !pubKey}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                  {sendStatus === 'pending' ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Token Card Component
// Token Card Component
function TokenCard({
  token,
  totalPledged,
  handleDeposit,
  handleWithdraw,
  pledgeAmount,
  setPledgeAmount,
  tokenBalance,
  btnLoading,
  userState,
  formatDeposit,
  index,
  publicKey,
  isWarEnded,
  disablePledgeBtn,
  disableUnpledgeBtn
}: TokenCardProps) {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TweetTemplate | null>(null);

  interface TweetTemplate {
    text: string;
    hashtags: string[];
  }

  const tweetTemplates: TweetTemplate[] = [
    {
      text: `${token.ticker} is crushing it in the meme wars! Join me in supporting the future of memes 🚀`,
      hashtags: ['MemeCoin', 'Crypto', token.ticker]
    },
    {
      text: `The war is on and ${token.ticker} is taking the lead! Don't miss out on the next big thing 💎`,
      hashtags: ['CryptoWars', 'MemeWars', token.ticker]
    },
    {
      text: `${token.ticker} army assemble! We're making history in the meme wars 🔥`,
      hashtags: ['CryptoGems', 'MemeWar', token.ticker]
    }
  ];

  const generateTwitterIntent = (template: TweetTemplate): string => {
    const text = encodeURIComponent(template.text);
    const hashtags = template.hashtags.join(',');
    return `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`;
  };

  const percentage = (token.amountPledged / totalPledged) * 100;

  // Calculate expected payout
  const calculateExpectedPayout = (amount: number): number => {
    if (!amount) return 0;
    // If this side wins, pledger gets their amount plus proportional share of losing side
    const otherSideAmount = totalPledged - token.amountPledged;
    const shareOfPledge = amount / token.amountPledged;
    const expectedReward = amount + (otherSideAmount * shareOfPledge);
    return expectedReward;
  };

  // Calculate ROI percentage
  const calculateROI = (amount: number): number => {
    if (!amount) return 0;
    const payout = calculateExpectedPayout(amount);
    return ((payout - amount) / amount) * 100;
  };

  // Handler for max button
  const handleMax = (): void => {
    setPledgeAmount(tokenBalance.toString());
  };

  // Handler for half button
  const handleHalf = (): void => {
    setPledgeAmount((tokenBalance / 2).toString());
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Token Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl overflow-hidden">
            {token.image ? (
              <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              token.emoji
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{token.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono">${token.price.toFixed(8)}</span>
              <span className={`text-sm ${token.priceChange24h >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Support Button */}
        <button
          onClick={() => setIsWarRoomOpen(true)}
          className="p-2 hover:bg-muted rounded-full transition-colors group"
        >
          <Megaphone className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Market Cap" value={`${formatNumber(token.marketCap)}`} />
        <Stat label="24h Volume" value={`${formatNumber(token.volume24h)}`} />
        <Stat label="Holders" value={formatNumber(token.holders)} />
        <Stat label="Total Supply" value={formatNumber(token.totalSupply)} />
      </div>

      {/* Pledge Section */}
      <div className="bg-background/50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount Pledged</span>
          <span className="font-medium">{formatNumber(token.amountPledged)} {token.ticker}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Pledgers</span>
          <span className="font-medium">{formatNumber(token.pledgers)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">War Share</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>

        {/* Balance and Utility Buttons */}
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="flex gap-2">
            <button
              onClick={handleHalf}
              className="px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
            >
              HALF
            </button>
            <button
              onClick={handleMax}
              className="px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="text-muted-foreground">
            Balance: {formatNumber(tokenBalance)} {token.ticker}
          </div>
        </div>

        <input
          type="text"
          value={pledgeAmount}
          onChange={(e) => setPledgeAmount(e.target.value)}
          placeholder={`Enter amount`}
          className="w-full bg-muted border-border rounded px-3 py-2 text-sm"
        />

        {/* Expected Payout Section */}
        {pledgeAmount && Number(pledgeAmount) > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="text-xs text-muted-foreground">Expected Payout if {token.ticker} Wins</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono text-primary">
                ${formatNumber(calculateExpectedPayout(Number(pledgeAmount)))}
              </span>
              <span className="text-xs text-primary">
                (+{calculateROI(Number(pledgeAmount)).toFixed(2)}% ROI)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Your share: {((Number(pledgeAmount) / token.amountPledged) * 100).toFixed(2)}% of {token.ticker} pool
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {publicKey ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDeposit}
              disabled={disablePledgeBtn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {btnLoading ? 'Processing...' : `Pledge ${token.ticker}`}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={disableUnpledgeBtn}
              className="bg-muted hover:bg-muted/90 text-foreground py-2 rounded text-sm font-medium border border-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {btnLoading ? 'Processing...' : 'Unpledge'}
            </button>
          </div>
        ) : (
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-sm font-medium">
            Connect Wallet
          </button>
        )}

        {/* User Stats */}
        {userState && (
          <div className="mt-2 space-y-1 text-sm border-t border-border/50 pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposited:</span>
              <span>{formatDeposit(index === 0 ? userState.mint_a_deposit : userState.mint_b_deposit, index)} {token.ticker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Free:</span>
              <span>{formatDeposit(index === 0 ? userState.mint_a_risk_free_deposit : userState.mint_b_risk_free_deposit, index)} {token.ticker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawn:</span>
              <span>{formatDeposit(index === 0 ? userState.mint_a_withdrawn : userState.mint_b_withdrawn, index)} {token.ticker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penalty:</span>
              <span>{formatDeposit(index === 0 ? userState.mint_a_penalty : userState.mint_b_penalty, index)} {token.ticker}</span>
            </div>
          </div>
        )}
      </div>

      {/* War Room Modal */}
      <Dialog open={isWarRoomOpen} onOpenChange={setIsWarRoomOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{token.emoji}</span>
              {token.ticker} War Room
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Support {token.ticker} by spreading the word! Choose a message to share:
            </div>

            <div className="space-y-3">
              {tweetTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTemplate === template
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  <p className="text-sm mb-2">{template.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.hashtags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={selectedTemplate ? generateTwitterIntent(selectedTemplate) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                w-full inline-flex justify-center items-center px-4 py-2 rounded
                ${selectedTemplate
                  ? 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              {selectedTemplate ? 'Share on Twitter' : 'Select a message'}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  )
} 