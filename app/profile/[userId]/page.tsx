/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useGetUserProfile } from "@/app/api/getUserProfile";
import { useUpdateUserProfile } from "@/app/api/updateUserProfile";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useGetUserTrades } from "@/app/api/getUserTrades";
import UserTabPanel from "@/components/user/UserTabPanel";
import { motion } from "framer-motion";
import { RefreshCw, Clipboard, ExternalLink } from "lucide-react";
import useWalletInfo from "@/app/hooks/useWalletInfo";
import type { PublicKey } from "@solana/web3.js";
import { formatWalletAddress } from "@/lib/utils";
import EditProfileDialog from "@/components/user/EditProfileDialog";
import { toast } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { showErrorToast } from "@/components/toast-utils";

const UserProfile = () => {
  const { userId } = useParams();
  const { publicKey } = useWalletInfo();
  const { refetch: refetchTrades } = useGetUserTrades(20, 0);
  const { data, refetch, isFetching } = useGetUserProfile(
    typeof userId === "string" ? userId : null
  );

  const { handleSignIn } = useAuth();

  const userProfile = data?.profile;
  const userWars = data?.wars || [];

  const [isCopied, setIsCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const updateProfile = useUpdateUserProfile();

  const handleRefresh = () => {
    refetch();
    refetchTrades();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "TW";
    const words = name.split(/\s+/);
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleProfileUpdate = async (data: {
    username: string;
    twitterHandle: string;
    bio: string;
  }) => {
    if (!userId || typeof userId !== "string") {
      showErrorToast("Cannot update profile: No wallet address");
      return;
    }

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      toast.info("Please sign in to update your profile");
      try {
        await handleSignIn();
        const newToken = localStorage.getItem("jwt_token");
        if (!newToken) {
          showErrorToast("Authentication required to update profile");
          return;
        }
      } catch (error) {
        showErrorToast("Authentication failed. Please try again.");
        return;
      }
    }

    updateProfile.mutate(
      {
        wallet_address: userId,
        username: data.username,
        social_handle: data.twitterHandle,
        bio: data.bio,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          refetch();
        },
        onError: (error) => {
          if (error.message?.includes("401")) {
            showErrorToast("Authentication expired. Please sign in again.");
            localStorage.removeItem("jwt_token");
          } else {
            showErrorToast("Failed to update profile. Please try again.");
          }
        },
      }
    );
  };

  const userStats = {
    totalPledged: userProfile?.totalPledged || "0",
    wars: userProfile?.totalWars || 0,
    victories: userProfile?.totalVictories || 0,
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Profile</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background border rounded-lg shadow-sm overflow-hidden p-6"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-300 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(userProfile?.username)}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-1">
              {userProfile?.username || "TokenWarrior"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Member since{" "}
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt).toLocaleDateString()
                : "11/04/2025"}
            </p>
            {userProfile?.bio && (
              <p className="text-sm text-muted-foreground mb-6 text-center w-full px-4">
                {userProfile.bio}
              </p>
            )}

            <div className="w-full mb-4 p-3 bg-gray-700 rounded-md flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">
                {userId
                  ? formatWalletAddress(userId as string)
                  : "0x7f0ga...yMh"}
              </span>
              <button
                onClick={() => copyToClipboard(userId as string)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {isCopied ? (
                  <span className="text-green-500 text-xs font-medium">
                    Copied!
                  </span>
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="w-full mb-6">
              <a
                href={`https://x.com/${
                  userProfile?.socialHandle || "tokenwarrior"
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 bg-gray-700 rounded-md flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>
                  https://x.com/{userProfile?.socialHandle || "tokenwarrior"}
                </span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>

            <div className="w-full grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-md flex flex-col items-center">
                <p className="text-lg font-semibold text-primary">
                  ${Number(userStats.totalPledged).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Total Pledged</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md flex flex-col items-center">
                <p className="text-lg font-semibold">{userStats.wars}</p>
                <p className="text-xs text-muted-foreground">Wars</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md flex flex-col items-center">
                <p className="text-lg font-semibold">{userStats.victories}</p>
                <p className="text-xs text-muted-foreground">Victories</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition-colors"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Edit Profile"}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background border rounded-lg shadow-sm overflow-hidden lg:col-span-2"
        >
          {publicKey == (userId as unknown as PublicKey) ? (
            <UserTabPanel userWars={userWars} />
          ) : (
            <div className="p-8 text-center">
              <span className="text-muted-foreground">
                Please connect your wallet or search for your own publicKey in
                params.
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        defaultUsername={userProfile?.username || ""}
        defaultTwitterHandle={userProfile?.socialHandle || ""}
        defaultBio={userProfile?.bio || ""}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfile;
