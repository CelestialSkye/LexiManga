import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMangaDetails } from '../services/anilistApi';
import ScrollButtons from '../components/ScrollButtons';
import OverviewTab from '../features/manga/tabs/OverviewTab';
import ReadTab from '../features/manga/tabs/ReadTab';
import VocabularyTab from '../features/manga/tabs/VocabularyTab';
import StudyTab from '../features/manga/tabs/StudyTab';
import StaffTab from '../features/manga/tabs/StaffTab';
import CharactersTab from '../features/manga/tabs/CharactersTab';
import TopBar from '../components/TopBar';
import { useMediaQuery } from '@mantine/hooks';

const MangaPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useMangaDetails(id);
  const [activeTab, setActiveTab] = useState('overview');

  
  const isMobile = useMediaQuery('(max-width: 768px)'); 
  const isDesktop = useMediaQuery('(min-width: 769px)'); 

  

  // protection against invalid IDs
  if (!id || isNaN(Number(id))) {
    return <div className="page-container">Invalid manga ID</div>;
  }

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'read', label: 'Read' },
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'study', label: 'Study' },
    { id: 'staff', label: 'Staff' },
    { id: 'characters', label: 'Characters' },
  ];

  if (isLoading) return <div className="page-container">Loading...</div>;
  if (error) return <div className="page-container">Error: {error.message}</div>;
  if (!data?.data?.Media) return <div className="page-container">Manga not found</div>;

  const manga = data.data.Media; 

  return (
      <>
        {/* page background */}
        <div className='bg-white rounded-t-lg'> 
        {/*  banner section */}
        <div className={`relative w-full bg-white ${isMobile ? 'h-52' : 'h-96'}`}>
        {/* TopBar overlap with the banner */}
        <div className={`${isDesktop ? 'absolute top-0 left-0 right-0 z-10' : ''}`}>
          <TopBar />
        </div>
        {/* debug
        <div className="text-white bg-black p-2 text-xs">
          isMobile: {isMobile ? 'true' : 'false'} | Height: {isMobile ? 'h-52' : 'h-96'}
        </div> */}
        {manga.bannerImage && (
          <div className="mb-6">
            {isMobile ? (
              <img 
                src={manga.bannerImage} 
                alt={`${manga.title?.english || manga.title?.romaji} banner`}
                className="w-full h-52 object-cover object-center"
              />
            ) : (
              <img 
                src={manga.bannerImage} 
                alt={`${manga.title?.english || manga.title?.romaji} banner`}
                className="w-full h-96 object-cover object-center"
              />
            )}
            
          
            {manga.coverImage?.large && (
              <div className={`absolute ${isMobile ? '-bottom-14' : '-bottom-18'} flex items-end gap-4`}>
                <div className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(85vw,1200px))/2)]'}`}>
                  <img 
                    src={manga.coverImage.large} 
                    alt={manga.title?.english || manga.title?.romaji}
                    className={`${isMobile ? 'w-[96px] min-w-[96px] max-w-[96px]' : 'w-48'} h-[auto] object-cover rounded-[16px]`}
                  />
                </div>
                <div className="text-black">
                  <h1 className={`${isMobile ? 'text-base' : 'text-1xl'} font-bold mb-4 whitespace-nowrap`}>
                    {manga.title?.english || manga.title?.romaji}
                  </h1>
                  {manga.title?.english && manga.title.romaji !== manga.title.english && (
                    <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

             {/* Tab Navigation */}
             <div className="mb-2 mt-18 md:mt-18">
               {isDesktop ? (
                 <div className="ml-[calc((100vw-min(85vw,1200px))/2+192px)] mr-[calc((100vw-min(85vw,1200px))/2)] px-4">
                   <ScrollButtons
                     items={tabs}
                     activeItem={activeTab}
                     onItemClick={setActiveTab}
                   />
                 </div>
               ) : (
                 <div className="w-full px-4">
                   <ScrollButtons
                     items={tabs}
                     activeItem={activeTab}
                     onItemClick={setActiveTab}
                   />
                 </div>
               )}
             </div>
      </div>

      
             <div className="page-container">
               <div className="relative mt-6">
                 {/* left section - fixed position on desktop */}
                  {isDesktop && (
                    <div className="absolute left-0 w-48">
                      <div className="p-4 bg-white rounded-[16px] shadow-sm mt-0">
                       <h3 className="text-xs font-bold mb-3">Quick Info</h3>
                       <div className="space-y-2">
                         <div>
                           <span className="text-xs text-gray-600">Status:</span>
                           <span className="ml-2 text-xs">{manga.status || 'Unknown'}</span>
                         </div>
                         <div>
                           <span className="text-xs text-gray-600">Chapters:</span>
                           <span className="ml-2 text-xs">{manga.chapters || 'Unknown'}</span>
                         </div>
                         <div>
                           <span className="text-xs text-gray-600">Volumes:</span>
                           <span className="ml-2 text-xs">{manga.volumes || 'Unknown'}</span>
                         </div>
                         <div>
                           <span className="text-xs text-gray-600">Score:</span>
                           <span className="ml-2 text-xs">{manga.averageScore || 'N/A'}</span>
                         </div>
                         <div>
                           <span className="text-xs text-gray-600">Popularity:</span>
                           <span className="ml-2 text-xs">{manga.popularity || 'N/A'}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                {/* main container - positioned to the right of sidebar */}
                <div className={`w-full ${isDesktop ? 'ml-48 max-w-[calc(100%-192px)] pl-4 pr-4' : ''}`}>
           <div className='mt-0 pb-4 px-4 bg-white rounded-[16px] shadow-sm'>
  
      {/* scrollbuttons content (for now) */}
      <div className="mb-4">
        {activeTab === 'overview' && (
          <OverviewTab manga={manga} />
        )}
        
        <div className='mb-4'>
          {activeTab === 'read' && (
            <ReadTab manga={manga} />
          )}
          </div>
        
                 {activeTab === 'vocabulary' && (
                   <VocabularyTab manga={manga} />
                 )}
                 
                 {activeTab === 'study' && (
                   <StudyTab manga={manga} />
                 )}
                 
                 {activeTab === 'staff' && (
                   <StaffTab manga={manga} />
                 )}
                 
                 {activeTab === 'characters' && (
                   <CharactersTab manga={manga} />
                 )}
      </div>

      {/* Description
      {manga.description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
        </div>
      )} */}

            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default MangaPage;
    