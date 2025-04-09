"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMemeWarContext } from '@/app/context/memeWarStateContext';
import { useMemeWarCalculations } from '@/app/hooks/useMemeWarCalculations';

import useCountdown from '@/app/hooks/useCountdown';

import { useGetHomePageDetails } from '../api/getHomePageDetails';
import StartMemeWarButton from '@/components/wars/StartMemeWarBtn';
import SearchMemeWars from '@/components/wars/searchMemeWars';


export interface IDashboardWar {
  mint_a: string;
  mint_b: string;
  mint_a_image: string;
  mint_b_image: string;
  mint_b_deposit: string;
  mint_a_deposit: string;
  mint_a_withdrawn: string;
  mint_b_withdrawn: string;
  mint_a_decimals: number;
  mint_b_decimals: number;
  mint_a_penalty: string;
  mint_b_penalty: string;
  mint_a_symbol: string;
  mint_b_symbol: string;
  end_time: string;
  meme_war_state: string;
  // image: string;
  // tokenPerSol: number;
}
const Home: React.FC = () => {

  const { data: warArray, isError, isLoading, error } = useGetHomePageDetails()
  const [dashboardWar, setDashboardWar] = useState<IDashboardWar>()
  const { setMemeWarState, setMintA, setMintB } = useMemeWarContext()

  useEffect(() => {
    if (warArray?.length > 0) {
      setDashboardWar(warArray[0])
    }
  }, [warArray])

  const { rfPlusMintADeposited, rfPlusMintBDeposited, mintBRiskFreeDeposited, mintARiskFreeDeposited } = useMemeWarCalculations(dashboardWar)
  const router = useRouter()

  const handleClick = (memeWarState: string | undefined, memeWarReg: IDashboardWar) => {
    if (memeWarState) {
      setMemeWarState(memeWarState)
      setMintA(memeWarReg?.mint_a)
      setMintB(memeWarReg?.mint_b)
    }
    router.push('war/' + memeWarState)
  }

  const {timeLeft, warEnded, endedTimeAgo} = useCountdown(dashboardWar?.end_time)

  return (
    <div className="bg-black text-white flex flex-col items-center justify-center p-4">
      {isLoading ? <div>Loading...</div> :
        <>
          <div className=' max-w-5xl w-[100vw] mt-2'>
            <StartMemeWarButton />
            <div className="text-[50px] text-red-1 font-bold text-center flex items-center sm:text-2xl justify-center"> WORLD WAR
              <div className='text-3xl ml-2 text-green-2'> {'>'} join</div> </div>

          </div>
          <div
            onClick={() => handleClick(dashboardWar?.meme_war_state, dashboardWar!)}
            className='flex w-[45vw] sm:w-[90vw] justify-between mt-5 items-center cursor-pointer'>
            <div>
              <img src={dashboardWar?.mint_a_image!} alt="War 1" width={200} height={200} className="object-cover  w-[200px] h-[200px]" />
              <div className='sm:text-sm'>
                {'>'} {rfPlusMintADeposited} ${dashboardWar?.mint_a_symbol} Pledged
              </div>
              <div className='sm:text-sm'>
              {'>'} {mintARiskFreeDeposited ? `Risk free bonded` : `Risk Free Deposit Opportunity`}
              </div>
            </div>
            <div className='text-[48px] font-bold'>
              VS
            </div>
            <div>
              <img src={dashboardWar?.mint_b_image!} alt="War 1" width={200} height={200} className="object-cover w-[200px] h-[200px]" />
              <div className='sm:text-sm'>
                {'>'} {rfPlusMintBDeposited} ${dashboardWar?.mint_b_symbol} Pledged
              </div>
              <div className='sm:text-sm'>
                {'>'} {mintBRiskFreeDeposited ? `Risk free bonded` : `Risk Free Deposit Opportunity`}
              </div>
            </div>
          </div>
          {dashboardWar?.end_time && <div className='text-red-3 text-lg'>
            {'>'} {warEnded ? `War Ended ${endedTimeAgo}` :  `Time Left ${timeLeft}`}
          </div>}

          <SearchMemeWars warArray={warArray} handleClick={handleClick} />

        </>

      }

    </div>
  );


};

export default Home;
