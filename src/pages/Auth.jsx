import { useState, useEffect } from 'react';
import { Text, TextInput, PasswordInput, Button, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components';
import LanguageSelect from '../components/LanguageSelect';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useMediaQuery } from '@mantine/hooks';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { modals } from '@mantine/modals';
import { getFirebaseErrorMessage, extractErrorCode } from '../utils/errorMessages';
import logo from '../assets/logo.svg';
import image3 from '../assets/landing/image3.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [nativeLang, setNativeLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    setError('');

    try {
      await login(email, password);
      navigate('/home');
    } catch (error) {
      const errorCode = extractErrorCode(error.message);
      const friendlyMessage = getFirebaseErrorMessage(errorCode);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not loaded');
      }

      // Execute reCAPTCHA
      let token;
      try {
        token = await executeRecaptcha('register');
      } catch (error) {
        console.error('reCAPTCHA execution error:', error);
        token = null;
      }

      // Verify token on backend and register
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nickname,
          nativeLang,
          targetLang,
          recaptchaToken: token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // If backend verification passed, register with Firebase
      await register(email, password, nickname, nativeLang, targetLang);
      navigate('/home');
    } catch (error) {
      const errorMessage = error.message;
      // Check if it's a Firebase error or custom error
      const errorCode = extractErrorCode(errorMessage);
      const friendlyMessage = errorCode ? getFirebaseErrorMessage(errorCode) : errorMessage;
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  //handle forgot password
  const handleForgotPassword = async (emailInput) => {
    // Validate email is not empty
    if (!emailInput || emailInput.trim() === '') {
      modals.openConfirmModal({
        children: (
          <Text size='sm'>
            Please enter your email address in the <strong>Email field</strong> above, then click
            "Forgot Password?" to reset it.
          </Text>
        ),
        labels: { confirm: 'OK', cancel: 'Cancel' },
        confirmProps: { color: 'violet' },
        cancelProps: { style: { display: 'none' } },
        groupProps: { justify: 'flex-start' },
        centered: true,
        radius: '12px',
        size: 'sm',
        padding: '24px',
        title: 'Email Required',
        withCloseButton: false,
      });
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, emailInput);
      modals.openConfirmModal({
        children: (
          <Text size='sm'>
            Password reset email sent successfully! Please check your inbox and follow the link to
            reset your password.
          </Text>
        ),
        labels: { confirm: 'OK', cancel: 'Cancel' },
        confirmProps: { color: 'violet' },
        cancelProps: { style: { display: 'none' } },
        groupProps: { justify: 'flex-start' },
        centered: true,
        radius: '12px',
        size: 'sm',
        padding: '24px',
        title: 'Email Sent',
        withCloseButton: false,
      });
    } catch (error) {
      console.error('Error sending reset email:', error.message);
      modals.openConfirmModal({
        children: (
          <Text size='sm'>
            {error.message || 'Failed to send password reset email. Please try again.'}
          </Text>
        ),
        labels: { confirm: 'OK', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        cancelProps: { style: { display: 'none' } },
        groupProps: { justify: 'flex-start' },
        centered: true,
        radius: '12px',
        size: 'sm',
        padding: '24px',
        title: 'Error',
        withCloseButton: false,
      });
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Show reCAPTCHA badge ONLY on auth page
  useEffect(() => {
    const badge = document.querySelector('.grecaptcha-badge');

    // Show badge on auth page
    if (badge) {
      badge.style.visibility = 'visible';
      badge.style.display = 'block';
    }

    // Hide badge when leaving auth page
    return () => {
      if (badge) {
        badge.style.visibility = 'hidden';
        badge.style.display = 'none';
      }
    };
  }, []);

  return (
    <div className='min-h-screen bg-white'>
      {/* 2-Column Layout */}
      <div className='grid min-h-screen grid-cols-1 md:grid-cols-2'>
        {/* Left Section - Image */}
        {!isMobile && (
          <div className='relative hidden md:flex md:h-screen md:items-center md:justify-center'>
            {/* Placeholder Image */}
            <div className='h-full w-full overflow-hidden'>
              <img
                src={image3}
                className='h-full w-full object-cover'
                style={{ objectPosition: '26% center' }}
              />
            </div>
          </div>
        )}

        {/* Right Section - Form */}
        <div className='flex flex-col justify-center px-4 py-8 md:px-12 md:py-0'>
          <div className='w-full max-w-md pt-8'>
            {/* Header with Logo */}
            <div className='mb-8 flex items-start gap-4'>
              <img
                src={logo}
                alt='LexiManga Logo'
                className='h-12 w-12 flex-shrink-0 md:h-14 md:w-14'
              />
              <div className='flex flex-col justify-center'>
                <Text size='2xl' fw={700} className='text-gray-800'>
                  LexiManga
                </Text>
                <Text size='sm' c='dimmed' className='text-gray-600'>
                  {activeTab === 'login' ? 'Welcome back' : 'Start your journey'}
                </Text>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert color='red' className='mb-6' title='Error'>
                {error}
              </Alert>
            )}

            {/* Tab Buttons */}
            <div className='mb-8 flex gap-2 rounded-lg bg-gray-100 p-1'>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 rounded-md py-2 font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 rounded-md py-2 font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {(activeTab === 'login' && (
              <form onSubmit={handleLogin} className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>Email</label>
                  <TextInput
                    placeholder='your@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type='email'
                    className='violet-focus'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>Password</label>
                  <PasswordInput
                    placeholder='Your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant='default'
                    size='md'
                    styles={(theme) => ({
                      root: {
                        width: '100%',
                      },
                      input: {
                        width: '100%',
                        '&:focus': {
                          borderColor: `${theme.colors.violet[6]} !important`,
                          boxShadow: `inset 0 0 0 0.5px ${theme.colors.violet[6]} !important`,
                        },
                      },
                    })}
                  />
                </div>

                {/* Sign In and Forgot Password Buttons */}
                <div className='mt-6 flex justify-center gap-3'>
                  <ActionButton type='submit' loading={loading} buttonRounded='rounded-[12px]'>
                    Sign In
                  </ActionButton>
                  <button
                    type='button'
                    onClick={() => handleForgotPassword(email)}
                    className='rounded-[12px] px-4 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 hover:text-violet-700'
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )) ||
              null}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>Email</label>
                  <TextInput
                    placeholder='your@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type='email'
                    className='violet-focus'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>Password</label>
                  <PasswordInput
                    placeholder='Your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant='default'
                    size='md'
                    styles={(theme) => ({
                      root: {
                        width: '100%',
                      },
                      input: {
                        width: '100%',
                        '&:focus': {
                          borderColor: `${theme.colors.violet[6]} !important`,
                          boxShadow: `inset 0 0 0 0.5px ${theme.colors.violet[6]} !important`,
                        },
                      },
                    })}
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>Nickname</label>
                  <TextInput
                    placeholder='Your nickname'
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className='violet-focus'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Native Language
                  </label>
                  <LanguageSelect
                    placeholder='Select your native language...'
                    value={nativeLang}
                    onChange={setNativeLang}
                    required
                    className='violet-focus'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Target Language
                  </label>
                  <LanguageSelect
                    placeholder='Select language you want to learn...'
                    value={targetLang}
                    onChange={setTargetLang}
                    required
                    className='violet-focus'
                  />
                </div>

                {/* Sign Up Button */}
                <ActionButton type='submit' loading={loading} className='mt-6 w-full'>
                  Sign Up
                </ActionButton>
              </form>
            )}

            {/* Back to Landing */}
            <div className='mt-8 flex justify-center gap-2'>
              <button
                onClick={() => navigate('/')}
                className='text-sm font-medium text-gray-600 transition-colors hover:text-gray-800'
              >
                ← Back to Landing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
