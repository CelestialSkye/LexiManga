import { Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components';
import HeroBanner from '@components/HeroBanner';
import HeroBannerMobile from '@components/LandingPage/HeroBanner';
import NavBar from '@components/LandingPage/NavBar';
import Benefits from '@components/LandingPage/Benefits';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoToWebsite = () => {
    if (user) {
      navigate('/home');
    }
  };

  return (
    <div className='overflow-x-hidden'>
      <div className='mx-auto w-full md:w-[60%]'>
        <NavBar />
      </div>
      <HeroBanner></HeroBanner>
      <HeroBannerMobile />
      <Benefits />
    </div>
  );
};

export default LandingPage;
