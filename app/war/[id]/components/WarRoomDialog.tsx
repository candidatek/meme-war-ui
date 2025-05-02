import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TweetTemplate } from "@/app/Interfaces";

interface WarRoomDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  token: { ticker: string; emoji?: string };
  tweetTemplates: TweetTemplate[];
  isLoading: boolean;
  error: string | null;
}

export function WarRoomDialog({
  isOpen,
  setIsOpen,
  token,
  tweetTemplates,
  isLoading,
  error,
}: WarRoomDialogProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TweetTemplate | null>(null);

  const generateTwitterIntent = (template: TweetTemplate): string => {
    const text = encodeURIComponent(template.text);
    const hashtags = template.hashtags.join(",");
    return `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw] p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <span>{token.emoji}</span>
            {token.ticker} War Room
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Support {token.ticker} by spreading the word! Choose a message to
            share:
          </div>

          <div className="space-y-2 sm:space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Generating AI-powered tweets...
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : tweetTemplates.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No tweets available. Try again later.
              </div>
            ) : (
              tweetTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-xs sm:text-sm mb-2">{template.text}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {template.hashtags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <a
            href={
              selectedTemplate ? generateTwitterIntent(selectedTemplate) : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className={`
              w-full inline-flex justify-center items-center px-3 sm:px-4 py-2 rounded text-xs sm:text-sm
              ${
                selectedTemplate
                  ? "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            {selectedTemplate ? "Share on Twitter" : "Select a message"}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
