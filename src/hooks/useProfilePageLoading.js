import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useMangaStatuses } from '../services/useMangaStatuses';
import { useVocabWords } from '../services/vocabService';

export const useProfilePageLoading = () => {
  const { user } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch all data that the profile page needs (only on initial load)
  const { data: mangaStatus = [], isLoading: isScoresLoading } = useMangaStatuses(user?.uid);
  const { data: vocabWords = [], isLoading: isVocabLoading } = useVocabWords(user?.uid);

  // Determine if the page is loading
  useEffect(() => {
    // Page is loading if either scores or vocab data is still loading AND we haven't loaded yet
    const isLoading = (isScoresLoading || isVocabLoading) && !hasLoaded;
    setPageLoading(isLoading);

    // Mark as loaded once data has finished loading at least once
    if (!isScoresLoading && !isVocabLoading && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isScoresLoading, isVocabLoading, hasLoaded]);

  return {
    isLoading: pageLoading,
    user,
  };
};
