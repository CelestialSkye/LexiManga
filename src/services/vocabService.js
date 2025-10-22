import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

// get 1 word
export const useVocabWord = (uid, mangaId, wordId) => {
  return useQuery({
    queryKey: ['vocabWord', uid, mangaId, wordId],
    queryFn: () => getVocabWord(uid, mangaId, wordId),
    enabled: !!uid && !!mangaId && !!wordId,
    staleTime: 2 * 60 * 1000,
  });
};

// get all words
export const useVocabWords = (uid, disabled = false) => {
  return useQuery({
    queryKey: ['vocabWords', uid],
    queryFn: () => getVocabWords(uid),
    enabled: !!uid && !disabled,
    staleTime: 2 * 60 * 1000,
  });
};

// get words by manga
export const useVocabWordsByManga = (uid, mangaId, disabled = false) => {
  return useQuery({
    queryKey: ['vocabWordsByManga', uid, mangaId],
    queryFn: () => getVocabWordsByManga(uid, mangaId),
    enabled: !!uid && !!mangaId && !disabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, mangaId, wordId, wordData }) =>
      saveVocabWord(uid, mangaId, wordId, wordData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'vocabWord',
        variables.uid,
        variables.mangaId,
        variables.wordId,
      ]);
      queryClient.invalidateQueries(['vocabWords', variables.uid]);
      queryClient.invalidateQueries(['vocabWordsByManga', variables.uid, variables.mangaId]);
      queryClient.invalidateQueries(['vocabWords', variables.uid]);
    },
  });
};

export const useUpdateVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, mangaId, wordId, wordData }) =>
      updateVocabWord(uid, mangaId, wordId, wordData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'vocabWord',
        variables.uid,
        variables.mangaId,
        variables.wordId,
      ]);
      queryClient.invalidateQueries(['vocabWords', variables.uid]);
      queryClient.invalidateQueries(['vocabWordsByManga', variables.uid, variables.mangaId]);
    },
  });
};

export const useDeleteVocabWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, mangaId, wordId }) => deleteVocabWord(uid, mangaId, wordId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'vocabWord',
        variables.uid,
        variables.mangaId,
        variables.wordId,
      ]);
      queryClient.invalidateQueries(['vocabWords', variables.uid]);
      queryClient.invalidateQueries(['vocabWordsByManga', variables.uid, variables.mangaId]);
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

const updateVocabWord = async (uid, mangaId, wordId, wordData) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  const dataToUpdate = {
    ...wordData,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(vocabWordRef, dataToUpdate);
  return dataToUpdate;
};

const deleteVocabWord = async (uid, mangaId, wordId) => {
  const vocabWordRef = doc(db, 'users', uid, 'words', wordId);
  await deleteDoc(vocabWordRef);
  return { deleted: true };
};
