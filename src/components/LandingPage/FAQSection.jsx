import { useState } from 'react';
import { Collapse, Paper, Text, Title, Divider } from '@mantine/core';

const FAQSection = () => {
  const [openedIndex, setOpenedIndex] = useState(null);

  const faqs = [
    {
      question: 'Can I read manga directly on your website or app?',
      answer:
        'No. This is strictly a vocabulary learning and tracking tool. You read your manga using your own sources (digital or physical), and then use the app to track your progress and capture words.',
    },
    {
      question: 'Does this app only support Japanese manga?',
      answer:
        'No, it supports 14 languages! The system is perfect for learning from manga, webtoons, or fan-made translations in languages like Korean, Spanish, French, and more.',
    },
    {
      question: 'How does the manga tracking feature work?',
      answer:
        'The site uses public databases (like the AniList API) to let you easily search, add, and log your reading progress, scores, and notes, connecting your language learning directly to your fandom.',
    },
    {
      question:
        'Can I learn vocabulary from translated manga (e.g., Japanese manga translated to French)?',
      answer:
        'Yes, absolutely. A key benefit is the ability to use manga that has been translated into the target language you are learning (whether official or fan-made). You capture words directly from that translated text.',
    },
    {
      question: 'How does saving words with context help me learn?',
      answer:
        "This is key! While AI provides quick translation, I recommend manually typing in the word's meaning and context (the source sentence). This deliberate effort creates strong memory connections and ensures you learn proper usage.",
    },
    {
      question: 'How do I input the words and context from my manga?',
      answer:
        'You capture words by manually typing the vocabulary and the relevant sentence/dialogue from your reading material into the app. This simple action is part of the deliberate practice required for effective memorization.',
    },
    {
      question: 'Is this app free, and what is the development commitment?',
      answer:
        'The app is completely free to use. Please note that this is a portfolio project; while I aim for a high-quality experience, maintenance, bug fixes, and future feature updates are not guaranteed and will be done as time permits.',
    },
    {
      question: 'Is this app available on mobile (iOS/Android)?',
      answer:
        'The app is web-based. It is optimized for use on modern browsers across desktop and mobile devices, allowing you to access your learning hub anywhere without needing a separate download.',
    },
    {
      question: 'Do I own the vocabulary I save, and can I export it?',
      answer:
        'Yes, the words you save are entirely yours. You can archive your entire vocabulary history and download a file containing all your words, context, and source details at any time from the settings menu.',
    },
    {
      question: 'Can I share my word decks with friends or other users?',
      answer:
        'Currently, your word decks are private and tied to your personalized learning journey. Deck sharing is not supported at this time, but it is a feature I may consider adding in the future.',
    },
  ];

  const toggle = (index) => {
    setOpenedIndex(openedIndex === index ? null : index);
  };

  return (
    <div className='mx-auto max-w-[95%] px-4 py-12 sm:px-6 md:max-w-[85%] md:px-8 md:py-20'>
      <h2 className='mb-8 text-center text-3xl font-bold text-gray-800 md:mb-12 md:text-4xl'>
        Frequently Asked Questions
      </h2>

      {faqs.map((faq, index) => (
        <Paper
          key={index}
          withBorder
          shadow='sm'
          radius='md'
          p='lg'
          mb='md'
          style={{ cursor: 'pointer' }}
          onClick={() => toggle(index)}
        >
          <Text fw={700} size='lg' c='gray.900'>
            {faq.question}
          </Text>

          <Collapse in={openedIndex === index}>
            <Text size='md' c='gray.700' lh='lg' mt='md'>
              {faq.answer}
            </Text>
          </Collapse>
        </Paper>
      ))}
    </div>
  );
};

export default FAQSection;
