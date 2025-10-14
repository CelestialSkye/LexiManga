import { useState } from 'react';
import AddWordModal from '../../../components/AddWordModal';

const VocabularyTab = ({ manga }) => {
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  
  return (
    <div>
      <h2 className='mb-4 text-xl font-bold'>Vocabulary</h2>
      <button
        className='rounded-lg bg-violet-500 px-4 py-2 text-white transition-colors hover:bg-violet-600'
        onClick={() => setIsAddWordModalOpen(true)}
      >
        Add Word
      </button>
      <AddWordModal
        manga={manga}
        opened={isAddWordModalOpen}
        closeModal={() => setIsAddWordModalOpen(false)}
      />
    </div>
  );
};

export default VocabularyTab;