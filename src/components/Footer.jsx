import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const Footer = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <>
      <footer className='border-t border-gray-200 bg-white px-4 py-6 text-center'>
        <p className='mb-3 text-sm text-gray-600'>
          © 2024 Lexicon. Made with care for language learners.
        </p>
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className='text-xs text-violet-600 underline transition-colors hover:text-violet-700'
        >
          Send Feedback
        </button>
      </footer>

      <FeedbackModal opened={feedbackModalOpen} closeModal={() => setFeedbackModalOpen(false)} />
    </>
  );
};

export default Footer;
