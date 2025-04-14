"use client";

import { useEffect, useState } from "react";
import UserTrades from "./UserTrades";
import UserWars from "./UserWars";
import { motion, AnimatePresence } from "framer-motion";

type ViewConfig = {
  id: string;
  label: string;
  Component: React.ComponentType;
  icon?: React.ReactNode;
};

const UserTabPanel: React.FC = () => {
  const viewConfigs: ViewConfig[] = [
    {
      id: "Wars",
      label: "Wars",
      Component: UserWars,
    },
    {
      id: "MyTrades",
      label: "Trades",
      Component: UserTrades,
    },
  ];

  const [selectedView, setSelectedView] = useState<string>(viewConfigs[0].id);

  return (
    <div className="flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {viewConfigs.map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`
                                px-6 py-3 font-medium text-sm transition-colors relative
                                ${
                                  selectedView === view.id
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }
                            `}
            >
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

      {/* Tab Content */}
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
