"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAssetFromMint, getProgramDerivedAddressForPair } from "@/lib/utils";
import { useCreateMemeWarDetails } from "../api/createMemeWarDetails";
import { useCreateMemeWarRegistry } from "@/app/hooks/useCreateMemeWar";
import useCreatePumpToken from "../hooks/useCreatePumpToken";
import useProgramDetails from "../hooks/useProgramDetails";
import { getPDAForMemeSigner, sortPublicKeys } from "../utils";
import { showErrorToast } from "@/components/toast-utils";
import { useMintInfo } from "../hooks/useMintInfo";
import { useGetMemeWarRegistry } from "../hooks/useGetMemeWarRegistry";

// Import components from the local components directory
import { CoinForm } from "./components/CoinForm";
import { LaunchCoinForm } from "./components/LaunchCoinForm";
import { WarDetailsForm } from "./components/WarDetailsForm";
import {
  CoinData,
  LaunchCoinData,
  WarData,
  TokenResponse,
  createDefaultCoinData,
} from "../types";

export default function StartWarPage() {
  const router = useRouter();
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

  const { data: existingMemeWarRegistry, isLoading: isMemeWarRegistryLoading } =
    useGetMemeWarRegistry(coin1Data.mintAddress, coin2Data.mintAddress);

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
  const { data: mintAInfo } = useMintInfo(coin1Data.mintAddress);
  const { data: mintBInfo } = useMintInfo(coin2Data.mintAddress);

  useEffect(() => {
    // Only check tokens when we have both addresses AND they're valid length
    if (
      coin1Data.mintAddress &&
      coin2Data.mintAddress
      // coin1Data.mintAddress.length >= 32 &&
      // coin2Data.mintAddress.length >= 32
    ) {
      // Only show error when mintInfo has been fetched (not null/undefined) AND is invalid
      if (mintAInfo === null || mintBInfo === null) {
        toast.error(
          "Only migrated tokens to pump swap are allowed to create a war!",
          {
            duration: 4000,
            position: "bottom-left",
            id: "mint-validation-error", // Using ID prevents duplicate toasts
          }
        );
      }
    }
  }, [mintAInfo, mintBInfo, coin1Data.mintAddress, coin2Data.mintAddress]);

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
      showErrorToast("Please connect your wallet to start a war");
      return;
    }

    if (!coin1Data.mintAddress || !coin2Data.mintAddress) {
      showErrorToast("Please enter both token mint addresses");
      return;
    }

    if (coin1Data.mintAddress === coin2Data.mintAddress) {
      showErrorToast("The two tokens must be different");
      return;
    }

    if (existingMemeWarRegistry && !existingMemeWarRegistry.war_ended) {
      showErrorToast("A meme war already exists for these tokens!");
      return;
    }

    try {
      const createdMemeStateString = await createMemeRegistry(
        selectedDuration,
        riskFreeSol,
        publicKey
      );

      if (
        typeof createdMemeStateString === "string" &&
        createdMemeStateString.length > 0
      ) {
        const createdMemeStatePublicKey = new PublicKey(createdMemeStateString);

        toast.success("Meme war started successfully!", {
          duration: 3000,
          position: "bottom-left",
          id: "war-success",
        });
        setNewMemeWarState(createdMemeStatePublicKey);
        setDisableCreateWarBtn(true);
        setTimeout(() => {
          setShowRedirect(true);
          router.push(`/war/${createdMemeStatePublicKey.toString()}`);
        }, 3000);
      } else {
        console.error(
          "Failed to get valid public key string from createMemeRegistry"
        );
        showErrorToast(
          "Failed to start meme war: Invalid registry state received."
        );
      }
    } catch (error) {
      console.error("Error creating meme war:", error);
      showErrorToast(
        `Failed to start meme war: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

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
            setLaunchCoin1((prev: LaunchCoinData) => ({
              ...prev,
              image: file,
            }));
          } else {
            setFilePreview2(event.target.result as string);
            setLaunchCoin2((prev: LaunchCoinData) => ({
              ...prev,
              image: file,
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (coinIndex === 1) {
        setFilePreview1(null);
        setLaunchCoin1((prev: LaunchCoinData) => ({ ...prev, image: null }));
      } else {
        setFilePreview2(null);
        setLaunchCoin2((prev: LaunchCoinData) => ({ ...prev, image: null }));
      }
    }
  };

  const handleLaunchCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    console.log("Coin 1 data:", launchCoin1);
    console.log("Coin 2 data:", launchCoin2);

    if (!publicKey) {
      toast.error("Please connect your wallet to launch coins", {
        duration: 4000,
        position: "bottom-left",
        id: "launch-wallet-error",
      });
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
        toast.error(message, {
          duration: 4000,
          position: "bottom-left",
          id: `field-error-${message}`,
        });
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
        }`,
        {
          duration: 4000,
          position: "bottom-left",
        }
      );
      setIsCreatingTokens(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* <Card className="mb-6 sm:mb-8">
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
          </Card> */}

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

            <WarDetailsForm
              warData={warData}
              setWarData={setWarData}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              riskFreeSol={riskFreeSol}
              setRiskFreeSol={setRiskFreeSol}
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto sm:px-8"
                disabled={Boolean(
                  !publicKey ||
                    isCreateWarLoading ||
                    Boolean(disableCreateWarBtn) ||
                    !mintAInfo ||
                    !mintBInfo ||
                    (existingMemeWarRegistry &&
                      !existingMemeWarRegistry.war_ended)
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
