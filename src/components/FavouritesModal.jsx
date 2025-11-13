import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from 'src/config/firebase';
import { useAuth } from 'src/context/AuthContext';
import { getFavoritedManga } from 'src/services/favoriteService';

const FavouritesModal = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const {
    data: favorites,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['favorites', uid],
    queryFn: () => getFavoritedManga(uid),
    enabled: !!uid,
  });

  const handleRemoveFavorite = async (e, mangaId) => {
    e.stopPropagation(); // Prevent navigation to manga page
    setDeletingId(mangaId);
    setDeleteError(null);

    try {
      const favoriteRef = doc(db, 'users', uid, 'favorites', String(mangaId));
      await deleteDoc(favoriteRef);
      // Refetch favorites list after deletion
      refetch();
    } catch (err) {
      console.error('Error removing favorite:', err);
      setDeleteError('Failed to remove favorite. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading favorites: {error.message}</p>;
  if (!favorites || favorites.length === 0) return <p>No favorites found</p>;

  return (
    <div>
      {deleteError && <div className='mb-4 rounded bg-red-100 p-3 text-red-700'>{deleteError}</div>}
      <ul>
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className='mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-gray-200 hover:bg-gray-50'
            onClick={() => navigate(`/manga/${fav.id}`)}
          >
            <div className='flex items-center gap-3'>
              {fav.coverImage && (
                <img
                  src={fav.coverImage}
                  alt={fav.title}
                  className='h-32 w-24 rounded-[16px] object-cover'
                />
              )}
              <div>
                <p className='font-medium'>{fav.title}</p>
              </div>
            </div>
            <Button
              variant='light'
              color='red'
              size='sm'
              onClick={(e) => handleRemoveFavorite(e, fav.id)}
              loading={deletingId === fav.id}
              leftSection={<IconTrash size={16} />}
              className='flex-shrink-0'
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavouritesModal;
