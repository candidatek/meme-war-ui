import { useEffect } from "react";
import { useState } from "react";
import UserTrades from "./UserTrades";
import UserWars from "./UserWars";

type ViewConfig = {
    id: string;
    label: string;
    Component: React.ComponentType;
};

const UserTabPanel: React.FC = () => {
    
    
    const viewConfigs: ViewConfig[] = [
        {
            id: 'Wars',
            label: 'Wars',
            Component: UserWars
        },
        {
            id: 'MyTrades',
            label: 'My Trades',
            Component: UserTrades
        },
    ];

    const [selectedView, setSelectedView] = useState<string>(viewConfigs[0].id);
    

    return (
        <div className="flex flex-col">
            {/* View Selection Buttons */}
            <div className="flex space-x-4">
                {viewConfigs.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setSelectedView(view.id)}
                        className={`px-4 py-2 rounded ${selectedView === view.id
                            ? 'font-bold'
                            : 'text-gray-300'
                            }`}
                    >
                        {view.label}
                    </button>
                ))}
            </div>

            {/* View Content */}
            <div className="duration-1000">
                {(() => {
                    const config = viewConfigs.find(view => view.id === selectedView);
                    if (config) {
                        const Component = config.Component;
                        return <Component />;
                    }
                    return null;
                })()}
            </div>
            {/* <style jsx global>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style> */}
        </div>
    );
};

export default UserTabPanel;
