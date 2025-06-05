/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRouteProgress } from "@/app/hooks/useRouteProgress";

// API Hooks
import { useGetChatMessages } from "@/app/api/getChatMessages";
import { useMemeWarStateInfo } from "@/app/api/getMemeWarStateInfo";
import { useRecentTrades } from "@/app/api/getRecentTrades";
import { useGetUserStateInfo } from "@/app/api/getUserState";
import { useSendChatMessage } from "@/app/api/sendChatMessage";
import { useMemeWarContext } from "@/app/context/memeWarStateContext";
import { useSocket } from "@/app/context/socketContext";
import useCountdown from "@/app/hooks/useCountdown";
import useDepositTokens from "@/app/hooks/useDeposit";
import { useTokenBalance } from "@/app/hooks/useUserBalance";
import useWalletInfo from "@/app/hooks/useWalletInfo";
import useWithdrawTokens from "@/app/hooks/useWithdraw";
import { ChatMessage, TradeData, WarData } from "@/app/Interfaces";

// Utils
import {
  showErrorToast,
  validateSolanaAddress,

} from "@/lib/utils";

// Components
import { TokenCard } from "./components/TokenCard";
import { LiveFeed } from "./components/LiveFeed";
import { ChatSection } from "./components/ChatSection";
import { WarShare } from "./components/WarShare";
import { Billion } from "@/app/utils";
import { useMemeWarCalculations } from "@/app/hooks/useMemeWarCalculations";


