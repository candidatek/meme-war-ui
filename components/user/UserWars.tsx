"use client";
import { useRouter } from 'next/navigation';
import React from 'react';
import useCountdown from '@/app/hooks/useCountdown';
import { formatPublicKey } from '@/lib/utils';

import { useParams } from 'next/navigation';
import { useGetUserProfile } from '@/app/api/getUserProfile';

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

interface MemeWarRowProps {
  war: War;
}

const MemeWarRow: React.FC<MemeWarRowProps> = ({ war }) => {
  const router = useRouter();
  const handleRowClick = () => {
    router.push(`/meme-wars/${war.meme_war_state}`);
  };
  
  const { endedTimeAgo } = useCountdown(war.end_time);

  return (
    <tr onClick={handleRowClick} className="!h-20 hover:bg-gray-900 cursor-pointer">
      <td className="border p-2">
        <div className="flex items-center gap-2">
          <img
            src={war.mint_a_image}
            alt={war.mint_a_name}
            className="w-12 h-12"
          />
          {war.mint_a.substring(0, 5)}... {'  '}
          {war.mint_a_name}
        </div>
      </td>
      <td className="border p-2">{war.mint_a_symbol}</td>
      <td className="border p-2">
        <div className="flex items-center gap-2">
          <img
            src={war.mint_b_image}
            alt={war.mint_b_name}
            className="w-12 h-12"
          />
          {war.mint_b.substring(0, 5)}...{' '}
          {war.mint_b_name}
        </div>
      </td>
      <td className="border p-2">{war.mint_b_symbol}</td>
      <td className="border p-2">
        <div
          className="break-all underline"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
        >
          {formatPublicKey(war.meme_war_state)}
        </div>
      </td>
      <td className={`border p-2 ${war.war_ended ? 'text-red-500' : 'text-green-500'}`}>
        {!war.war_ended ? 'Active' : `War Ended ${endedTimeAgo}`}
      </td>
    </tr>
  );
};

interface UserWarsProps {
  wars?: War[];
}

const UserWars: React.FC<UserWarsProps> = ({ wars = [] }) => {
  const params = useParams();
  const { userProfile } = params;
  const { data: userProfileDetails, isLoading, refetch, isFetching } = useGetUserProfile(typeof userProfile === 'string' ? userProfile : null);

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full overflow-x-auto">
      {userProfileDetails?.length > 0 && (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Mint A</th>
            <th className="border p-2">Symbol A</th>
            <th className="border p-2">Mint B</th>
            <th className="border p-2">Symbol B</th>
            <th className="border p-2">War ID</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {userProfileDetails.map((war: War, index: number) => (
            <MemeWarRow key={war.meme_war_state} war={war} />
          ))}
        </tbody>
      </table>
      )
    }
    </div>
  );
};

export default UserWars;