import TopBar from '../components/TopBar';
import Trending from '../components/HomePage/Trending';
import TopBarMobile from '@components/HomePage/TopbarMobile';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Top Bar */}
      <header className="w-full">
        <TopBar />
        <TopBarMobile/>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-6 sm:px-6 md:px-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Trending Manga</h2>
        <Trending />
      </main>
    </div>
  );
};

export default Home;
