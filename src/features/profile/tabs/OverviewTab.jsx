import ScoresTab from './ScoresTab';
import VocabularyTab from './VocabularyTab';
import FavouritesTab from './FavouritesTab';

const OverviewTab = ({ profile }) => {
  return (
    <div className='space-y-4'>
      {/* Scores section */}
      <div className='rounded-[16px] bg-white pt-4 pl-4 shadow-md'>
        <ScoresTab />
      </div>

      {/* Vocabulary section */}
      <div className='overflow-hidden rounded-[16px] bg-white shadow-md'>
        <VocabularyTab />
      </div>

      {/* Favourites section */}
      <div className='rounded-[16px] bg-white shadow-md'>
        <FavouritesTab />
      </div>
    </div>
  );
};

export default OverviewTab;
