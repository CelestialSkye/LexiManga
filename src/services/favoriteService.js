import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

export const useIsFavorited = (uid, mangaId) => {
  return useQuery({
    queryKey: ['favorites', uid, mangaId],
    queryFn: () => checkIfFavorited(uid, mangaId),
    enabled: !!uid && !!mangaId,
    staleTime: 0,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, mangaId, mangaData }) => toggleFavorite(uid, mangaId, mangaData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.uid, variables.mangaId] });
    },
  });
};

const checkIfFavorited = async (uid, mangaId) => {
  try {
    const favoriteRef = doc(db, 'users', uid, 'favorites', String(mangaId));
    const favoriteDoc = await getDoc(favoriteRef);
    return favoriteDoc.exists();
  } catch (error) {
    console.error('Error in checkIfFavorited:', error);
    return false;
  }
};

const toggleFavorite = async (uid, mangaId, mangaData) => {
  const favoriteRef = doc(db, 'users', uid, 'favorites', String(mangaId));
  const existingDoc = await getDoc(favoriteRef);

  if (existingDoc.exists()) {
    await deleteDoc(favoriteRef);
  } else {
    const favoriteData = {
      mangaId,
      title: mangaData.title?.english || mangaData.title?.romaji || 'Unknown',
      coverImage: mangaData.coverImage?.large || '',
      status: mangaData.status || 'Unknown',
      format: mangaData.format || 'Unknown',
      favoritedAt: new Date().toISOString(),
    };
    await setDoc(favoriteRef, favoriteData);
  }

  return { isFavorited: !existingDoc.exists() };
};

export const useFavoritedManga = (uid) => {
  return useQuery({
    queryKey: ['favoritedManga', uid],
    queryFn: () => getFavoritedManga(uid),
    enabled: !!uid,
    staleTime: 0,
  });
};

export const getFavoritedManga = async (uid) => {
  const favoritesRef = collection(db, 'users', uid, 'favorites');
  const favoritesSnapshot = await getDocs(favoritesRef);

  return favoritesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
