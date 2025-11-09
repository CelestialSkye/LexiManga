import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';

export default function Benefits() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);

  const benefits = [
    {
      id: 1,
      title: 'Learn Vocabulary',
      description: 'Discover new words in context while reading manga',
      icon: '📚',
      span: 'col-span-1 row-span-1',
    },
    {
      id: 2,
      title: 'Multiple Languages',
      description: 'Learn vocabulary in English, Spanish, French, Japanese, and more',
      icon: '🌍',
      span: 'col-span-2 row-span-1',
    },
    {
      id: 3,
      title: 'Spaced Repetition',
      description: 'Reinforce learning with scientifically-proven spacing algorithms',
      icon: '🔄',
      span: 'col-span-1 row-span-2',
    },
    {
      id: 4,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed statistics',
      icon: '📈',
      span: 'col-span-1 row-span-1',
    },
    {
      id: 5,
      title: 'Curated Collections',
      description: 'Explore hand-picked manga and curated word lists',
      icon: '⭐',
      span: 'col-span-1 row-span-1',
    },
  ];

  if (isMobile) {
    return (
      <div className='px-4 py-12'>
        <h2 className='mb-8 text-center text-3xl font-bold text-gray-800'>
          Why Learn with Lexicon?
        </h2>
        <div className='space-y-4'>
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
            >
              <div className='mb-3 text-4xl'>{benefit.icon}</div>
              <h3 className='mb-2 text-lg font-bold text-gray-800'>{benefit.title}</h3>
              <p className='text-gray-600'>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='px-8 py-16'>
      <h2 className='mb-12 text-center text-4xl font-bold text-gray-800'>
        Why Learn with Lexicon?
      </h2>

      {/* Bento Grid */}
      <div className='mx-auto grid max-w-5xl grid-cols-3 gap-6'>
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className={`${benefit.span} rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl`}
          >
            <div className='mb-4 text-5xl'>{benefit.icon}</div>
            <h3 className='mb-3 text-xl font-bold text-gray-800'>{benefit.title}</h3>
            <p className='leading-relaxed text-gray-600'>{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
