import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { db } from 'src/config/firebase';

import { useAuth } from '../../../context/AuthContext';

const SettingsTab = () => {
  const { user } = useAuth();
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMessage, setArchiveMessage] = useState('');

  const handleArchiveWords = async () => {
    if (!user?.uid) {
      setArchiveMessage('Error: You must be logged in');
      return;
    }

    setIsArchiving(true);
    setArchiveMessage('');

    try {
      const userId = user.uid;
      const wordsCollection = collection(db, 'users', userId, 'words');
      const snapshot = await getDocs(wordsCollection);

      if (snapshot.empty) {
        setArchiveMessage('No words to archive');
        setIsArchiving(false);
        return;
      }

      let textContent = '';
      snapshot.forEach((doc) => {
        const data = doc.data();
        textContent += `Manga Name: ${data.mangaTitle || 'N/A'}  \nWord: ${data.word || 'N/A'}\nMeaning: ${data.translation || 'N/A'}\nExample: ${data.context || 'N/A'}\n---\n`;
      });

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'archived_words.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setArchiveMessage(`Successfully archived ${snapshot.size} word(s)`);
    } catch (error) {
      setArchiveMessage('Error: ' + error.message);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Archive Words Card */}
      <div className='rounded-[16px] bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-4 text-xl font-bold text-gray-900'>Archive Your Words</h2>

        <div className='space-y-4'>
          <p className='text-gray-600'>
            Export all your vocabulary words to a text file for backup or personal use.
          </p>

          <button
            onClick={handleArchiveWords}
            disabled={isArchiving}
            className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:shadow-md ${
              isArchiving
                ? 'cursor-not-allowed bg-gray-400 text-white opacity-75'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {isArchiving ? 'Archiving...' : 'Download Archive'}
          </button>

          {archiveMessage && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                archiveMessage.includes('Error')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              <p className='text-sm'>{archiveMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings Cards */}
      <div className='rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-4 text-xl font-bold text-gray-900'>More Settings Coming Soon</h2>

        <p className='text-gray-600'>
          Additional settings and options will be available here in the future (maybe).
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
