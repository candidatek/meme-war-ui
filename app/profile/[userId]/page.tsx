"use client";
import { useGetUserProfile } from '@/app/api/getUserProfile';
import { useParams } from 'next/navigation';
import React from 'react';
import { useGetUserTrades } from '@/app/api/getUserTrades';
import UserTabPanel from '@/components/user/UserTabPanel';


const UserProfile = () => {
  const params = useParams();
  const { userId } = params;
  const { data: trades = [], refetch: refetchTrades } = useGetUserTrades(20, 0);
  const { data: isLoading, refetch, isFetching } = useGetUserProfile(typeof userId === 'string' ? userId : null);
  const handleRefresh = () => {
    refetch(); // Triggers manual refresh
    refetchTrades();
  };

  return (
    <div className='text-white h-[80vh] overflow-auto'>
      <div className='flex items-center justify-between underline p-2 w-[75vw]'>
        <div
          onClick={handleRefresh}
          className="cursor-pointer text-blue-500 underline w-[100px]"
        >
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </div>
      </div>
      <UserTabPanel />
    </div>
  );
}

export default UserProfile;
