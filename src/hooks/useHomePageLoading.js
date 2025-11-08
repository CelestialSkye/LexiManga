import { useMemo } from 'react';
import { useTrendingManga, useSuggestedManga, useMonthlyManga } from '../services/anilistApi';

/**
 * Aggregates loading states from all critical components on the home page.
 * The page shows the loading screen until all critical data is loaded.
 */
const useHomePageLoading = () => {
  // Fetch data from all home page components
  // Note: These queries are called here to track loading state.
  // React Query caches results, so when child components call the same queries,
  // they get the cached data (no additional network requests).
  const { isLoading: trendingLoading } = useTrendingManga(10);
  const { isLoading: suggestedLoading } = useSuggestedManga(
    4,
    ['Romance', 'Comedy', 'Slice of Life', 'Drama'],
    ['Hentai', 'Ecchi', 'Action', 'Horror']
  );
  const { isLoading: monthlyLoading } = useMonthlyManga(15);

  // Aggregate all loading states
  const isLoading = useMemo(() => {
    return trendingLoading || suggestedLoading || monthlyLoading;
  }, [trendingLoading, suggestedLoading, monthlyLoading]);

  return isLoading;
};

export default useHomePageLoading;
