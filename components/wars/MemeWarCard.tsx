import { useState } from 'react';

import { Megaphone } from 'lucide-react';

import useCountdown from '@/app/hooks/useCountdown';
import { useMemeWarCalculations } from '@/app/hooks/useMemeWarCalculations';
import { WarRoomDialog } from '@/app/war/[id]/components/WarRoomDialog';

import { War } from '../user/UserWars';

interface MemeWarListProps {
  warArray: War[];
  handleClick: (state: string, war: War) => void;
}

export const MemeWarCard = ({
  war,
  handleClick,
}: {
  war: War;
  handleClick: (state: string, war: War) => void;
}) => {
  const { rfPlusMintADeposited, rfPlusMintBDeposited } =
    useMemeWarCalculations(war);
  const { timeLeft, warEnded, endedTimeAgo } = useCountdown(war.end_time);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [token, setToken] = useState<{ ticker: string; emoji?: string } | null>(
    null
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState("");

  return (
    <div
      key={war.meme_war_state}
      onClick={() => handleClick(war.meme_war_state, war)}
      className="flex max-w-[570px] relative justify-between items-center cursor-pointer px-2 py-2 border-[0.5px]"
    >
      <MintDetails
        image={war.mint_a_image}
        name={war.mint_a_name}
        symbol={war.mint_a_symbol}
        pledged={rfPlusMintADeposited}
      />
      <div className="text-[18px] flex items-center flex-col sm:text-sm font-bold mx-2 ">
        <div>VS</div>
        <div className="text-sm font-semibold text-red-2">{`> time`}</div>
        <div className="text-sm font-semibold text-red-2">
          {warEnded ? endedTimeAgo : timeLeft}
        </div>
      </div>
      <MintDetails
        image={war.mint_b_image}
        name={war.mint_b_name}
        symbol={war.mint_b_symbol}
        pledged={rfPlusMintBDeposited}
      />

      {/* Right Side: Support Button */}
      <div className="sm:ml-4 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWarRoomOpen(true);
          }}
          className="p-2 hover:bg-muted rounded-full transition-colors group"
        >
          <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {isWarRoomOpen && (
        <WarRoomDialog
          isOpen={isWarRoomOpen}
          setIsOpen={setIsWarRoomOpen}
          token={token ?? { ticker: war.mint_a_symbol }}
          tweetTemplates={[]}
          isLoading={isLoadingTemplates}
          error={templatesError}
        />
      )}
    </div>
  );
};

const MintDetails = ({
  image,
  name,
  symbol,
  pledged,
}: {
  image: string;
  name: string;
  symbol: string;
  pledged: string;
}) => (
  <div className="flex flex-col  justify-center">
    <div className="flex">
      {image && image !== "" ? (
        <img src={image} alt={name} className="object-cover w-12 h-12" />
      ) : (
        <div className="w-12 h-12 bg-muted flex items-center justify-center text-lg">
          {symbol.charAt(0)}
        </div>
      )}
      <div className="ml-2 flex flex-col justify-center">
        <div className="text-blue-1 text-sm">
          {"> "} {pledged} ${symbol} Pledged
        </div>
        <div className="text-green-2 text-sm">{"> "} Risk free bonded</div>
      </div>
    </div>

    <div className="text-sm mt-1">${name}</div>
  </div>
);

export const MemeWarList = ({ warArray, handleClick }: MemeWarListProps) => {
  return (
    <div className="h-[80vh] w-full bg-black justify-center px-[15vw] sm:px-[4vw] overflow-y-auto">
      <div className="w-full grid grid-cols-2 sm:grid-cols-1 gap-4">
        {warArray.map((war, index) => (
          <MemeWarCard key={index} war={war} handleClick={handleClick} />
        ))}
      </div>
    </div>
  );
};
