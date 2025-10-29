import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
          if (previousData[key] !== newData[key]) {
            changes[key] = { from: previousData[key], to: newData[key] };
          }
        });
      }

      const activityPayload = {
        mangaId,
        mangaTitle: newData.mangaTitle,
        status: newData.status,
        data: newData,
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
      // Rollback to the previous value on error
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

export const deleteMangaStatus = async (uid, mangaId) => {
  try {
    if (!uid || !mangaId) {
      throw new Error('User ID and Manga ID are required');
    }

    const mangaDocRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
    await deleteDoc(mangaDocRef);

    // Log activity for deletion
    await logActivity('manga_delete', {
      mangaId,
      mangaTitle: null, // You might want to pass the title if available
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

    const result = await addDoc(collection(db, 'activities'), {
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
