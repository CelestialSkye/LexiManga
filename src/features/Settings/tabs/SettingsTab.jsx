import TopBar from '@components/TopBar';
import { useMediaQuery } from '@mantine/hooks';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'src/config/firebase';
import { useAuth } from "../../../context/AuthContext";
import { authService } from 'src/services';

const SettingsTab = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const { user } = useAuth();

  const handleArchiveWords = async () => {  
    if (!user?.uid) {
      alert('You must be logged in');
      return;
    }

    const userId = user.uid;
    const wordsCollection = collection(db, 'users', userId, 'words');
    const snapshot = await getDocs(wordsCollection);

    if (snapshot.empty) {
      alert('No words to archive');
      return;
    }

    let textContent = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      textContent += `Manga Name: ${data.mangaTitle || 'N/A'}  \nWord: ${data.word || 'N/A'}\nMeaning: ${data.translation || 'N/A'}\nExample: ${data.context|| 'N/A'}\n---\n`;
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
  };

  return (
    <div className='space-y-6 rounded-[16px] p-4'>
      <div className={`${isMobile ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
        <TopBar />
      </div>
      
      <div className='rounded-[12px] bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white'>
        <h2 className='text-lg font-semibold mb-4'>Archive Words</h2>
        <button
          onClick={handleArchiveWords}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
        >
          Archive Words
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
