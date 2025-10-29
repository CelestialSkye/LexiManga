import { useAuth } from 'src/context/AuthContext';
import FavouritesModal from '@components/FavouritesModal';

const FavouritesTab = () => {
  const { user } = useAuth();

  if (!user) return <p>Please log in to view favorites</p>;

    return (
    <div className="rounded-[16px] p-2 pb-4 ">
      <h2 className="text-xl font-bold mb-6 pr-4 pt-4 pb-4">Favourites</h2>
     <FavouritesModal></FavouritesModal>
     
    </div>
  )
};

export default FavouritesTab;
