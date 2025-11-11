import FavouritesModal from '@components/FavouritesModal';
import { useAuth } from 'src/context/AuthContext';

const FavouritesTab = () => {
  const { user } = useAuth();

  if (!user) return <p>Please log in to view favorites</p>;

  return (
    <div className='p-4'>
      <h2 className='mb-4 text-xl font-bold'>Favourites</h2>
      <FavouritesModal></FavouritesModal>
    </div>
  );
};

export default FavouritesTab;
