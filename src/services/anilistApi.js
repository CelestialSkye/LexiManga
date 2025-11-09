import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BASE_URL = 'https://graphql.anilist.co';

/**
 * Search for manga
 */
export const searchManga = async (query, limit = 10) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Get manga details by ID
 */
export const getMangaDetails = async (id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/manga/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch manga');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Manga details error:', error);
    throw error;
  }
};

export const useTrendingManga = (limit = 10) => {
  return useQuery({
    queryKey: ['trendingManga', limit],
    queryFn: () => getTrendingManga(limit),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useMonthlyManga = (limit = 15) => {
  return useQuery({
    queryKey: ['monthlyManga', limit],
    queryFn: () => getMonthlyManga(limit),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// for suggested manga
export const useSuggestedManga = (limit = 2, genres = [], excludeGenres = []) => {
  return useQuery({
    queryKey: ['suggestedManga', limit, genres, excludeGenres],
    queryFn: () => getSuggestedManga(limit, genres, excludeGenres),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const getTrendingManga = async (limit = 10) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/trending?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch trending manga');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Trending manga error:', error);
    throw error;
  }
};

export const getMonthlyManga = async (limit = 15) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/monthly?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch monthly manga');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Monthly manga error:', error);
    throw error;
  }
};

//suggested manga
export const getSuggestedManga = async (limit = 4, genres = [], excludeGenres = []) => {
  try {
    const genreString = genres.join(',');
    const excludeString = excludeGenres.join(',');

    const params = new URLSearchParams({
      limit,
      ...(genreString && { genres: genreString }),
      ...(excludeString && { excludeGenres: excludeString }),
    });

    const response = await fetch(`${BACKEND_URL}/api/suggested?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch suggested manga');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Suggested manga error:', error);
    throw error;
  }
};

// browse function
export const getBrowseManga = async (page = 1, filters = {}) => {
  try {
    const { search = '', genre = '', sort = 'POPULARITY_DESC', status = '', year = '' } = filters;

    const params = new URLSearchParams({
      page,
      ...(search && { search }),
      ...(genre && { genre }),
      sort,
      ...(status && { status }),
      ...(year && { year }),
    });

    const response = await fetch(`${BACKEND_URL}/api/browse?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch browse manga');
    }

    const result = await response.json();

    return {
      pageInfo: result.pageInfo,
      media: result.media,
    };
  } catch (error) {
    console.error('Browse manga error:', error);
    throw error;
  }
};

// browse hook
export const useBrowseManga = (page = 1, filters = {}) => {
  return useQuery({
    queryKey: ['browseManga', page, filters],
    queryFn: () => getBrowseManga(page, filters),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true,
    retry: 2,
  });
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export const useSearchManga = (query, limit = 10) => {
  return useQuery({
    queryKey: ['searchManga', query, limit],
    queryFn: () => searchManga(query, limit),
    enabled: Boolean(query && query.length >= 2),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMangaDetails = (id) => {
  return useQuery({
    queryKey: ['mangaDetails', id],
    queryFn: () => getMangaDetails(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

const anilistApi = {
  searchManga,
  useSearchManga,
  getMangaDetails,
  useMangaDetails,
  getTrendingManga,
  useTrendingManga,
  getMonthlyManga,
  useMonthlyManga,
  getSuggestedManga,
  useSuggestedManga,
  getBrowseManga,
  useBrowseManga,
  checkHealth,
};

export default anilistApi;
