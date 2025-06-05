import React, { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import useIsMobile from '@/app/hooks/useIsMobile';
import { MemeWarList } from './MemeWarCard';
import { useSearchMemeWarState } from '@/app/api/searchMemeWarState';

//@ts-expect-error
const SearchMemeWars = ({ warArray, handleClick }) => {
  const [firstInput, setFirstInput] = useState<string>('');
  const [secondInput, setSecondInput] = useState<string>('');
  const [enableSearch, setEnableSearch] = useState<boolean>(false);

  const { data: searchResult, isError, error, isLoading } = useSearchMemeWarState(firstInput, secondInput, enableSearch);

  const queryClient = useQueryClient(); // To invalidate queries

  const clearSearchResults = () => {
    setFirstInput('');
    setSecondInput('');
    queryClient.invalidateQueries({
      queryKey: ['searchMemeWar', firstInput, secondInput],
    });

  }

  useEffect(() => {

    console.log(searchResult)


  }, [searchResult])

  const handleSearchButtonClicked = () => {

    setEnableSearch(true);
    setTimeout(() => {
      setEnableSearch(false);
    }, 1000);
  }

  const isMobile = useIsMobile()

  return (
    <>

      <div className='w-[60vw] sm:w-[90vw] flex gap-5 sm:gap-2 items-center h-20 sm:h-auto'>
        <div>
          <input
            value={firstInput}
            onChange={(e) => setFirstInput(e.target.value)}
            placeholder='Search By Token name or mint'
            className='bg-black h-10 border w-[20vw] sm:text-sm sm:w-[40vw] px-2 placeholder:text-sm' type='text' />
        </div>
        <div className='w-10 sm:w-auto'>
          AND
        </div>
        <div>
          <input
            value={secondInput}
            onChange={(e) => setSecondInput(e.target.value)}
            placeholder='Search By Token name or mint'
            className='bg-black h-10 border sm:text-sm sm:w-[40vw] w-[20vw] px-2' type='text' />
        </div>


        {!isMobile &&
          <div className='flex'>
            <div
              onClick={handleSearchButtonClicked}
              className=' cursor-pointer bg-white text-black px-6 py-2 '>
              Search
            </div>
            {(firstInput || secondInput) &&
              <div
                onClick={() => clearSearchResults()}
                className=' cursor-pointer bg-white text-black px-6 py-2 '>
                Clear
              </div>}</div>
        }


      </div>
      {
        isMobile && <div className='flex my-2 gap-4 w-[90vw]' >
          <div
            onClick={handleSearchButtonClicked}
            className=' cursor-pointer bg-white text-black px-6 py-2 '>
            Search
          </div>
          {(firstInput || secondInput) &&
            <div
              onClick={() => clearSearchResults()}
              className=' cursor-pointer bg-white text-black px-6 py-2 '>
              Clear
            </div>}
        </div>
      }
      {isLoading ? <div>Loading...</div> :
        searchResult && <MemeWarList
          warArray={searchResult}
          handleClick={handleClick}
        />}
      {error && <div>{error?.message}</div>}

      
    </>

  );
}

export default SearchMemeWars;