export default function WarPage() {
  // Get params and context
  const params = useParams();
  const {
    memeWarState,
    mintA,
    mintB,
    userState,
    setMemeWarState,
    setMintA,
    setMintB,
  } = useMemeWarContext();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (params?.id) {
      setMemeWarState(params.id as string);
    }
  }, [params.id])

  const { startProgress, endProgress } = useRouteProgress();

  // Get meme war state data
  const { data: memeWarStateInfo, isLoading: isLoadingWarState } =
    useMemeWarStateInfo(memeWarState);

  useEffect(() => {
    if (isLoadingWarState) {
      startProgress();
    } else {
      endProgress();
    }
  }, [isLoadingWarState, startProgress, endProgress]);



  // Make sure mint addresses are set before initializing hooks
  useEffect(() => {
    if (memeWarStateInfo) {
      setMintA(memeWarStateInfo.mint_a);
      setMintB(memeWarStateInfo.mint_b);
    }
  }, [memeWarStateInfo, setMintA, setMintB]);

  // Initialize deposit/withdraw hooks - only after mint addresses are set
  const { depositTokens } = useDepositTokens(mintA, mintB);

  const { withdrawTokens } = useWithdrawTokens(mintA, mintB);

  // Get token balances - only after mint addresses are set
  const { data: tokenBalanceData, refreshTokenBalance } = useTokenBalance(
    mintA || "",
    mintB || ""
  );

  const tokenBalanceMintA = useMemo(
    () => Number(tokenBalanceData?.[0] ?? 0),
    [tokenBalanceData]
  );
  const tokenBalanceMintB = useMemo(
    () => Number(tokenBalanceData?.[1] ?? 0),
    [tokenBalanceData]
  );

  // Get user state data
  const { data: userStateInfo, refetch: refetchUserState } =
    useGetUserStateInfo(userState, memeWarState);

  // Recent trades data
  const { data: tradesData } = useRecentTrades(memeWarStateInfo?.meme_war_state);
  const [displayTradesData, setDisplayTradesData] = useState<{
    mintA: TradeData[];
    mintB: TradeData[];
  }>({
    mintA: [],
    mintB: [],
  });
  const queryClient = useQueryClient();
  const [animateTrade, setAnimateTrade] = useState<{
    index: number;
    tradeId: string | null;
  }>({ index: -1, tradeId: null });

  // Set display trades when tradesData updates
  useEffect(() => {
    if (tradesData) {
      setDisplayTradesData(tradesData);
    }
  }, [tradesData]);

  // Chat messages data
  const { data: chatMessages, refresh: refreshChat } = useGetChatMessages(
    memeWarState || ""
  );
  const { mutate: sendMessage, status: sendStatus } =
    useSendChatMessage(refreshChat);

  // Get wallet info
  const { publicKey, pubKey } = useWalletInfo();


  // Loading state
  const [btnLoading, setBtnLoading] = useState<boolean | number>(-1);

  // Input states
  const [leftInput, setLeftInput] = useState<string>("1");
  const [rightInput, setRightInput] = useState<string>("1");
  const [newMessage, setNewMessage] = useState<string>("");

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[] | null>(
    null
  );
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // War countdown
  const { timeLeft, endedTimeAgo } = useCountdown(
    memeWarStateInfo?.end_time
      ? memeWarStateInfo.end_time.toString()
      : undefined
  );

  // --- Consolidated WebSocket Effect ---
  useEffect(() => {
    if (!socket || !isConnected || !memeWarState || !mintA || !mintB) {
      return;
    }

    // Define the single room name
    const roomName = "game";
    // Original: const roomName = `game-${memeWarState}`;

    console.log(`Subscribing to room: ${roomName}`);
    socket.emit("subscribeToGame", roomName); // Subscribe to static 'game' room

    let animationTimeoutId: NodeJS.Timeout | undefined;
    let chatAnimationTimeoutId: NodeJS.Timeout | undefined;

    const handleGameUpdate = (
      message: TradeData & { meme_war_state?: string }
    ) => {
      // Keep the crucial filtering logic
      if (message.meme_war_state !== memeWarState) {
        // console.log(
        //   `[WebSocket] Ignoring game update for different war. Received: ${message.meme_war_state}, Current: ${memeWarState}`
        // );
        return;
      }
      // console.log("[WebSocket] Received game update for current war:", message);

      if (!message || typeof message !== "object") {
        return;
      }

      const processedMessage: TradeData = {
        event_type: message.event_type || "deposit",
        mint: message.mint || mintA || mintB,
        amount: message.amount?.toString() || "0",
        wallet_address: message.wallet_address || "unknown",
        event_time: message.event_time || Date.now(),
        tx_signature: message.tx_signature,
      };

      const isMatchingMintA = processedMessage.mint === mintA;
      const isMatchingMintB = processedMessage.mint === mintB;
      const index = isMatchingMintA ? 0 : isMatchingMintB ? 1 : -1;

      setDisplayTradesData((prevData) => {
        if (!prevData) return { mintA: [], mintB: [] };
        const updatedData = {
          mintA: [...(prevData.mintA || [])],
          mintB: [...(prevData.mintB || [])],
        };
        if (isMatchingMintA) {
          const newTrades = [processedMessage, ...updatedData.mintA];
          updatedData.mintA = newTrades.sort(
            (a, b) => b.event_time - a.event_time
          );
        } else if (isMatchingMintB) {
          const newTrades = [processedMessage, ...updatedData.mintB];
          updatedData.mintB = newTrades.sort(
            (a, b) => b.event_time - a.event_time
          );
        }
        return updatedData;
      });

      if (index !== -1 && processedMessage.event_type === "deposit") {
        if (animationTimeoutId) {
          clearTimeout(animationTimeoutId);
        }
        setAnimateTrade({
          index,
          tradeId:
            processedMessage.tx_signature || `${processedMessage.event_time}`,
        });
        animationTimeoutId = setTimeout(() => {
          setAnimateTrade({ index: -1, tradeId: null });
        }, 3500);
      }

      setTimeout(() => {
        refetchUserState();
        queryClient.invalidateQueries({
          queryKey: ["memeWarState", memeWarState],
        });
      }, 2000);
    };

    const handleChatUpdate = (
      message: ChatMessage & { meme_war_state?: string }
    ) => {
      if (message.meme_war_state !== memeWarState) {
        return;
      }

      setDisplayMessages((prev) => {
        if (!prev) return [message];
        const existing = prev.find((m) => m.id === message.id);
        if (existing) return prev;
        return [message, ...prev];
      });

      if (message.id) {
        setLastMessageId(message.id);
      }

      if (warData) {
        warData.reply_count = (warData.reply_count || 0) + 1;
      }

      setTimeout(() => {
        setLastMessageId(null);
      }, 2000);
    };

    socket.on("gameUpdate", handleGameUpdate);
    socket.on("chatUpdate", handleChatUpdate);

    // Cleanup function
    return () => {
      console.log(`Unsubscribing from room: ${roomName}`);
      socket.emit("unsubscribeFromGame", roomName); // Unsubscribe from static 'game' room
      socket.off("gameUpdate", handleGameUpdate);
      socket.off("chatUpdate", handleChatUpdate);

      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
      }
      if (chatAnimationTimeoutId) {
        clearTimeout(chatAnimationTimeoutId);
      }
    };
  }, [
    socket,
    isConnected,
    memeWarState, // Keep memeWarState dependency for filtering logic inside handlers
    mintA,
    mintB,
    refetchUserState,
    queryClient,
  ]);

  useEffect(() => {
    if (chatMessages) {
      const sortedMessages = [...chatMessages].sort(
        (a, b) =>
          new Date(b.sender_time).getTime() - new Date(a.sender_time).getTime()
      );
      setDisplayMessages(sortedMessages);
    }
  }, [chatMessages]);

  // Handle deposit for a token
  const handleDeposit = async (mintIdentifier: 0 | 1, amount: string) => {
    if (!publicKey) {
      showErrorToast("Please connect your wallet first!");
      return;
    }

    startProgress();

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      showErrorToast("Invalid deposit amount.");
      endProgress();
      return;
    }

    const balance =
      mintIdentifier === 0 ? tokenBalanceMintA : tokenBalanceMintB;
    if (Number(amount) > balance) {
      showErrorToast("Insufficient balance.");
      endProgress();
      return;
    }

    setBtnLoading(mintIdentifier);

    try {
      const txSignature = await depositTokens(
        Number(amount),
        mintIdentifier,
        setBtnLoading
      );

      if (txSignature) {
        console.log("Deposit successful:", txSignature);
        refreshTokenBalance();
        refetchUserState();
        queryClient.invalidateQueries({
          queryKey: ["memeWarState", memeWarState],
        });
      } else {
        showErrorToast("Deposit failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      showErrorToast(`Deposit failed: ${error.message || "Unknown error"}`);
    } finally {
      setBtnLoading(-1);
      // End loading indicator
      endProgress();
    }
  };

  // Handle withdraw for a token
  const handleWithdraw = async (index: 0 | 1) => {
    if (!publicKey) {
      showErrorToast("Please connect your wallet first!");
      return;
    }

    startProgress();

    try {
      setBtnLoading(index);

      let depositAmount = 0;
      if (userStateInfo) {
        depositAmount =
          index === 0
            ? parseFloat(userStateInfo.mint_a_deposit) -
            parseFloat(userStateInfo.mint_a_withdrawn)
            : parseFloat(userStateInfo.mint_b_deposit) -
            parseFloat(userStateInfo.mint_b_withdrawn);
      }

      if (depositAmount <= 0) {
        showErrorToast("No tokens to withdraw.");
        endProgress();
        return;
      }

      await withdrawTokens(index, setBtnLoading, () => {
        refetchUserState();
        refreshTokenBalance();
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      showErrorToast("Failed to withdraw tokens. Please try again.");
    } finally {
      setBtnLoading(-1);
      endProgress();
    }
  };

  // Auto refresh on invalid state
  useEffect(() => {
    const memeWarStateParam = params.id;

    if (
      !memeWarStateParam ||
      !validateSolanaAddress(
        typeof memeWarStateParam === "string" ? memeWarStateParam : ""
      )
    ) {
      return;
    }
  }, [memeWarStateInfo, params.id]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["trades", memeWarState] });
    queryClient.invalidateQueries({ queryKey: ["memeWarState", memeWarState] });
    refreshTokenBalance();
  }, [memeWarState, queryClient, refreshTokenBalance]);

  // Handle chat message sending
  const handleSendMessage = async () => {
    if (!pubKey || !newMessage.trim() || !memeWarState) return;

    try {
      await sendMessage({
        pubKey,
        newMessage,
        memeWarState,
      });

      setNewMessage("");

      // Increment reply count locally
      if (warData) {
        warData.reply_count = (warData.reply_count || 0) + 1;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("Failed to send message");
      }
    }
  };

  // Handle Enter key for sending message
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await handleSendMessage();
    }
  };

  // Calculate percentages and amounts for display
  const { mintAPrice, mintBPrice } = useMemeWarCalculations(memeWarStateInfo);
  const warData = useMemo(() => {
    if (!memeWarStateInfo) {
      return null;
    }

    const mintADeposited =
      Number(memeWarStateInfo.mint_a_total_deposited) /
      10 ** (memeWarStateInfo.mint_a_decimals || 9);
    const mintBDeposited =
      Number(memeWarStateInfo.mint_b_total_deposited) /
      10 ** (memeWarStateInfo.mint_b_decimals || 9);

    return {
      coin1: {
        ticker: memeWarStateInfo.mint_a_symbol || "TOKEN_A",
        name: memeWarStateInfo.mint_a_name || "Token A",
        marketCap: mintAPrice * Number(Billion || 0),
        price: mintAPrice || 0,
        priceChange24h: Number(memeWarStateInfo.mint_a_price_change || 0),
        volume24h: Number(memeWarStateInfo.mint_a_volume || 0),
        holders: Number(memeWarStateInfo.mint_a_holders || 0),
        totalSupply: Number(Billion || 0),
        amountPledged: mintADeposited || 0,
        pledgers: memeWarStateInfo.mint_a_depositors || 0,
        emoji: "🪙",
        description:
          memeWarStateInfo.mint_a_description || "Token A description",
        socialLinks: {
          twitter: "#",
          telegram: "#",
          website: "#",
        },
        image: memeWarStateInfo.mint_a_image || null,
        address: memeWarStateInfo.mint_a,
      },
      coin2: {
        ticker: memeWarStateInfo.mint_b_symbol || "TOKEN_B",
        name: memeWarStateInfo.mint_b_name || "Token B",
        marketCap: mintBPrice * Number(Billion || 0),
        price: mintBPrice || 0,
        priceChange24h: Number(memeWarStateInfo.mint_b_price_change || 0),
        volume24h: Number(memeWarStateInfo.mint_b_volume || 0),
        holders: Number(memeWarStateInfo.mint_b_holders || 0),
        totalSupply: Number(Billion || 0),
        amountPledged: mintBDeposited || 0,
        pledgers: memeWarStateInfo.mint_b_depositors || 0,
        emoji: "🪙",
        description:
          memeWarStateInfo.mint_b_description || "Token B description",
        socialLinks: {
          twitter: "#",
          telegram: "#",
          website: "#",
        },
        image: memeWarStateInfo.mint_b_image || null,
        address: memeWarStateInfo.mint_b,
      },
      totalPledged: mintADeposited + mintBDeposited,
      timeLeft: timeLeft || "00:00:00",
      recentPledges: [],
      reply_count: memeWarStateInfo.reply_count || 0,
    } as WarData;
  }, [memeWarStateInfo, timeLeft, mintAPrice, mintBPrice]);

  // Return loading state if data isn't ready
  if (!warData) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-6">
        {/* Left Token */}
        <div className="col-span-1 md:col-span-3">
          <TokenCard
            memeWarStateInfo={memeWarStateInfo}
            token={warData.coin1}
            totalPledged={warData.totalPledged}
            handleDeposit={() => {
              handleDeposit(0, leftInput);
            }}
            handleWithdraw={() => handleWithdraw(0)}
            pledgeAmount={leftInput}
            setPledgeAmount={(value) => {
              setLeftInput(value);
            }}
            tokenBalance={tokenBalanceMintA}
            btnLoading={btnLoading === 0}
            userState={userStateInfo}
            index={0}
            publicKey={publicKey}
            isWarEnded={memeWarStateInfo?.war_ended}
            disablePledgeBtn={btnLoading === 0 || !!memeWarStateInfo?.war_ended}
            disableUnpledgeBtn={
              btnLoading === 0 ||
              !!memeWarStateInfo?.war_ended ||
              !userStateInfo?.mint_a_deposit
            }
            opposingToken={warData.coin2}
          />
        </div>

        {/* Center VS Section */}
        <WarShare
          warData={warData}
          memeWarStateInfo={memeWarStateInfo}
          endedTimeAgo={endedTimeAgo}
          timeLeft={timeLeft as string}
        />

        {/* Right Token */}
        <div className="col-span-1 md:col-span-3">
          <TokenCard
            memeWarStateInfo={memeWarStateInfo}
            token={warData.coin2}
            totalPledged={warData.totalPledged}
            handleDeposit={() => {
              handleDeposit(1, rightInput);
            }}
            handleWithdraw={() => handleWithdraw(1)}
            pledgeAmount={rightInput}
            setPledgeAmount={(value) => {
              setRightInput(value);
            }}
            tokenBalance={tokenBalanceMintB}
            btnLoading={btnLoading === 1}
            userState={userStateInfo}
            index={1}
            publicKey={publicKey}
            isWarEnded={memeWarStateInfo?.war_ended}
            disablePledgeBtn={btnLoading === 1 || !!memeWarStateInfo?.war_ended}
            disableUnpledgeBtn={
              btnLoading === 1 ||
              !!memeWarStateInfo?.war_ended ||
              !userStateInfo?.mint_b_deposit
            }
            opposingToken={warData.coin1}
          />
        </div>
      </div>

      {/* Transaction Count Display */}
      {memeWarStateInfo?.tx_count !== undefined && (
        <div className="text-center my-4">
          <span className="text-muted-foreground">Total Transactions:</span>
          <span className="font-semibold ml-2">
            {new Intl.NumberFormat().format(memeWarStateInfo.tx_count)}
          </span>
        </div>
      )}

      {/* Live Feed and Chat Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Combined Live Feed */}
        <div className="lg:col-span-1">
          <LiveFeed
            memeWarStateInfo={memeWarStateInfo}
            tradesData={displayTradesData}
            warData={warData}
            handleRefresh={handleRefresh}
            animateTrade={animateTrade}
          />
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-2">
          <ChatSection
            displayMessages={displayMessages}
            refreshChat={refreshChat}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            sendStatus={sendStatus}
            pubKey={pubKey}
            userStateInfo={userStateInfo}
            warData={warData}
            lastMessageId={lastMessageId}
          />
        </div>
      </div>
    </div>
  );
}
