"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoinFormProps, createDefaultCoinData } from "../types";

export const CoinForm: React.FC<CoinFormProps> = ({ data, setData, title }) => (
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
                readOnly
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
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
