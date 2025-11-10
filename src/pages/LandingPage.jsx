import { Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { ActionButton } from '../components';
import HeroBanner from '@components/HeroBanner';
import HeroBannerMobile from '@components/LandingPage/HeroBanner';
import NavBar from '@components/LandingPage/NavBar';
import Benefits from '@components/LandingPage/Benefits';
import HowItWorks from '@components/LandingPage/HowItWorks';
import screenshot from '../assets/landing/screenshot1.png';
import image1 from '../assets/landing/image1.jpg';

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
 
      <section className='mx-auto mb-[150px] max-w-[95%] px-4 py-6 sm:px-6 md:max-w-[85%] md:px-8'>
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

    </div>
  );
};

export default LandingPage;
