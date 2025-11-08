import { useMemo } from 'react';

/**
 * Aggregates loading states from all critical data sources on the manga page.
 * The page shows the loading screen until all critical data is loaded.
 */
const useMangaPageLoading = (isMangaLoading, isFavoritedLoading) => {
  const isLoading = useMemo(() => {
    return isMangaLoading || isFavoritedLoading;
  }, [isMangaLoading, isFavoritedLoading]);

  return isLoading;
};

export default useMangaPageLoading;
