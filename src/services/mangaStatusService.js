import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '../config/firebase';
import { getMangaDetails } from './anilistApi';
import { AUTO_UPDATE_FIELDS } from './fsrsService';

export const useMangaStatus = (uid, mangaId) => {
  return useQuery({
    queryKey: ['mangaStatus', uid, mangaId],
    queryFn: () => getMangaStatus(uid, mangaId),
    enabled: !!uid && !!mangaId,
    staleTime: 0,
  });
};

const getMangaStatus = async (uid, mangaId) => {
  const statusRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
  const statusDoc = await getDoc(statusRef);
  return statusDoc.exists() ? statusDoc.data() : null;
};

export const useSaveMangaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, mangaId, statusData, isNew }) => {
      const previousData = await getMangaStatus(uid, mangaId);

      await saveMangaStatus(uid, mangaId, statusData);

      return { previousData, newData: statusData, isNew, mangaId, uid };
    },

    onMutate: async ({ uid, mangaId, statusData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['mangaStatus', uid, mangaId],
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(['mangaStatus', uid, mangaId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['mangaStatus', uid, mangaId], statusData);

      // Return context with the previous value
      return { previousStatus };
    },

    onSuccess: async ({ previousData, newData, isNew, mangaId, uid }) => {
      let changes = {};

      if (!isNew && previousData) {
        Object.keys(newData).forEach((key) => {
          // Skip auto-updated fields
          if (!AUTO_UPDATE_FIELDS.includes(key) && previousData[key] !== newData[key]) {
            changes[key] = { from: previousData[key], to: newData[key] };
          }
        });
      }

      let coverImage = null;
      try {
        const mangaDetails = await getMangaDetails(mangaId);
        coverImage =
          mangaDetails?.data?.Media?.coverImage?.large ??
          mangaDetails?.data?.Media?.coverImage?.medium ??
          null;
      } catch (err) {
        console.warn('Failed to fetch cover image:', err);
      }

      const activityPayload = {
        mangaId,
        mangaTitle: newData.mangaTitle,
        status: newData.status,
        coverImage,
      };

      if (!isNew && Object.keys(changes).length > 0) {
        activityPayload.changes = changes;
      }

      await logActivity(isNew ? 'manga_add' : 'manga_update', activityPayload);

      queryClient.invalidateQueries({
        queryKey: ['mangaStatus', uid, mangaId],
      });
    },

    onError: (error, variables, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ['mangaStatus', variables.uid, variables.mangaId],
          context.previousStatus
        );
      }
      console.error('Error saving manga status:', error);
    },
  });
};

const saveMangaStatus = async (uid, mangaId, statusData) => {
  const statusRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
  const now = new Date().toISOString();

  const dataToSave = {
    ...statusData,
    updatedAt: now,
    createdAt: statusData.createdAt || now,
  };

  await setDoc(statusRef, dataToSave);
  return dataToSave;
};

export const deleteMangaStatus = async (uid, mangaId, mangaTitle) => {
  try {
    if (!uid || !mangaId) {
      throw new Error('User ID and Manga ID are required');
    }

    let coverImage = null;
    try {
      const mangaDetails = await getMangaDetails(mangaId);
      coverImage =
        mangaDetails?.data?.Media?.coverImage?.large ??
        mangaDetails?.data?.Media?.coverImage?.medium ??
        null;
    } catch (err) {
      console.warn('Failed to fetch cover image:', err);
    }

    const mangaDocRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
    await deleteDoc(mangaDocRef);

    // Log activity for deletion
    await logActivity('manga_delete', {
      mangaId,
      mangaTitle,
      coverImage,
    });

    console.log(`Manga with ID ${mangaId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error('Error deleting manga:', error);
    throw error;
  }
};

const logActivity = async (type, data) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user logged in for activity logging');
      return;
    }

    console.log('Logging activity:', { type, data, userId: user.uid });

    const result = await addDoc(collection(db, 'users', user.uid, 'activities'), {
      type,
      ...data,
      userId: user.uid,
      timestamp: new Date(),
    });

    console.log('Activity logged successfully:', result.id);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
