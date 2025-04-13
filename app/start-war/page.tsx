"use client";

import { useEffect, useState } from "react";

import { Info } from "lucide-react";
import { toast } from "sonner";

import { useCreateMemeWarRegistry } from "@/app/hooks/useCreateMemeWar"; // Import the hook
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
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { getAssetFromMint, getProgramDerivedAddressForPair } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react"; // Import wallet hook
import { PublicKey } from "@solana/web3.js";

import { useCreateMemeWarDetails } from "../api/createMemeWarDetails";
import useCreatePumpToken from "../hooks/useCreatePumpToken";
import useProgramDetails from "../hooks/useProgramDetails";
import { getPDAForMemeSigner, sortPublicKeys } from "../utils";

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

interface LaunchCoinFormProps {
  data: LaunchCoinData;
  setData: React.Dispatch<React.SetStateAction<LaunchCoinData>>;
  title: string;
  coinIndex: number;
  filePreview: string | null;
  handleImageChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    coinIndex: number
  ) => void;
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
    ...overrides,
  };
};

const LaunchCoinForm: React.FC<LaunchCoinFormProps> = ({
  data,
  setData,
  title,
  coinIndex,
  filePreview,
  handleImageChange,
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
        <Label htmlFor={`coin${coinIndex}-image-display`}>Coin Image</Label>
        <div className="flex flex-col gap-2">
          <div
            id={`coin${coinIndex}-image-display`}
            className={`border border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 ${
              !data.image ? "border-amber-300" : "border-gray-300"
            }`}
            onClick={() =>
              document.getElementById(`coin${coinIndex}-image`)?.click()
            }
          >
            {filePreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-gray-500">Click to select an image</p>
                {!data.image && (
                  <p className="text-xs text-amber-500 mt-1">
                    * Image is required
                  </p>
                )}
              </div>
            )}
          </div>

          <input
            id={`coin${coinIndex}-image`}
            name={`coin${coinIndex}-image`}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, coinIndex)}
            className="hidden"
          />

          {data.image && (
            <div className="text-sm text-muted-foreground">
              <p>Selected: {data.image.name}</p>
              <p>Size: {(data.image.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Social Links</h4>
        <div className="grid gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
            <Label htmlFor={`${title}-twitter`} className="sm:col-span-1">
              Twitter
            </Label>
            <Input
              id={`${title}-twitter`}
              placeholder="Twitter URL"
              className="sm:col-span-5"
              value={data.twitter}
              onChange={(e) => setData({ ...data, twitter: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
            <Label htmlFor={`${title}-telegram`} className="sm:col-span-1">
              Telegram
            </Label>
            <Input
              id={`${title}-telegram`}
              placeholder="Telegram URL"
              className="sm:col-span-5"
              value={data.telegram}
              onChange={(e) => setData({ ...data, telegram: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
            <Label htmlFor={`${title}-website`} className="sm:col-span-1">
              Website
            </Label>
            <Input
              id={`${title}-website`}
              placeholder="Website URL"
              className="sm:col-span-5"
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

export default function StartWarPage() {
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [riskFreeSol, setRiskFreeSol] = useState<number>(0);
  const [newMemeWarState, setNewMemeWarState] = useState<PublicKey | null>(
    null
  );
  const [disableCreateWarBtn, setDisableCreateWarBtn] =
    useState<boolean>(false);
  const [isCreatingTokens, setIsCreatingTokens] = useState<number | boolean>(
    false
  );
  const [showRedirect, setShowRedirect] = useState<boolean>(false);
  const [coin1Data, setCoin1Data] = useState<CoinData>(createDefaultCoinData());
  const [coin2Data, setCoin2Data] = useState<CoinData>(createDefaultCoinData());
  const { publicKey } = useWallet();
  const {
    isCreateWarLoading,
    error: createWarError,
    createMemeRegistry,
  } = useCreateMemeWarRegistry(coin1Data.mintAddress, coin2Data.mintAddress);

  const { createPumpToken, error: createTokenError } = useCreatePumpToken();

  const [warData, setWarData] = useState<WarData>({
    description: "",
    twitter: "",
    telegram: "",
    website: "",
  });

  const [showLaunchCoins, setShowLaunchCoins] = useState<boolean>(false);
  const [filePreview1, setFilePreview1] = useState<string | null>(null);
  const [filePreview2, setFilePreview2] = useState<string | null>(null);
  const [launchCoin1, setLaunchCoin1] = useState<LaunchCoinData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "https://example.com",
    showName: true,
    image: null,
  });
  const [launchCoin2, setLaunchCoin2] = useState<LaunchCoinData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "https://example.com",
    showName: true,
    image: null,
  });

  const { mutate: createMemeWarDetails } = useCreateMemeWarDetails();
  const { memeProgram } = useProgramDetails();

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
        memeWarRegistry = await memeProgram!.account.memeWarRegistry.fetch(
          memeWarRegistryAddress
        );
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
        memeWarData: warData,
      });

      setNewMemeWarState(memeWarState);
      setShowRedirect(true);

      setWarData({
        description: "",
        twitter: "",
        telegram: "",
        website: "",
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
      const data = (await getAssetFromMint(mintAddress)) as TokenResponse;
      if (!data.result) {
        throw new Error("Invalid response from API");
      }

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
      setCoinData({
        ...currentData,
        isLoading: false,
        error: "Failed to fetch token data. Please check the mint address.",
      });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (
      warData &&
      (warData.description ||
        warData.telegram ||
        warData.twitter ||
        warData.website)
    ) {
      handleCreateMemeWarDetails();
    }
    if (!publicKey) {
      toast.error("Please connect your wallet to start a war");
      return;
    }

    if (!coin1Data.mintAddress || !coin2Data.mintAddress) {
      toast.error("Please enter both token mint addresses");
      return;
    }

    if (coin1Data.mintAddress === coin2Data.mintAddress) {
      toast.error("The two tokens must be different");
      return;
    }

    try {
      const createdMemeStateString = await createMemeRegistry(
        selectedDuration,
        publicKey
      );

      if (
        typeof createdMemeStateString === "string" &&
        createdMemeStateString.length > 0
      ) {
        const createdMemeStatePublicKey = new PublicKey(createdMemeStateString);

        toast.success("Meme war started successfully!");
        setNewMemeWarState(createdMemeStatePublicKey);
        setDisableCreateWarBtn(true);
        setTimeout(() => setShowRedirect(true), 3000);
      } else {
        console.error(
          "Failed to get valid public key string from createMemeRegistry"
        );
        toast.error(
          "Failed to start meme war: Invalid registry state received."
        );
      }
    } catch (error) {
      console.error("Error creating meme war:", error);
      toast.error(
        `Failed to start meme war: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
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
          {data.isLoading && (
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <span className="relative flex h-10 w-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 mt-4"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-green-500 mt-4"></span>
                </span>
              </div>
            </div>
          )}
          {data.error && <p className="text-sm text-red-500">{data.error}</p>}
        </div>

        {data.image && (
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
              <img
                src={data.image}
                alt={`${data.name} logo`}
                className="object-cover w-full h-full"
                width={96}
                height={96}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row w-full border gap-2 sm:gap-4 p-2">
          {data.ticker && (
            <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-2 sm:gap-4">
              <div className="space-y-1 w-full">
                <Label htmlFor={`${title}-ticker`}>Ticker Symbol</Label>
                <Input
                  id={`${title}-ticker`}
                  placeholder="e.g. DOGE"
                  value={data.ticker}
                  maxLength={10}
                  className="w-full"
                  readOnly // Make ticker read-only if fetched
                />
              </div>
              <div className="space-y-1 w-full">
                <Label htmlFor={`${title}-name`}>Coin Name</Label>
                <Input
                  id={`${title}-name`}
                  placeholder="e.g. Dogecoin"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full"
                  readOnly // Make name read-only if fetched
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    coinIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (coinIndex === 1) {
            setFilePreview1(event.target.result as string);
            setLaunchCoin1((prev) => ({ ...prev, image: file }));
          } else {
            setFilePreview2(event.target.result as string);
            setLaunchCoin2((prev) => ({ ...prev, image: file }));
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (coinIndex === 1) {
        setFilePreview1(null);
        setLaunchCoin1((prev) => ({ ...prev, image: null }));
      } else {
        setFilePreview2(null);
        setLaunchCoin2((prev) => ({ ...prev, image: null }));
      }
    }
  };

  const handleLaunchCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    console.log("Coin 1 data:", launchCoin1);
    console.log("Coin 2 data:", launchCoin2);

    if (!publicKey) {
      toast.error("Please connect your wallet to launch coins");
      return;
    }

    // Manual validation for required fields
    const requiredFields = [
      { field: launchCoin1.name, message: "Coin 1 name is required" },
      { field: launchCoin1.symbol, message: "Coin 1 symbol is required" },
      {
        field: launchCoin1.description,
        message: "Coin 1 description is required",
      },
      { field: launchCoin1.image, message: "Coin 1 image is required" },
      { field: launchCoin2.name, message: "Coin 2 name is required" },
      { field: launchCoin2.symbol, message: "Coin 2 symbol is required" },
      {
        field: launchCoin2.description,
        message: "Coin 2 description is required",
      },
      { field: launchCoin2.image, message: "Coin 2 image is required" },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        toast.error(message);
        return;
      }
    }

    try {
      console.log("Creating form data for upload");

      // At this point, we've verified the images are not null
      if (!launchCoin1.image || !launchCoin2.image) {
        toast.error("Images must be provided for both coins");
        return;
      }

      // Upload first coin to IPFS
      const formData1 = new FormData();
      formData1.append("file", launchCoin1.image);
      formData1.append("name", launchCoin1.name);
      formData1.append("symbol", launchCoin1.symbol);
      formData1.append("description", launchCoin1.description);
      if (launchCoin1.twitter) formData1.append("twitter", launchCoin1.twitter);
      if (launchCoin1.telegram)
        formData1.append("telegram", launchCoin1.telegram);
      if (launchCoin1.website) formData1.append("website", launchCoin1.website);

      console.log("Uploading coin 1 to IPFS");
      const response1 = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/ipfs",
        {
          method: "POST",
          body: formData1,
        }
      );

      if (!response1.ok) {
        throw new Error(
          `Failed to upload first coin to IPFS: ${response1.status} ${response1.statusText}`
        );
      }

      const ipfsData1 = await response1.json();
      console.log("Coin 1 IPFS response:", ipfsData1);

      const formData2 = new FormData();
      formData2.append("file", launchCoin2.image);
      formData2.append("name", launchCoin2.name);
      formData2.append("symbol", launchCoin2.symbol);
      formData2.append("description", launchCoin2.description);
      if (launchCoin2.twitter) formData2.append("twitter", launchCoin2.twitter);
      if (launchCoin2.telegram)
        formData2.append("telegram", launchCoin2.telegram);
      if (launchCoin2.website) formData2.append("website", launchCoin2.website);

      console.log("Uploading coin 2 to IPFS");
      const response2 = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/ipfs",
        {
          method: "POST",
          body: formData2,
        }
      );

      if (!response2.ok) {
        throw new Error(
          `Failed to upload second coin to IPFS: ${response2.status} ${response2.statusText}`
        );
      }

      const ipfsData2 = await response2.json();
      console.log("Coin 2 IPFS response:", ipfsData2);

      toast.success("Coins uploaded to IPFS successfully!");
      console.log("IPFS Data:", {
        coin1: ipfsData1,
        coin2: ipfsData2,
      });

      setIsCreatingTokens(true);
      await createPumpToken(
        launchCoin1.name,
        launchCoin1.symbol,
        ipfsData1.url,
        launchCoin2.name,
        launchCoin2.symbol,
        ipfsData2.url,
        setIsCreatingTokens
      );
    } catch (error) {
      console.error("Error launching coins:", error);
      toast.error(
        `Failed to launch coins: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsCreatingTokens(false);
    }
  };

  const durationOptions = [1, 2, 4, 8, 16, 24, 48];

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 sm:mb-8">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowLaunchCoins(!showLaunchCoins)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <LaunchCoinForm
                      key="launch-coin-1"
                      data={launchCoin1}
                      setData={setLaunchCoin1}
                      title="First Coin"
                      coinIndex={1}
                      filePreview={filePreview1}
                      handleImageChange={handleImageChange}
                    />
                    <LaunchCoinForm
                      key="launch-coin-2"
                      data={launchCoin2}
                      setData={setLaunchCoin2}
                      title="Second Coin"
                      coinIndex={2}
                      filePreview={filePreview2}
                      handleImageChange={handleImageChange}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto sm:px-8"
                      disabled={!publicKey || Boolean(isCreatingTokens)}
                    >
                      {Boolean(isCreatingTokens)
                        ? "Launching..."
                        : "Launch Coins"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Start a Meme Coin War
          </h1>
          <p className="text-muted-foreground mb-6 sm:mb-8">
            Create an epic battle between two meme coins and let the community
            decide the winner!
          </p>

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

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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

            <Card>
              <CardHeader>
                <CardTitle>War Details</CardTitle>
                <CardDescription>
                  Configure the parameters for this meme coin war
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select War Duration</Label>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((duration) => (
                      <Button
                        key={duration}
                        type="button"
                        variant={
                          selectedDuration === duration ? "default" : "outline"
                        }
                        onClick={() => setSelectedDuration(duration)}
                      >
                        {duration} hour{duration === 1 ? "" : "s"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="risk-free-sol">
                      Risk Free SOL: {riskFreeSol} SOL
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                        >
                          <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Explanation for Risk Free SOL (placeholder)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Slider
                    id="risk-free-sol"
                    min={0}
                    max={20}
                    step={1}
                    value={[riskFreeSol]}
                    onValueChange={(value: number[]) =>
                      setRiskFreeSol(value[0])
                    }
                    className="h-3"
                  />
                </div>

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
                  <h4 className="text-sm font-medium">
                    Social Links (Optional)
                  </h4>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
                      <Label htmlFor="war-twitter" className="sm:col-span-1">
                        Twitter
                      </Label>
                      <Input
                        id="war-twitter"
                        placeholder="https://twitter.com/yourcoin"
                        className="sm:col-span-5"
                        value={warData.twitter}
                        onChange={(e) =>
                          setWarData({ ...warData, twitter: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
                      <Label htmlFor="war-telegram" className="sm:col-span-1">
                        Telegram
                      </Label>
                      <Input
                        id="war-telegram"
                        placeholder="https://t.me/yourcoin"
                        className="sm:col-span-5"
                        value={warData.telegram}
                        onChange={(e) =>
                          setWarData({ ...warData, telegram: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2">
                      <Label htmlFor="war-website" className="sm:col-span-1">
                        Website
                      </Label>
                      <Input
                        id="war-website"
                        placeholder="https://yourcoin.com"
                        className="sm:col-span-5"
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
                className="w-full sm:w-auto sm:px-8"
                disabled={Boolean(
                  !publicKey ||
                    isCreateWarLoading ||
                    Boolean(disableCreateWarBtn)
                )}
              >
                {isCreateWarLoading
                  ? "Starting War..."
                  : disableCreateWarBtn
                  ? "War Started!"
                  : "Start War"}
              </Button>
            </div>
          </form>

          {showRedirect && newMemeWarState && (
            <div className="mt-4 text-center">
              <p className="text-green-500">
                War created successfully! Redirecting to{" "}
                <a
                  href={`/war/${newMemeWarState.toString()}`}
                  className="underline"
                >
                  the war page
                </a>
                ...
              </p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
