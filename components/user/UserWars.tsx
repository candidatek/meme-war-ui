"use client";

import { useRouter } from "next/navigation";
import React from "react";
import useCountdown from "@/app/hooks/useCountdown";
import { formatPublicKey } from "@/lib/utils";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export interface War {
  meme_war_state: string;
  mint_a_image: string;
  mint_a_name: string;
  mint_a_symbol: string;
  mint_b_image: string;
  mint_b_name: string;
  mint_b_symbol: string;
  war_ended: boolean;
  end_time: string;
  mint_a: string;
  mint_b: string;
}

interface MemeWarCardProps {
  war: War;
  onClick: () => void;
}

const MemeWarCard: React.FC<MemeWarCardProps> = ({ war, onClick }) => {
  const { endedTimeAgo } = useCountdown(war.end_time);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="border border-border rounded-lg overflow-hidden bg-background hover:border-primary/50 transition-colors cursor-pointer mb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        <div className="col-span-2 flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <img
              src={war.mint_a_image}
              alt={war.mint_a_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{war.mint_a_name}</p>
            <p className="text-sm text-muted-foreground">{war.mint_a_symbol}</p>
            <p className="text-xs text-muted-foreground/70 font-mono">
              {formatPublicKey(war.mint_a)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-muted/70">
            VS
          </div>
        </div>

        <div className="col-span-2 flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <img
              src={war.mint_b_image}
              alt={war.mint_b_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{war.mint_b_name}</p>
            <p className="text-sm text-muted-foreground">{war.mint_b_symbol}</p>
            <p className="text-xs text-muted-foreground/70 font-mono">
              {formatPublicKey(war.mint_b)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3 flex items-center justify-between bg-muted/30">
        <div className="text-xs font-mono text-muted-foreground">
          {formatPublicKey(war.meme_war_state)}
        </div>
        <div
          className={`text-sm px-2 py-1 rounded-full ${
            war.war_ended
              ? "bg-red-500/10 text-red-500"
              : "bg-green-500/10 text-green-500"
          }`}
        >
          {!war.war_ended ? "Active" : `Ended ${endedTimeAgo}`}
        </div>
      </div>
    </motion.div>
  );
};

interface UserWarsProps {
  userWars?: War[];
}

const UserWars: React.FC<UserWarsProps> = ({ userWars = [] }) => {
  const router = useRouter();
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2 text-muted-foreground">Loading wars...</span>
      </div>
    );
  }

  if (userWars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">🏆</span>
        </div>
        <h3 className="text-lg font-medium">No Wars Found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You haven't participated in any meme coin wars yet. Start a war or
          pledge to an existing one to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {userWars.map((war: War) => (
          <MemeWarCard
            key={war.meme_war_state}
            war={war}
            onClick={() => router.push(`/meme-wars/${war.meme_war_state}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default UserWars;
