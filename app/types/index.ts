export interface WarData {
  description: string;
  twitter: string;
  telegram: string;
  website: string;
}

export interface CoinData {
  mintAddress: string;
  ticker: string;
  name: string;
  emoji: string;
  image: string;
  isLoading: boolean;
  error: string | null;
}

export interface TokenResponse {
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

export interface LaunchCoinData {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  showName: boolean;
  image: File | null;
}

export interface LaunchCoinFormProps {
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

export interface CoinFormProps {
  data: CoinData;
  setData: React.Dispatch<React.SetStateAction<CoinData>>;
  title: string;
}

export interface WarDetailsFormProps {
  warData: WarData;
  setWarData: React.Dispatch<React.SetStateAction<WarData>>;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  riskFreeSol: number;
  setRiskFreeSol: React.Dispatch<React.SetStateAction<number>>;
}

export const createDefaultCoinData = (
  overrides: Partial<CoinData> = {}
): CoinData => {
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
