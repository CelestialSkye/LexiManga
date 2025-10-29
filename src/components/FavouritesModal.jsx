import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'src/context/AuthContext';
import { getFavoritedManga } from 'src/services/favoriteService';


const FavouritesModal = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['favorites', uid],
    queryFn: () => getFavoritedManga(uid),
    enabled: !!uid,
  });



  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading favorites: {error.message}</p>;
  if (!favorites || favorites.length === 0) return <p>No favorites found</p>;

  return (


      <ul>
        {favorites.map((fav) => (
          <li key={fav.id} className='mb-3 flex items-center gap-3'>
            {fav.coverImage && (
              <img
                src={fav.coverImage}
                alt={fav.title}
                className='h-32 w-24  rounded object-cover'
              />
            )}
            <div>
              <p className='font-medium'>{fav.title}</p>
            </div>
          </li>
        ))}
      </ul>

  );
};

export default FavouritesModal;
