import DOMPurify from 'dompurify';
import ReadTab from './ReadTab';
import VocabularyTab from './VocabularyTab';
import StaffTab from './StaffTab';
import CharactersTab from './CharactersTab';

const OverviewTab = ({ manga }) => {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedDescription = manga.description
    ? DOMPurify.sanitize(manga.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        ALLOW_DATA_ATTR: false,
      })
    : '';

  return (
    <div className='space-y-4'>
      <div className='rounded-[16px] bg-white p-4 shadow-md'>
        <h2 className='mb-4 text-xl font-bold'>Overview</h2>
        {sanitizedDescription && (
          <div
            className='leading-relaxed text-gray-700'
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
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
