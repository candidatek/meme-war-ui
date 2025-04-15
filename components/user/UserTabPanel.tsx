"use client";

import { useState } from "react";
import UserTrades from "./UserTrades";
import UserWars from "./UserWars";
import UserEarnings from "./UserEarnings";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Trophy, ArrowDownUp } from "lucide-react";
import { War } from "./UserWars";

type ViewConfig = {
  id: string;
  label: string;
  Component: React.ComponentType<any>;
  icon?: React.ReactNode;
};

interface UserTabPanelProps {
  userWars?: War[];
}

const UserTabPanel: React.FC<UserTabPanelProps> = ({ userWars = [] }) => {
  const viewConfigs: ViewConfig[] = [
    {
      id: "Wars",
      label: "Wars",
      Component: UserWars,
      icon: <Trophy className="h-4 w-4 mr-2" />,
    },
    {
      id: "MyTrades",
      label: "Trades",
      Component: UserTrades,
      icon: <ArrowDownUp className="h-4 w-4 mr-2" />,
    },
    {
      id: "Earnings",
      label: "Earnings",
      Component: UserEarnings,
      icon: <Coins className="h-4 w-4 mr-2" />,
    },
  ];

  const [selectedView, setSelectedView] = useState<string>(viewConfigs[0].id);

  return (
    <div className="flex flex-col">
      <div className="border-b border-border">
        <div className="flex">
          {viewConfigs.map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`
                                px-6 py-3 font-medium text-sm transition-colors relative flex items-center
                                ${
                                  selectedView === view.id
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }
                            `}
            >
              {view.icon}
              {view.label}
              {selectedView === view.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
          {(() => {
            const config = viewConfigs.find((view) => view.id === selectedView);
            if (config) {
              const Component = config.Component;
              if (config.id === "Wars") {
                return <Component userWars={userWars} />;
              }
              return <Component />;
            }
            return null;
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UserTabPanel;
