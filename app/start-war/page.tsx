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
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAssetFromMint, getProgramDerivedAddressForPair } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react'; // Import wallet hook
import { useCreateMemeWarDetails } from '../api/createMemeWarDetails';
import useProgramDetails from '../hooks/useProgramDetails';
import { PublicKey } from '@solana/web3.js';
import { getPDAForMemeSigner, sortPublicKeys } from '../utils';

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

interface LaunchCoinData {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  showName: boolean;
  image: File | null;
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
  const [newMemeWarState, setNewMemeWarState] = useState<PublicKey | null>(null);
  const [disableCreateWarBtn, setDisableCreateWarBtn] = useState<boolean>(false);
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

  const [showLaunchCoins, setShowLaunchCoins] = useState<boolean>(false);
  const [launchCoin1, setLaunchCoin1] = useState<LaunchCoinData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "https://example.com", // todo: add website link from the warpage
    showName: true,
    image: null,
  });
  const [launchCoin2, setLaunchCoin2] = useState<LaunchCoinData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "https://example.com", // todo: add website link from the warpage
    showName: true,
    image: null,
  });

  const { mutate: createMemeWarDetails } = useCreateMemeWarDetails();
  const { memeProgram } = useProgramDetails()


  const handleCreateMemeWarDetails = async () => {
    try {
      setDisableCreateWarBtn(true);
      
      const mintA = new PublicKey(coin1Data.mintAddress);
      const mintB = new PublicKey(coin2Data.mintAddress);
      
      const sortedKeys = sortPublicKeys(mintA, mintB);
      const memeWarRegistryAddress = getProgramDerivedAddressForPair(
        sortedKeys[0], 
        sortedKeys[1]
      );
      
      let memeWarRegistry;
      try {
        memeWarRegistry = await memeProgram!.account.memeWarRegistry.fetch(memeWarRegistryAddress);
      } catch (error) {
        console.log("Registry doesn't exist yet, creating a new war");
        setDisableCreateWarBtn(false);
        return;
      }
      
      const lastValidated = memeWarRegistry.lastValidated as number;
      
      const memeWarState = getPDAForMemeSigner(
        sortedKeys[0], 
        sortedKeys[1], 
        lastValidated
      );
      
      await createMemeWarDetails({ 
        memeWarState: memeWarState, 
        memeWarData: warData 
      });
      
      setNewMemeWarState(memeWarState);
      setShowRedirect(true);
      
      setWarData({
        description: '',
        twitter: '',
        telegram: '',
        website: ''
      });
    } catch (error) {
      console.error("Error creating meme war details:", error);
    } finally {
      setDisableCreateWarBtn(false);
    }
  };

  const fetchTokenData = async (
    mintAddress: string,
    setCoinData: React.Dispatch<React.SetStateAction<CoinData>>,
    currentData: CoinData
  ): Promise<void> => {
    if (!mintAddress || mintAddress.length < 32) return;

    try {
      setCoinData({ ...currentData, isLoading: true, error: "" });
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
        error: "",
      });
    } catch (error) {
      console.error("Error fetching token data:", error);
      await setCoinData(createDefaultCoinData());
      console.log(" **** ", currentData);
      setCoinData({
        ...currentData,
        isLoading: false,
        error: "Failed to fetch token data. Please check the mint address.",
      });
    }
  };

  // Debounce function to prevent too many API calls

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (coin1Data.mintAddress && coin1Data.mintAddress.length >= 32) {
        fetchTokenData(coin1Data.mintAddress, setCoin1Data, coin1Data);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [coin1Data.mintAddress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (coin2Data.mintAddress && coin2Data.mintAddress.length >= 32) {
        fetchTokenData(coin2Data.mintAddress, setCoin2Data, coin2Data);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [coin2Data.mintAddress]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (warData && (warData.description || warData.telegram || warData.twitter || warData.website)) {
      console.log("Validations work");
      handleCreateMemeWarDetails();
    }
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
                mintAddress: inputValue ? inputValue : "",
              });
            }}
          />
          {data.isLoading &&
            <p className="text-sm text-muted-foreground">
              <div className="mb-6">
                <div className="flex items-center justify-center">
                  <span className="relative flex h-10 w-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 mt-4"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 bg-green-500 mt-4"></span>
                  </span>
                </div>
              </div>
            </p>}
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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setCoinData: React.Dispatch<React.SetStateAction<LaunchCoinData>>,
    coinData: LaunchCoinData
  ) => {
    if (e.target.files && e.target.files[0]) {
      setCoinData({
        ...coinData,
        image: e.target.files[0],
      });
    }
  };

  const handleLaunchCoins = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast.error("Please connect your wallet to launch coins");
      return;
    }

    if (!launchCoin1.image || !launchCoin2.image) {
      toast.error("Please upload images for both coins");
      return;
    }

    // todo: add functionality to launch coins
    toast.info("Launching coins... This functionality is not yet implemented");
    console.log("Launch data:", {
      coin1: launchCoin1,
      coin2: launchCoin2,
      walletPublicKey: publicKey.toString(),
    });
  };

  interface LaunchCoinFormProps {
    data: LaunchCoinData;
    setData: React.Dispatch<React.SetStateAction<LaunchCoinData>>;
    title: string;
  }

  const LaunchCoinForm: React.FC<LaunchCoinFormProps> = ({
    data,
    setData,
    title,
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${title}-name`}>Coin Name</Label>
          <Input
            id={`${title}-name`}
            placeholder="e.g. Awesome Meme Coin"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-symbol`}>Ticker</Label>
          <Input
            id={`${title}-symbol`}
            placeholder="e.g. AMC"
            value={data.symbol}
            onChange={(e) => setData({ ...data, symbol: e.target.value })}
            maxLength={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-desc`}>Description</Label>
          <Textarea
            id={`${title}-desc`}
            placeholder="Describe your meme coin..."
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="min-h-20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-image`}>Coin Image</Label>
          <Input
            id={`${title}-image`}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, setData, data)}
            className="cursor-pointer"
            required
          />
          {data.image && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Image selected: {data.image.name}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Social Links</h4>
          <div className="grid gap-2">
            <div className="grid grid-cols-6 items-center gap-2">
              <Label htmlFor={`${title}-twitter`} className="col-span-1">
                Twitter
              </Label>
              <Input
                id={`${title}-twitter`}
                placeholder="Twitter URL"
                className="col-span-5"
                value={data.twitter}
                onChange={(e) => setData({ ...data, twitter: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2">
              <Label htmlFor={`${title}-telegram`} className="col-span-1">
                Telegram
              </Label>
              <Input
                id={`${title}-telegram`}
                placeholder="Telegram URL"
                className="col-span-5"
                value={data.telegram}
                onChange={(e) => setData({ ...data, telegram: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2">
              <Label htmlFor={`${title}-website`} className="col-span-1">
                Website
              </Label>
              <Input
                id={`${title}-website`}
                placeholder="Website URL"
                className="col-span-5"
                value={data.website}
                onChange={(e) => setData({ ...data, website: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${title}-showName`}
            checked={data.showName}
            onChange={(e) => setData({ ...data, showName: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor={`${title}-showName`}>Show Name</Label>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Launch 2 new Meme Coins dropdown section */}
        <Card className="mb-8">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowLaunchCoins(!showLaunchCoins)}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <CardTitle>Launch 2 new Meme Coins</CardTitle>
                <CardDescription>
                  Launch two new meme coins and start a war between them!
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLaunchCoins(!showLaunchCoins);
                }}
              >
                {showLaunchCoins ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>

          {showLaunchCoins && (
            <CardContent>
              <form onSubmit={handleLaunchCoins} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <LaunchCoinForm
                    data={launchCoin1}
                    setData={setLaunchCoin1}
                    title="First Coin"
                  />
                  <LaunchCoinForm
                    data={launchCoin2}
                    setData={setLaunchCoin2}
                    title="Second Coin"
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8"
                    disabled={!publicKey}
                  >
                    Launch Coins
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

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
              disabled={!publicKey} // Disable button if wallet not connected
            >
              Start War
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
