import HeroBanner from '@components/HeroBanner';
import Benefits from '@components/LandingPage/Benefits';
import FAQSection from '@components/LandingPage/FAQSection';
import HeroBannerMobile from '@components/LandingPage/HeroBanner';
import HowItWorks from '@components/LandingPage/HowItWorks';
import NavBar from '@components/LandingPage/NavBar';
import { Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import image1 from '../assets/landing/image1.jpg';
import image2 from '../assets/landing/image2.jpg';
import screenshot from '../assets/landing/screenshot1.png';
import { ActionButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useResponsive();

  const handleGoToWebsite = () => {
    if (user) {
      navigate('/home');
    }
  };

  return (
    <div className='overflow-x-hidden bg-white'>
      <div className='mx-auto w-full md:w-[60%]'>
        <NavBar />
      </div>
      <HeroBanner></HeroBanner>
      <HeroBannerMobile />
      <Benefits />

      <section className='mx-auto mb-[150px] max-w-[95%] px-4 py-12 sm:px-6 md:max-w-[85%] md:px-8'>
        <div className='relative'>
          {/* Background Image */}
          <img
            src={image1}
            alt='Background'
            className='w-full scale-110 rounded-[16px]'
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
            }}
          />

          {/* Foreground Screenshot */}
          <img
            src={screenshot}
            alt='Landing page screenshot'
            className='absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-[35%] rounded-[16px] border border-gray-300'
          />
        </div>
      </section>
      <HowItWorks />
      <FAQSection />
      <section className='mx-auto mb-[150px] max-w-[95%] px-4 py-12 sm:px-6 md:max-w-[85%] md:px-8'>
        <div className='relative'>
          {/* Background Image */}
          <img
            src={image2}
            alt='Background'
            className='h-120 w-full rounded-[16px] object-cover'
            style={{
              objectPosition: 'bottom',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)',
            }}
          />

          {/* Overlay Text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center px-4 text-center'>
            <div className='absolute inset-0 rounded-[16px] bg-gradient-to-t from-black/60 via-black/20 to-transparent' />

            <h2
              className='relative text-4xl font-extrabold text-white md:text-4xl'
              style={{
                textShadow: `
        0 0 6px #8b5cf6,
        0 0 12px #7c3aed,
        0 0 18px rgba(124, 58, 237, 0.6)
      `,
              }}
            >
              Ready to level up your vocabulary through manga?
            </h2>

            <p
              className='relative mt-4 max-w-2xl text-lg font-semibold text-white md:text-xl'
              style={{
                textShadow: '0 0 6px #8b5cf6, 0 0 10px rgba(124,58,237,0.7)',
              }}
            >
              Track, learn, and grow your vocabulary in 14 languages while enjoying your favorite
              stories.
            </p>

            <button
              onClick={handleGoToWebsite}
              className='relative mt-8 rounded-full bg-purple-600 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-purple-700'
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
