import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import screenshot2 from '../../assets/landing/screenshot2.png';
import screenshot3 from '../../assets/landing/screenshot3.png';
import screenshot4 from '../../assets/landing/screenshot4.png';
import screenshot5 from '../../assets/landing/screenshot5.png';
import screenshot6 from '../../assets/landing/screenshot6.png';
import screenshot7 from '../../assets/landing/screenshot7.png';

export default function HowItWorks() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const steps = [
    {
      id: 1,
      title: 'Track Your Reading Hub',
      description:
        'Add the text or manga you are reading to your library. Log your chapter progress, scores, and notes in one unified hub for over 14 supported languages.',
      images: [screenshot2, screenshot3],
    },
    {
      id: 2,
      title: 'Capture & Contextualize',
      description:
        'Instantly save new words while you read. Get quick clarity with AI translations or input your own. Every word is tied to its source panel or sentence for strong, memorable context.',
      images: [screenshot4, screenshot5],
    },
    {
      id: 3,
      title: 'Review & Retain',
      description:
        'Your vocabulary automatically becomes a smart review deck. Use our Spaced Repetition System to schedule optimal reviews and lock in the knowledge for long-term mastery.',
      images: [screenshot6, screenshot7],
    },
  ];

  return (
    <div className='mx-auto max-w-[95%] px-4 py-6 sm:px-6 md:max-w-[95%] md:px-8 md:py-16'>
      <h2 className='mb-8 text-center text-3xl font-bold text-gray-800 md:mb-12 md:text-4xl'>
        How It Works
      </h2>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10'>
        {steps.map((step) => (
          <div key={step.id} className='flex flex-col' style={{ minHeight: '600px' }}>
            {/* Images for ID 1 only */}
            {step.id === 1 && step.images && (
              <div
                className='relative mb-6 flex w-full justify-center'
                style={{
                  gap: isMobile ? '2%' : '-8%',
                  height: isMobile ? '250px' : '350px',
                }}
              >
                <img
                  src={step.images[0]}
                  alt='Screenshot 2'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(-3%)' : 'translateX(-6%) rotate(-2deg)',
                    zIndex: 10,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />

                <img
                  src={step.images[1]}
                  alt='Screenshot 3'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] border border-gray-200 object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(3%)' : 'translateX(6%) rotate(2deg)',
                    zIndex: 5,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />
              </div>
            )}

            {/* Images for ID 2 only */}
            {step.id === 2 && step.images && (
              <div
                className='relative mb-6 flex w-full justify-center'
                style={{
                  gap: isMobile ? '2%' : '-8%',
                  height: isMobile ? '250px' : '350px',
                }}
              >
                <img
                  src={step.images[0]}
                  alt='Screenshot 4'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] border border-gray-200 object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(-3%)' : 'translateX(-6%) rotate(-2deg)',
                    zIndex: 10,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />

                <img
                  src={step.images[1]}
                  alt='Screenshot 5'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] border border-gray-200 object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(3%)' : 'translateX(6%) rotate(2deg)',
                    zIndex: 5,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />
              </div>
            )}

            {/* Images for ID 3 only */}
            {step.id === 3 && step.images && (
              <div
                className='relative mb-6 flex w-full justify-center'
                style={{
                  gap: isMobile ? '2%' : '-8%',
                  height: isMobile ? '250px' : '350px',
                }}
              >
                <img
                  src={step.images[0]}
                  alt='Screenshot 6'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] border border-gray-200 object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(-3%)' : 'translateX(-6%) rotate(-2deg)',
                    zIndex: 10,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />

                <img
                  src={step.images[1]}
                  alt='Screenshot 7'
                  className={`${
                    isMobile ? 'w-[48%]' : 'w-[45%]'
                  } h-full rounded-[16px] border border-gray-200 object-contain shadow-lg transition-transform duration-300`}
                  style={{
                    transform: isMobile ? 'translateX(3%)' : 'translateX(6%) rotate(2deg)',
                    zIndex: 5,
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                  }}
                />
              </div>
            )}

            {/* Card */}
            <div className='mt-4 w-full rounded-[16px] border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 md:p-8 md:shadow-lg md:hover:shadow-xl'>
              <h3 className='mb-2 text-lg font-bold text-purple-600 md:text-xl'>{step.title}</h3>
              <p className='text-sm text-gray-600 md:text-base'>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
