import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
    // Log activity for removing from favorites
    await logActivity('favorite_remove', {
      mangaId,
      title: mangaData.title?.english || mangaData.title?.romaji || 'Unknown',
      coverImage: mangaData.coverImage?.large || '',
    });
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
    // Log activity for adding to favorites
    await logActivity('favorite_add', {
      mangaId,
      title: favoriteData.title,
      coverImage: favoriteData.coverImage,
    });
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

/**
 * Log favorite activity to user's activity feed
 */
const logActivity = async (type, data) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user logged in for activity logging');
      return;
    }

    await addDoc(collection(db, 'users', user.uid, 'activities'), {
      type,
      ...data,
      userId: user.uid,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging favorite activity:', error);
  }
};
