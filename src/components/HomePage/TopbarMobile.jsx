import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Skeleton } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import { getDailyActivities } from '../../services/dailyActivityService';
import defaultAvatar from '../../assets/defaultAvatar.jpg';

const TopBarMobile = () => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { profile, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dailyActivities, setDailyActivities] = useState(null);
  const [loading, setLoading] = useState(false);

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

  if (!isMobile) return null;

  return (
    <>
      <div className='flex items-center justify-between bg-white px-4 py-3 shadow-sm'>
        {/* Left */}
        <div className='flex items-center'>
          <p className='text-sm font-semibold text-gray-800'>Lexicon</p>
        </div>

        {/* Right - Avatar */}
        <div className='flex items-center'>
          <img
            src={profile?.avatarUrl || defaultAvatar}
            alt='User Avatar'
            className='h-8 w-8 cursor-pointer rounded-full object-cover ring-2 ring-violet-400 ring-offset-2 transition-all hover:ring-violet-500'
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      {/* User Stats Drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position='right'
        title='Your Progress'
        size='sm'
      >
        <div className='space-y-4'>
          {/* User Greeting */}
          <div className='flex items-center gap-3 border-b pb-4'>
            <img
              src={profile?.avatarUrl || defaultAvatar}
              alt='User Avatar'
              className='h-16 w-16 rounded-full object-cover'
            />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>
                Hello {profile?.username || 'User'}! 👋
              </h2>
              <p className='text-sm text-gray-500'>
                {dailyActivities?.mangaStartedCount === 0 && dailyActivities?.addedWordsCount === 0
                  ? 'Start your learning today!'
                  : 'Keep up the great work!'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='space-y-3'>
            {/* Words Learned Today */}
            <div className='rounded-lg bg-violet-50 p-4'>
              <p className='text-sm text-gray-600'>Words Learned Today</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-violet-600'>
                  {dailyActivities?.learnedWordsCount || 0}
                </p>
              )}
            </div>

            {/* Words Added Today */}
            <div className='rounded-lg bg-blue-50 p-4'>
              <p className='text-sm text-gray-600'>Words Added Today</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-blue-600'>
                  {dailyActivities?.addedWordsCount || 0}
                </p>
              )}
            </div>

            {/* Manga Started */}
            <div className='rounded-lg bg-indigo-50 p-4'>
              <p className='text-sm text-gray-600'>Manga Started Today</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-indigo-600'>
                  {dailyActivities?.mangaStartedCount || 0}
                </p>
              )}
            </div>

            {/* Reading Streak */}
            <div className='rounded-lg bg-green-50 p-4'>
              <p className='text-sm text-gray-600'>Learning Streak</p>
              {loading ? (
                <Skeleton height={40} width='100%' mt='sm' />
              ) : (
                <p className='text-3xl font-bold text-green-600'>
                  {dailyActivities?.streak || 0} 
                </p>
              )}
            </div>

            {/* Activity Status */}
            {!loading && dailyActivities && (
              <div className='rounded-lg bg-orange-50 p-4'>
                <p className='text-sm text-gray-600'>Today's Status</p>
                <div className='mt-2 space-y-1 text-sm'>
                  {dailyActivities.readManga && <p className='text-orange-600'>✓ Manga Reading</p>}
                  {dailyActivities.addedWordsCount > 0 && (
                    <p className='text-orange-600'>✓ Words Added</p>
                  )}
                  {dailyActivities.learnedWordsCount > 0 && (
                    <p className='text-orange-600'>✓ Words Learned</p>
                  )}
                  {dailyActivities.mangaStartedCount === 0 &&
                    dailyActivities.addedWordsCount === 0 && (
                      <p className='text-gray-500'>No activity yet</p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default TopBarMobile;
