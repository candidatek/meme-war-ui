"use client";
import { useGetUserProfile } from "@/app/api/getUserProfile";
import { useParams } from "next/navigation";
import React from "react";
import { useGetUserTrades } from "@/app/api/getUserTrades";
import UserTabPanel from "@/components/user/UserTabPanel";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import useWalletInfo from "@/app/hooks/useWalletInfo";
import type { PublicKey } from "@solana/web3.js";

const UserProfile = () => {
  const { userId } = useParams();
  const { publicKey } = useWalletInfo();
  const { refetch: refetchTrades } = useGetUserTrades(20, 0);
  const { refetch, isFetching } = useGetUserProfile(
    typeof userId === "string" ? userId : null
  );

  const handleRefresh = () => {
    refetch();
    refetchTrades();
  };
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">User Profile</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 transition-colors"
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border rounded-lg shadow-sm overflow-hidden"
      >
        {publicKey == (userId as unknown as PublicKey) ? (
          <UserTabPanel />
        ) : (
          <span>
            Please connect your wallet or search for your own publicKey in
            params.
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;
