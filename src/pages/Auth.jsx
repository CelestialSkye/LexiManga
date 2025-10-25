import { useState } from 'react';
import { Container, Text, TextInput, PasswordInput, Button, Tabs, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components';
import LanguageSelect from '../components/LanguageSelect';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [nativeLang, setNativeLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(email, password, nickname, nativeLang, targetLang);
      navigate('/Home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  //handle forgot password
  const handleForgotPassword = async (email) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! Please check your inbox.");
  } catch (error) {
    console.error("Error sending reset email:", error.message);
    alert(error.message);
  }
};


  // Redirect if already logged in
  if (user) {
    navigate('/Home');
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center'>
      <Container size="sm" className="text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {/* Header */}
          <Text size="3xl" fw={700} className="text-gray-800 mb-8">
            Vocabulary Manga
          </Text>
          
          <Text size="lg" c="dimmed" className="text-gray-600 mb-8">
            Sign in to your account or create a new one
          </Text>

          {/* Error Alert */}
          {error && (
            <Alert color="red" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Auth Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <Tabs.List className="mb-6">
              <Tabs.Tab value="login">Sign In</Tabs.Tab>
              <Tabs.Tab value="register">Sign Up</Tabs.Tab>
            </Tabs.List>

            {/* Login Tab */}
            <Tabs.Panel value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
                
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <ActionButton 
                  type="submit" 
                  loading={loading}
                  className="w-full mt-6"
                >
                  Sign In
                </ActionButton>
                <ActionButton onClick={() => handleForgotPassword(email)}>Forgot Password?</ActionButton>
              </form>
            </Tabs.Panel>

            {/* Register Tab */}
            <Tabs.Panel value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
                
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <TextInput
                  label="Nickname"
                  placeholder="Your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />

                <LanguageSelect
                  label="Native Language"
                  placeholder="Select your native language..."
                  value={nativeLang}
                  onChange={setNativeLang}
                  required
                />

                <LanguageSelect
                  label="Target Language"
                  placeholder="Select language you want to learn..."
                  value={targetLang}
                  onChange={setTargetLang}
                  required
                />
                
                <ActionButton 
                  type="submit" 
                  loading={loading}
                  className="w-full mt-6"
                >
                  Sign Up
                </ActionButton>
              </form>
            </Tabs.Panel>
          </Tabs>

          {/* Back to Landing */}
          <div className="mt-6">
            <Button 
              variant="subtle" 
              onClick={() => navigate('/')}
              className="text-gray-500"
            >
              ← Back to Landing
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Auth;