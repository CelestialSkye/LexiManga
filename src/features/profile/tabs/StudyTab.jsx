import { SRSGame } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { useVocabWords } from '../../../services/vocabService';

const StudyTab = ({ profile }) => {
  const { user } = useAuth();

  const { data: words = [], isLoading } = useVocabWords(user?.uid);

  return (
    <div className='p-4'>
      <h2 className='mb-4 text-xl font-bold'>Study</h2>
      <SRSGame words={words} />
    </div>
  );
};

export default StudyTab;
