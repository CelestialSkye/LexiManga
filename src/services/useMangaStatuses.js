import { useQuery } from '@tanstack/react-query';
import { getDocs } from 'firebase/firestore';
import { collection } from 'firebase/firestore';

import { db } from '../config/firebase';
import { getMangaDetails } from './anilistApi';

export const useMangaStatuses = (uid) => {
  return useQuery({
    queryKey: ['mangaStatuses', uid],
    queryFn: () => fetchMangaStatuses(uid),
    enabled: !!uid,
    staleTime: 0,
  });
};

const fetchMangaStatuses = async (uid) => {
  const statusesRef = collection(db, 'users', uid, 'mangaStatus');
  const statusesSnapshot = await getDocs(statusesRef);

  const mangaStatusesWithDetails = await Promise.allSettled(
    statusesSnapshot.docs.map(async (doc) => {
      const mangaStatus = {
        id: doc.id,
        ...doc.data(),
      };

      try {
        if (mangaStatus.mangaId) {
          // Add timeout to prevent hanging
          const detailsPromise = getMangaDetails(mangaStatus.mangaId);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Details fetch timeout')), 10000)
          );

          const details = await Promise.race([detailsPromise, timeoutPromise]);
          const coverImage = details.data?.Media?.coverImage?.large;
          const anilistTitle =
            details.data?.Media?.title?.romaji || details.data?.Media?.title?.english;

          return {
            ...mangaStatus,
            coverImage,
            title: anilistTitle || mangaStatus.mangaTitle || 'Untitled',
          };
        }
      } catch (error) {
        // Silently fail and return basic data
        // Don't log errors to reduce console noise
      }

      return {
        ...mangaStatus,
        title: mangaStatus.mangaTitle || 'Untitled',
        coverImage: mangaStatus.coverImage || '',
      };
    })
  );

  // Filter out failed promises and extract values
  return mangaStatusesWithDetails
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
};
