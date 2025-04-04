"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAssetFromMint } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react"; // Import wallet hook

// import { useGetMemeWarRegistry } from '../hooks/useGetMemeWarRegistry';

interface WarData {
  description: string;
  twitter: string;
  telegram: string;
  website: string;
}

interface CoinData {
  mintAddress: string;
  ticker: string;
  name: string;
  emoji: string;
  image: string;
  isLoading: boolean;
  error: string | null;
}

interface TokenResponse {
  jsonrpc: string;
  result: {
    content: {
      links?: {
        image?: string;
      };
      metadata?: {
        name?: string;
        symbol?: string;
      };
    };
  };
  id: string;
}

const createDefaultCoinData = (overrides: Partial<CoinData> = {}): CoinData => {
  return {
    mintAddress: "",
    ticker: "",
    name: "",
    emoji: "💰",
    image: "",
    isLoading: false,
    error: null,
    ...overrides, // This allows customizing specific fields if needed
  };
};
export default function StartWarPage() {
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [newMemeWarState, setNewMemeWarState] = useState<string | null>(null);
  const [disableCreateWarBtn, setDisableCreateWarBtn] =
    useState<boolean>(false);
  const [showRedirect, setShowRedirect] = useState<boolean>(false);
  const [coin1Data, setCoin1Data] = useState<CoinData>(createDefaultCoinData());
  const [coin2Data, setCoin2Data] = useState<CoinData>(createDefaultCoinData());

  // const { data: mwrData } = useGetMemeWarRegistry(mintAddress, coin1Data.mintAddress === mintAddress ? coin2Data.mintAddress : coin1Data.mintAddress);
  // const { data: memeWarRegistry } = useGetMemeWarRegistry(coin1Data.mintAddress, coin2Data.mintAddress);

  const { publicKey } = useWallet(); // Get public key from wallet

  const [warData, setWarData] = useState<WarData>({
    description: "",
    twitter: "",
    telegram: "",
    website: "",
  });

  const isFormValid = (): boolean => {
    const hasBothAddresses =
      coin1Data.mintAddress.length >= 32 && coin2Data.mintAddress.length >= 32;

    const hasDifferentAddresses =
      coin1Data.mintAddress !== coin2Data.mintAddress;
    const noErrors =
      coin1Data.error === null &&
      coin2Data.error === null &&
      !coin1Data.isLoading &&
      !coin2Data.isLoading;

    const tokensLoaded = Boolean(coin1Data.name) && Boolean(coin2Data.name);
    return (
      hasBothAddresses && hasDifferentAddresses && noErrors && tokensLoaded
    );
  };

  const fetchTokenData = async (
    mintAddress: string,
    setCoinData: React.Dispatch<React.SetStateAction<CoinData>>,
    currentData: CoinData
  ): Promise<void> => {
    if (!mintAddress || mintAddress.length < 32) {
      setCoinData({
        ...currentData,
        isLoading: false,
        error: mintAddress
          ? "Mint address should be at least 32 characters"
          : null,
        name: "",
        ticker: "",
        image: "",
      });
      return;
    }

    try {
      setCoinData({ ...currentData, isLoading: true, error: null });
      // Check if war already exists for these tokens

      const data = (await getAssetFromMint(mintAddress)) as TokenResponse;
      if (!data.result) {
        throw new Error("Invalid response from API");
      }

      // if (mwrData && !mwrData.war_ended) {
      //   throw new Error("A meme war already exists for these tokens");
      // }

      const tokenData = data.result;
      const tokenImage = tokenData.content?.links?.image || "";
      const tokenName = tokenData.content?.metadata?.name || "";
      const tokenSymbol = tokenData.content?.metadata?.symbol || "";

      setCoinData({
        ...currentData,
        mintAddress,
        name: tokenName,
        ticker: tokenSymbol,
        image: tokenImage,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching token data:", error);
      setCoinData({
        ...currentData,
        mintAddress,
        isLoading: false,
        error: "Failed to fetch token data. Please check the mint address.",
        name: "",
        ticker: "",
        image: "",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (coin1Data.mintAddress) {
        fetchTokenData(coin1Data.mintAddress, setCoin1Data, coin1Data);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [coin1Data.mintAddress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (coin2Data.mintAddress) {
        fetchTokenData(coin2Data.mintAddress, setCoin2Data, coin2Data);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [coin2Data.mintAddress]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // Log the public key when the user clicks "Start War"
    console.log(
      "User public key:",
      publicKey ? publicKey.toString() : "Not connected"
    );

    // Check if meme war registry exists

    // console.log({ memeWarRegistry });

    // if (memeWarRegistry && !memeWarRegistry.war_ended) {
    //   toast.error("A meme war already exists for these tokens. Please wait for it to end.");
    //   return;
    // }

    console.log({
      userPublicKey: publicKey ? publicKey.toString() : null,
      warData,
      coin1: {
        mintAddress: coin1Data.mintAddress,
        name: coin1Data.name,
        ticker: coin1Data.ticker,
        emoji: coin1Data.emoji,
        image: coin1Data.image,
      },
      coin2: {
        mintAddress: coin2Data.mintAddress,
        name: coin2Data.name,
        ticker: coin2Data.ticker,
        emoji: coin2Data.emoji,
        image: coin2Data.image,
      },
    });
  };

  interface CoinFormProps {
    data: CoinData;
    setData: React.Dispatch<React.SetStateAction<CoinData>>;
    title: string;
  }

  const CoinForm: React.FC<CoinFormProps> = ({ data, setData, title }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Enter the details for this coin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${title}-mint`}>Token Mint Address</Label>
          <Input
            id={`${title}-mint`}
            placeholder="Enter token mint address"
            value={data.mintAddress}
            onChange={(e) => {
              const inputValue = e.target.value.trim();
              setData({
                ...(inputValue ? data : createDefaultCoinData()),
                mintAddress: inputValue,
                isLoading: inputValue.length >= 32,
                error:
                  inputValue && inputValue.length < 32
                    ? "Mint address should be at least 32 characters"
                    : null,
              });
            }}
          />
          {data.isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading token data...
            </p>
          )}
          {data.error && <p className="text-sm text-red-500">{data.error}</p>}
        </div>

        {data.image && (
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <img
                src={data.image}
                alt={`${data.name} logo`}
                className="object-cover"
                width={96}
                height={96}
              />
            </div>
          </div>
        )}

        <div className="flex w-full border gap-4 ">
          {data.ticker && (
            <div className="flex justify-between border w-fit">
              <Label htmlFor={`${title}-ticker`}>Ticker Symbol</Label>
              <Input
                id={`${title}-ticker`}
                placeholder="e.g. DOGE"
                value={data.ticker}
                maxLength={10}
                onChange={(e) => setData({ ...data, ticker: e.target.value })}
              />
              <Label htmlFor={`${title}-name`}>Coin Name</Label>
              <Input
                id={`${title}-ticker`}
                placeholder="e.g. Dogecoin"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Start a Meme Coin War</h1>
        <p className="text-muted-foreground mb-8">
          Create an epic battle between two meme coins and let the community
          decide the winner!
        </p>

        {/* Display wallet connection status */}
        <div className="mb-4 text-sm">
          {publicKey ? (
            <p className="text-green-500">
              Wallet connected: {publicKey.toString().slice(0, 6)}...
              {publicKey.toString().slice(-4)}
            </p>
          ) : (
            <p className="text-amber-500">
              Please connect your wallet to start a war
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <CoinForm
              data={coin1Data}
              setData={setCoin1Data}
              title="First Coin"
            />
            <CoinForm
              data={coin2Data}
              setData={setCoin2Data}
              title="Second Coin"
            />
          </div>

          {/* War details section with common description and social links */}
          <Card>
            <CardHeader>
              <CardTitle>War Details</CardTitle>
              <CardDescription>
                Tell us about this meme coin war
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="war-description">Description</Label>
                <Textarea
                  id="war-description"
                  placeholder="Describe this epic meme coin battle..."
                  value={warData.description}
                  onChange={(e) =>
                    setWarData({ ...warData, description: e.target.value })
                  }
                  className="min-h-32"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Social Links</h4>
                <div className="grid gap-2">
                  <div className="grid grid-cols-6 items-center gap-2">
                    <Label htmlFor="war-twitter" className="col-span-1">
                      Twitter
                    </Label>
                    <Input
                      id="war-twitter"
                      placeholder="Twitter URL"
                      className="col-span-5"
                      value={warData.twitter}
                      onChange={(e) =>
                        setWarData({ ...warData, twitter: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-6 items-center gap-2">
                    <Label htmlFor="war-telegram" className="col-span-1">
                      Telegram
                    </Label>
                    <Input
                      id="war-telegram"
                      placeholder="Telegram URL"
                      className="col-span-5"
                      value={warData.telegram}
                      onChange={(e) =>
                        setWarData({ ...warData, telegram: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-6 items-center gap-2">
                    <Label htmlFor="war-website" className="col-span-1">
                      Website
                    </Label>
                    <Input
                      id="war-website"
                      placeholder="Website URL"
                      className="col-span-5"
                      value={warData.website}
                      onChange={(e) =>
                        setWarData({ ...warData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="px-8"
              disabled={!publicKey || !isFormValid()}
            >
              Start War
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
