import { Alert, Button, PasswordInput, Text, TextInput, Tooltip, Group } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';

import image3 from '../assets/landing/image3.jpg';
import logo from '../assets/logo.svg';
import { ActionButton } from '../components';
import LanguageSelect from '../components/LanguageSelect';
import { useAuth } from '../context/AuthContext';
import { extractErrorCode, getFirebaseErrorMessage } from '../utils/errorMessages';
import {
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  validatePasswordStrength,
} from '../utils/passwordValidator';

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
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
    strength: 'weak',
  });

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

    // Validate password strength before attempting registration
    const validation = validatePasswordStrength(password);
    setPasswordValidation(validation);

    if (!validation.isValid) {
      setLoading(false);
      setError(validation.errors[0] || 'Password does not meet requirements');
      return;
    }

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
    <div className='bg-white'>
      {/* 2-Column Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2' style={{ minHeight: '100vh' }}>
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
        <div
          className='flex flex-col justify-center overflow-y-auto px-4 py-3 md:px-12 md:py-0'
          style={{ maxHeight: '100vh' }}
        >
          <div className='w-full max-w-md py-3'>
            {/* Header with Logo */}
            <div className='mb-4 flex items-start gap-4'>
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
              <Alert color='red' className='mb-3' title='Error'>
                {error}
              </Alert>
            )}

            {/* Tab Buttons */}
            <div className='mb-4 flex gap-2 rounded-lg bg-gray-100 p-1'>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
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
              <form onSubmit={handleLogin} className='space-y-3'>
                <div>
                  <label className='mb-1 block text-xs font-medium text-gray-700'>Email</label>
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
                  <label className='mb-1 block text-xs font-medium text-gray-700'>Password</label>
                  <PasswordInput
                    placeholder='Your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant='default'
                    size='sm'
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
                <div className='mt-3 flex items-center justify-center gap-3'>
                  <ActionButton
                    type='submit'
                    loading={loading}
                    className='!text-md !rounded-[12px] !py-3'
                    size='lg'
                  >
                    Sign In
                  </ActionButton>
                  <button
                    type='button'
                    onClick={() => handleForgotPassword(email)}
                    className='rounded-[12px] border border-violet-200 px-4 py-3 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 hover:text-violet-700'
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )) ||
              null}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className='space-y-3'>
                <div>
                  <Group justify='space-between' align='center' mb={8}>
                    <label className='text-xs font-medium text-gray-700'>Email</label>
                    <Tooltip
                      label='Placeholder: This will explain email requirements'
                      position='top'
                      withArrow
                      multiline
                      w={200}
                    >
                      <IconInfoCircle size={16} style={{ cursor: 'pointer', color: '#9c36b5' }} />
                    </Tooltip>
                  </Group>
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
                  <label className='mb-1 block text-xs font-medium text-gray-700'>Password</label>
                  <PasswordInput
                    placeholder='Your password'
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Update password validation in real-time
                      if (activeTab === 'register') {
                        setPasswordValidation(validatePasswordStrength(e.target.value));
                      }
                    }}
                    required
                    variant='default'
                    size='sm'
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

                  {/* Password Strength Indicator (only show in register tab) */}
                  {activeTab === 'register' && password && (
                    <div className='mt-2 space-y-1'>
                      {/* Strength Bar */}
                      <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
                        <div
                          style={{
                            width: `${(passwordValidation.score / 6) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(passwordValidation.strength),
                            transition: 'width 0.3s ease',
                          }}
                          className='h-full'
                        />
                      </div>

                      {/* Strength Label and Errors in one line */}
                      <div className='text-xs'>
                        {passwordValidation.isValid ? (
                          <span
                            style={{ color: getPasswordStrengthColor(passwordValidation.strength) }}
                            className='font-medium'
                          >
                            ✓ {getPasswordStrengthLabel(passwordValidation.strength)}
                          </span>
                        ) : passwordValidation.errors.length > 0 ? (
                          <span className='text-red-600'>✗ {passwordValidation.errors[0]}</span>
                        ) : (
                          <span className='text-gray-600'>
                            Strength: {getPasswordStrengthLabel(passwordValidation.strength)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-1 block text-xs font-medium text-gray-700'>Nickname</label>
                  <TextInput
                    placeholder='Your nickname'
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className='violet-focus'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-xs font-medium text-gray-700'>
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
                  <label className='mb-1 block text-xs font-medium text-gray-700'>
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
                <ActionButton
                  type='submit'
                  loading={loading}
                  className='!text-md mt-3 w-full !rounded-[12px] !py-3'
                  size='lg'
                >
                  Sign Up
                </ActionButton>
              </form>
            )}

            {/* Back to Landing */}
            <div className='mt-4 flex flex-col gap-2'>
              <button
                onClick={() => navigate('/home')}
                className='rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700'
              >
                ← Go to Home Page
              </button>
              <button
                onClick={() => navigate('/')}
                className='rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100'
              >
                Back to Landing →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
