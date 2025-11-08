import ReadTab from './ReadTab';
import VocabularyTab from './VocabularyTab';
import StaffTab from './StaffTab';
import CharactersTab from './CharactersTab';

const OverviewTab = ({ manga }) => {
  return (
    <div className='space-y-4'>
      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <h2 className='mb-4 text-xl font-bold'>Overview</h2>
        {manga.description && (
          <div
            className='leading-relaxed text-gray-700'
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
        )}
      </div>

      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <ReadTab manga={manga} />
      </div>

      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <VocabularyTab manga={manga} />
      </div>

      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <StaffTab manga={manga} />
      </div>

      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <CharactersTab manga={manga} />
      </div>
    </div>
  );
};

export default OverviewTab;
