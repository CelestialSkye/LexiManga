import { useQuery } from '@tanstack/react-query';
import { db } from '../config/firebase';
import { getDocs } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { getMangaDetails } from './anilistApi';

export const useMangaStatuses = (uid) => {
  return useQuery({
    queryKey: ['mangaStatuses', uid],
    queryFn: () => fetchMangaStatuses(uid),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, 
  });
};

const fetchMangaStatuses = async (uid) => {
  const statusesRef = collection(db, 'users', uid, 'mangaStatus');
  const statusesSnapshot = await getDocs(statusesRef);

  const mangaStatusesWithDetails = await Promise.all(
    statusesSnapshot.docs.map(async (doc) => {
      const mangaStatus = {
        id: doc.id,
        ...doc.data(),
        title: doc.data() 
      };

      try {
        if (mangaStatus.mangaId) {
          const details = await getMangaDetails(mangaStatus.mangaId);
          const coverImage = details.data?.Media?.coverImage?.large;
          const anilistTitle = details.data?.Media?.title?.romaji || details.data?.Media?.title?.english;
         
          return {
            ...mangaStatus,
            coverImage,
            title: anilistTitle || mangaStatus.
mangaTitle || 'Untitled',
          };
        }
      } catch (error) {
        console.error(`Error fetching details for manga ${mangaStatus.id}:`, error);
      }

      return {
        ...mangaStatus,
        title: mangaStatus.mangaTitle || 'Untitled',
      };
    })
  );

  return mangaStatusesWithDetails;
};
