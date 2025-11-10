import { useState } from 'react';
import LanguageSelect from '@components/LanguageSelect';
import { authService } from 'src/services';
import { useAuth } from 'src/context/AuthContext';

const LanguageTab = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setMessage('');
  };

  const handleSaveLanguage = async () => {
    if (!language) {
      setMessage('Error: Please select a language first');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      await authService.changeLanguageAndResetWords(user.uid, language);
      setMessage(`Success: Language changed to ${language}. Your vocabulary has been reset.`);
      setLanguage('');
    } catch (error) {
      console.error('Error changing language:', error);
      setMessage('Error: Failed to update language and reset words');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Language Selection Card */}
      <div className='rounded-[16px] bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-6 text-xl font-bold text-gray-900'>Change Target Language</h2>

        <div className='space-y-5'>
          <div>
            <label
              htmlFor='languageSelect'
              className='mb-3 block text-sm font-semibold text-gray-700'
            >
              Select Your Target Language
            </label>
            <LanguageSelect value={language} onChange={handleLanguageChange} required />
          </div>

          <div className='rounded-lg border border-violet-200 bg-violet-50 p-4'>
            <p className='text-sm text-blue-900'>
              <span className='font-semibold'>Note:</span> Changing your target language will reset
              all your current vocabulary words. This action cannot be undone.
            </p>
          </div>

          <button
            id='saveLanguageBtn'
            onClick={handleSaveLanguage}
            disabled={isSaving || !language}
            className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:shadow-md ${
              isSaving || !language
                ? 'cursor-not-allowed bg-gray-400 text-white opacity-75'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Language'}
          </button>

          {message && (
            <div
              className={`rounded-lg p-4 ${
                message.includes('Error')
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'border border-green-200 bg-green-50 text-green-700'
              }`}
            >
              <p className='text-sm'>{message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className='rounded-[16px] bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h3 className='mb-3 text-lg font-semibold text-gray-900'>Supported Languages</h3>
        <p className='text-sm text-gray-600'>
          We support a wide variety of languages including Japanese, Korean, Spanish, French,
          German, Italian, Portuguese, Russian, Turkish, Hindi, Bengali, Arabic, and many more.
        </p>
      </div>
    </div>
  );
};

export default LanguageTab;
