import TopBar from '../components/TopBar';
import Trending from '../components/HomePage/Trending';
import TopBarMobile from '@components/HomePage/TopbarMobile';
import SuggestionManga from '@components/HomePage/SuggestedManga';
import MangaByGenre from '@components/HomePage/MangaByGenre';
import MonthlyManga from '@components/HomePage/MonthlyManga';

const Home = () => {
  return (
    <div className='!bg-white'>
      <div className='flex min-h-screen flex-col text-gray-900'>
        {/* Top Bar */}
        <header className='w-full'>
          <TopBar />
          <TopBarMobile />
        </header>

        {/* Main Content */}
        <main className='mx-auto max-w-[95%] flex-1 px-4 py-6 sm:px-6 md:max-w-[85%] md:px-8'>
          <MonthlyManga />
                    <h2 className='mb-3 text-lg font-semibold text-gray-800'>Trending Manga</h2>
          <Trending />
          <SuggestionManga />
          <MangaByGenre />
        </main>
      </div>
    </div>
  );
};

export default Home;
