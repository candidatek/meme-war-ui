"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WarDetailsFormProps } from "../types";

const durationOptions = [1, 2, 4, 8, 16, 24, 48];

export const WarDetailsForm: React.FC<WarDetailsFormProps> = ({
  warData,
  setWarData,
  selectedDuration,
  setSelectedDuration,
  riskFreeSol,
  setRiskFreeSol,
}) => {
  return (
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
                variant={selectedDuration === duration ? "default" : "outline"}
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
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
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
            onValueChange={(value: number[]) => setRiskFreeSol(value[0])}
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
      </CardContent>
    </Card>
  );
};
