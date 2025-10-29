import { useQuery } from '@tanstack/react-query';
import { db } from "src/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from 'src/context/AuthContext';

const getUserFavourites = async (uid) => {
  const ref = collection(db, 'users', uid, 'favorites'); 
  const snap = await getDocs(ref);
  const favourites = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return favourites;
};

const FavouritesTab = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', uid],
    queryFn: () => getUserFavourites(uid),
    enabled: !!uid,
  });

  if (isLoading) return <p>Loading...</p>;
  if (!favorites || favorites.length === 0) return <p>No favorites found</p>;

  return (
    <div className="p-2 pb-4 rounded-[16px]">
      <h2 className="text-xl font-bold mb-6">Your Favorites</h2>
      <ul>
        {favorites.map(fav => (
          <li key={fav.id}>{fav.title ?? JSON.stringify(fav)}</li>
        ))}
      </ul>
    </div>
  );
};

export default FavouritesTab;
