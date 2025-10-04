import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

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

export const useSearchManga = (query, limit = 10) => {
  return useQuery({
    queryKey: ['searchManga', query, limit],
    queryFn: () => searchManga(query, limit),  
    enabled: Boolean(query && query.length >= 2),
    staleTime: 5 * 60 * 1000,
  });
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

export const useMangaDetails = (id) => {
  return useQuery({
    queryKey: ['mangaDetails', id],
    queryFn: () => getMangaDetails(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Check if backend is healthy
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
