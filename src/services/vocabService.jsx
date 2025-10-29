// External libraries
import { getAuth } from 'firebase/auth';
import { AUTO_UPDATE_FIELDS } from './fsrsService';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Internal modules
import { db } from '../config/firebase';

// get 1 word
export const useVocabWord = (uid, mangaId, wordId) => {
  return useQuery({
    queryKey: ['vocabWord', uid, mangaId, wordId],
    queryFn: () => getVocabWord(uid, mangaId, wordId),
    enabled: !!uid && !!mangaId && !!wordId,
    staleTime: 0,
  });
};

// get all words
export const useVocabWords = (uid, disabled = false) => {
  return useQuery({
    queryKey: ['vocabWords', uid],
    queryFn: () => getVocabWords(uid),
    enabled: !!uid && !disabled,
    staleTime: 0,
  });
};

// get words by manga
export const useVocabWordsByManga = (uid, mangaId, disabled = false) => {
  return useQuery({
    queryKey: ['vocabWordsByManga', uid, mangaId],
    queryFn: () => getVocabWordsByManga(uid, mangaId),
    enabled: !!uid && !!mangaId && !disabled,
    staleTime: 0,
  });
};

export const useAddVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uid, mangaId, wordId, wordData }) => {
      await saveVocabWord(uid, mangaId, wordId, wordData);
      await logActivity('word_add', {
        word: wordData.word,
        mangaTitle: wordData.mangaTitle,
        mangaId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uid, mangaId, wordId, wordData, isSRSUpdate = false }) => {
      const previousData = await getVocabWord(uid, mangaId, wordId); // Fetch existing data
      await updateVocabWord(uid, mangaId, wordId, wordData);
      return { previousData, newData: wordData };
    },
    onSuccess: async ({ previousData, newData }, variables) => {
      const { uid, mangaId, wordId } = variables;
      const changes = {};

      if (previousData) {
        Object.keys(newData).forEach(key => {
          if (previousData[key] !== newData[key]) {
            changes[key] = { from: previousData[key], to: newData[key] };
          }
        });

        await logActivity('word_update', {
          word: newData.word,
          mangaTitle: newData.mangaTitle,
          mangaId,
          wordId,
          changes, 
        });
      }

      queryClient.invalidateQueries({ queryKey: ['vocabWord', uid, mangaId, wordId] });
      queryClient.invalidateQueries({ queryKey: ['vocabWords', uid] });
      queryClient.invalidateQueries({ queryKey: ['vocabWordsByManga', uid, mangaId] });
    },
  });
};

  


export const useDeleteVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, mangaId, wordId }) => deleteVocabWord(uid, mangaId, wordId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vocabWord', variables.uid, variables.mangaId, variables.wordId],
      });
      queryClient.invalidateQueries({ queryKey: ['vocabWords', variables.uid] });
      queryClient.invalidateQueries({
        queryKey: ['vocabWordsByManga', variables.uid, variables.mangaId],
      });
    },
  });
};

// get 1 word
const getVocabWord = async (uid, mangaId, wordId) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  const vocabWordDoc = await getDoc(vocabWordRef);
  return vocabWordDoc.exists() ? vocabWordDoc.data() : null;
};

// get all words
const getVocabWords = async (uid) => {
  const wordsRef = collection(db, 'users', uid, 'words');
  const wordsSnapshot = await getDocs(wordsRef);

  return wordsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// get words by manga
const getVocabWordsByManga = async (uid, mangaId) => {
  const wordsRef = collection(db, 'users', uid, 'words');
  const wordsSnapshot = await getDocs(wordsRef);

  return wordsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((word) => word.mangaId === mangaId);
};

const saveVocabWord = async (uid, mangaId, wordId, wordData) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  const dataToSave = {
    ...wordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(vocabWordRef, dataToSave);
  return dataToSave;
};

//updating vocabword
const updateVocabWord = async (uid, mangaId, wordId, wordData) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  const dataToUpdate = {
    ...wordData,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(vocabWordRef, dataToUpdate);
  return dataToUpdate;
};

//deleting
const deleteVocabWord = async (uid, mangaId, wordId) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  await deleteDoc(vocabWordRef);
  return { deleted: true };
};

const logActivity = async (type, data) => {

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !AUTO_UPDATE_FIELDS.includes(key))
    );


    const result = await addDoc(collection(db, 'activities'), {
      type,
      ...filteredData,
      userId: user.uid,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('Error logging activity:', error);
  }
};


