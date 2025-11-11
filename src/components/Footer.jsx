import { Group, Text } from '@mantine/core';
import { IconBrandGithub, IconBrandTwitter, IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';
import FeedbackModal from './FeedbackModal';

const Footer = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setFeedbackModalOpen(true);
  };

  const links = [
    { label: 'Feedback', href: '#', action: handleFeedbackClick },
    { label: 'GitHub', href: 'https://github.com', icon: IconBrandGithub },
  ];

  return (
    <>
      <footer className='mt-6 border-t border-gray-200 bg-white'>
        <div className='mx-auto max-w-[95%] px-4 py-8 sm:px-6 md:max-w-[85%] md:px-8'>
          <div className='flex items-center justify-between'>
            {/* Left: Logo */}
            <div className='flex items-center gap-3'>
              <img src={logo} alt='Lexicon Logo' className='h-10 w-10' />
              <div>
                <h3 className='font-bold text-gray-800'>Lexicon</h3>
              </div>
            </div>

            {/* Right: Links */}
            <div className='flex items-center gap-6'>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    onClick={(e) => {
                      if (link.action) {
                        e.preventDefault();
                        link.action();
                      }
                    }}
                    href={link.href}
                    target={link.href?.startsWith('http') ? '_blank' : undefined}
                    rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className='group flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-violet-600'
                  >
                    {Icon && (
                      <Icon size={16} className='transition-colors group-hover:text-violet-600' />
                    )}
                    {!Icon && link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className='mt-6 border-t border-gray-100 pt-6 text-center'>
            <p className='text-xs text-gray-500'>
              © {new Date().getFullYear()} Lexicon. Made with care for language learners.
            </p>
          </div>
        </div>
      </footer>

      <FeedbackModal opened={feedbackModalOpen} closeModal={() => setFeedbackModalOpen(false)} />
    </>
  );
};

export default Footer;
