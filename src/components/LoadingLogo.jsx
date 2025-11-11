import React from 'react';

import logo from '../assets/logo.svg';

const LoadingLogo = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <img src={logo} alt='Loading' className='h-24 w-24 animate-pulse' />
    </div>
  );
};

export default LoadingLogo;
