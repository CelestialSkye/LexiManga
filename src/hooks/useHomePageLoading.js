import { useMemo, useEffect, useRef, useState } from 'react';
import { useTrendingManga, useSuggestedManga, useMonthlyManga } from '../services/anilistApi';

/**
 * Aggregates loading states from all critical components on the home page.
 * The page shows the loading screen until all critical data is loaded.
 * Enforces minimum 300ms display time to prevent flashing.
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
  const queriesLoading = useMemo(() => {
    return trendingLoading || suggestedLoading || monthlyLoading;
  }, [trendingLoading, suggestedLoading, monthlyLoading]);

  // Track when loading started to enforce minimum display time
  const [displayLoading, setDisplayLoading] = useState(true);
  const loadingStartedRef = useRef(true);

  useEffect(() => {
    if (queriesLoading) {
      // Queries are loading, show loading screen
      loadingStartedRef.current = true;
      setDisplayLoading(true);
    } else if (loadingStartedRef.current) {
      // Queries are done, but enforce minimum 300ms display time
      const timer = setTimeout(() => {
        setDisplayLoading(false);
        loadingStartedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [queriesLoading]);

  return displayLoading;
};

export default useHomePageLoading;
