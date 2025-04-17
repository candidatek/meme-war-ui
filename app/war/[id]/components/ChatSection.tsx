import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatWalletAddress } from "@/lib/utils";
import { ChatMessage } from "@/app/Interfaces";

interface ChatSectionProps {
  displayMessages: ChatMessage[] | null;
  refreshChat: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => Promise<void>;
  sendStatus: string;
  pubKey: string | null;
  userStateInfo: any;
  warData: any;
  lastMessageId: string | null;
}

export function ChatSection({
  displayMessages,
  refreshChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  sendStatus,
  pubKey,
  userStateInfo,
  warData,
  lastMessageId,
}: ChatSectionProps) {
  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between">
        <h2 className="text-lg md:text-xl font-medium">Live Chat</h2>
        <div onClick={refreshChat} className="cursor-pointer text-sm">
          Refresh
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[300px] md:max-h-[400px]">
        <AnimatePresence mode="popLayout">
          {displayMessages &&
            [...displayMessages]
              .sort(
                (a: ChatMessage, b: ChatMessage) =>
                  new Date(b.sender_time).getTime() -
                  new Date(a.sender_time).getTime()
              )
              .map((message: ChatMessage, i: number) => {
                // Determine if sender is supporting a coin based on deposit history
                const isCoin1Supporter =
                  message.sender === pubKey && userStateInfo?.mint_a_deposit;
                const isCoin2Supporter =
                  message.sender === pubKey && userStateInfo?.mint_b_deposit;
                const supporterType = isCoin1Supporter
                  ? warData.coin1.ticker
                  : isCoin2Supporter
                  ? warData.coin2.ticker
                  : null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-start gap-3 ${
                      message.id === lastMessageId ? "animate-pulse" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                      {isCoin1Supporter ? "1️⃣" : isCoin2Supporter ? "2️⃣" : "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">
                          {formatWalletAddress(message.sender)}
                        </span>
                        {supporterType && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              isCoin1Supporter
                                ? "bg-primary/10 text-primary"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {supporterType} Supporter
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {message.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(message.sender_time).toLocaleTimeString()}
                    </span>
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-muted border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendStatus === "pending" || !pubKey}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {sendStatus === "pending" ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
