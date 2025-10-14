import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const useMangaStatus = (uid, mangaId) => {
  return useQuery({
    queryKey: ['mangaStatus', uid, mangaId],
    queryFn: () => getMangaStatus(uid, mangaId),
    enabled: !!uid && !!mangaId,
    staleTime: 2 * 60 * 1000, 
  });
};

export const useSaveMangaStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, mangaId, statusData }) => 
      saveMangaStatus(uid, mangaId, statusData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['mangaStatus', variables.uid, variables.mangaId]);
    },
  });
};

const getMangaStatus = async (uid, mangaId) => {
    const statusRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
    const statusDoc = await getDoc(statusRef);
    return statusDoc.exists() ? statusDoc.data() : null;
};

const saveMangaStatus = async (uid, mangaId, statusData) => {
    const statusRef = doc(db, 'users', uid, 'mangaStatus', mangaId);
    
    const existingDoc = await getDoc(statusRef);
    
    const dataToSave = {
      ...statusData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
  };
  
  await setDoc(statusRef, dataToSave);
    
    return statusData;
};

