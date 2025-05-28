import React from 'react';

import Image from 'next/image';

import VS from '@/public/vs.png';

const VsComponent = () => {
  return (
    <div className='relative'>
      <div className='rounded-full border absolute h-24 w-24 ml-2 mt-2 bg-green-400 opacity-30 blur-md animate-pulse duration-1500'>

      </div>
      <Image
        src={VS}
        alt="VS"
        className="!w-[120px] mt-[-10px]   !h-[140px] sm:w-10 sm:h-10"
      />
    </div>

  );
}

export default VsComponent;
