import { Drawer, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import defaultAvatar from '../../assets/defaultAvatar.jpg';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { getDailyActivities } from '../../services/dailyActivityService';
import { capitalizeFirstLetter } from '../../utils/formatUtils';

const TopBarMobile = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { profile, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dailyActivities, setDailyActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gesture tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (drawerOpen && user) {
      setLoading(true);
      getDailyActivities()
        .then((activities) => {
          setDailyActivities(activities);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching daily activities:', error);
          setLoading(false);
        });
    }
  }, [drawerOpen, user]);

  // Handle touch start
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = false;
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!drawerOpen) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchStartX.current - touchCurrentX;
    const diffY = touchStartY.current - touchCurrentY;

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isDraggingRef.current = true;
    }
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!drawerOpen || !isDraggingRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Drawer opens from right to left, so swiping right to left (positive diffX) closes it
    // User swipes from left to right to close: touchStartX is greater than touchEndX
    // This means diffX = touchStartX - touchEndX > 0 (positive value)
    // We need to reverse this: if user moves finger to the right (closing), touchEndX > touchStartX
    // So diffX should be negative (touchStartX - touchEndX < 0)
    const swipeDistance = touchEndX - touchStartX;

    // If user swiped to the right (positive swipeDistance > 50px), close the drawer
    if (swipeDistance > 50) {
      // User swiped right (closing the drawer)
      setDrawerOpen(false);
    }
  };

  // Attach touch handlers to document when drawer is open
  useEffect(() => {
    if (!drawerOpen) return;

    document.addEventListener('touchstart', handleTouchStart, true);
    document.addEventListener('touchmove', handleTouchMove, true);
    document.addEventListener('touchend', handleTouchEnd, true);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchmove', handleTouchMove, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
    };
  }, [drawerOpen]);

  if (!isMounted || !isMobile) return null;

  return (
    <>
      <div className='flex w-full items-center justify-center bg-white px-4 py-3 shadow-sm sm:px-6'>
        <div className='flex w-[95%] items-center justify-between md:w-[80%]'>
          {/* Left */}
          <div className='flex items-center'>
            <p className='text-sm'>
              <img src={logo} alt='Vocabulary Manga' className='h-9 w-9' />
            </p>{' '}
          </div>

          {/* Right  */}
          <div className='flex items-center'>
            {user ? (
              <img
                src={profile?.avatarUrl || defaultAvatar}
                alt='User Avatar'
                className='h-12 w-12 cursor-pointer rounded-[8px] object-cover ring-2 ring-violet-400 ring-offset-2 transition-all hover:ring-violet-500'
                onClick={() => setDrawerOpen(true)}
              />
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className='rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition-all hover:bg-violet-700'
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Stats Drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position='right'
        size='sm'
        withCloseButton={false}
      >
        <div className='space-y-4'>
          <div className='flex items-center gap-3 border-b pb-4'>
            <img
              src={profile?.avatarUrl || defaultAvatar}
              alt='User Avatar'
              className='h-16 w-16 rounded-[8px] object-cover'
            />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>
                Hello {capitalizeFirstLetter(profile?.nickname || 'User')}!
              </h2>
              <p className='text-sm text-gray-500'>
                {dailyActivities?.mangaAddedCount === 0 && dailyActivities?.addedWordsCount === 0
                  ? 'Start your learning today!'
                  : 'Keep up the great work!'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='space-y-3'>
            {/* Words Added Today */}
            <div className='rounded-lg bg-violet-50 p-4'>
              <p className='text-sm text-gray-600'>Words Added Today</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-violet-600'>
                  {dailyActivities?.addedWordsCount || 0}
                </p>
              )}
            </div>

            {/* Manga Added Today */}
            <div className='rounded-lg bg-violet-50 p-4'>
              <p className='text-sm text-gray-600'>Manga Added Today</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-violet-600'>
                  {dailyActivities?.mangaAddedCount || 0}
                </p>
              )}
            </div>

            {/* Learning Streak */}
            <div className='rounded-lg bg-violet-50 p-4'>
              <p className='text-sm text-gray-600'>Learning Streak</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-violet-600'>{dailyActivities?.streak || 0}</p>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default TopBarMobile;
