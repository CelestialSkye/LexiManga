import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';

export default function Benefits() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);

  const benefits = [
    {
      id: 1,
      title: 'Learn From What You Love',
      subtitle: 'Turn your favorite stories into real, measurable language growth.',
      description:
        'Expand your vocabulary naturally by saving and studying words from the manga you are invested in and enjoying.',
    },
    {
      id: 2,
      title: 'Track Your Dual Journey',
      subtitle: 'Finally, a simple way to connect reading passion with learning success.',
      description:
        "Log the series you're reading, then track your learning journey with notes, scores, and specific reading progress.",
    },
    {
      id: 3,
      title: 'Capture Meaningful Words',
      subtitle: 'Build a powerful, personalized dictionary based only on your interests.',
      description:
        'Instantly save new vocabulary right as you encounter it—complete with the panel/sentence context.',
    },
    {
      id: 4,
      title: 'Get Instant Clarity',
      subtitle: 'Flexibility at your fingertips: speed up or slow down your learning pace.',
      description:
        'Use AI-powered translations for quick understanding, or easily input your own meanings for deeper engagement.',
    },
    {
      id: 5,
      title: 'Smart Review Decks (SRS)',
      subtitle: 'Master your vocabulary faster with Anki-inspired, spaced repetition.',
      description:
        'Your collected vocabulary automatically transforms into reviewable decks, ready for study anytime, anywhere.',
    },
    {
      id: 6,
      title: 'Never Lose Motivation',
      subtitle: 'See your efforts pay off: watch your vocabulary count grow week after week.',
      description:
        'Visual dashboards track words learned, review history, and your ongoing manga journey.',
    },
  ];

  return (
    <div className='mx-auto max-w-[95%] px-4 py-12 sm:px-6 md:max-w-[85%] md:px-8 md:py-20'>
      <h2 className='mb-8 text-center text-3xl font-bold text-gray-800 md:mb-12 md:text-4xl'>
        Why Learn with LexiManga?
      </h2>

      {/* Responsive grid: 1 column on mobile, 2 columns on desktop */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6'>
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 md:rounded-2xl md:p-8 md:shadow-lg md:hover:shadow-xl'
          >
            <h3 className='mb-2 text-lg font-bold text-gray-800 md:text-xl'>{benefit.title}</h3>
            <p className='mb-2 text-sm font-semibold text-purple-600 md:mb-4'>{benefit.subtitle}</p>
            <p className='text-gray-600 md:leading-relaxed'>{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
