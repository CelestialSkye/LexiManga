import MangaByGenre from '@components/HomePage/MangaByGenre';
import MonthlyManga from '@components/HomePage/MonthlyManga';
import SuggestionManga from '@components/HomePage/SuggestedManga';
import TopBarMobile from '@components/HomePage/TopbarMobile';
import LoadingLogo from '@components/LoadingLogo';

import Trending from '../components/HomePage/Trending';
import TopBar from '../components/TopBar';
import useHomePageLoading from '../hooks/useHomePageLoading';

const Home = () => {
  const isLoading = useHomePageLoading();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className='!bg-white'>
      <div className='flex min-h-screen flex-col text-gray-900'>
        {/* Top Bar */}
        <header className='w-full'>
          <TopBar />
          <TopBarMobile />
        </header>

        {/* Main Content - Matches TopBar Width */}
        <main className='mx-auto w-[85%] max-w-[1200px] flex-1 px-8 py-6'>
          <MonthlyManga />
          <Trending />
          <SuggestionManga />
          <MangaByGenre />
        </main>
      </div>
    </div>
  );
};

export default Home;
