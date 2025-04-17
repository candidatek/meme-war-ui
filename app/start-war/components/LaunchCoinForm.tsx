"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LaunchCoinFormProps } from "../../types";

export const LaunchCoinForm: React.FC<LaunchCoinFormProps> = ({
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
