import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
const BASE_URL = 'https://graphql.anilist.co';

/**
 * Search for manga
 */
export const searchManga = async (query, limit = 10) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
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
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: MANGA, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          staff(sort: RELEVANCE, perPage: 10) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { perPage: limit } }),
  });
  const json = await response.json();
  return json.data.Page.media;
};

//suggested manga
export const getSuggestedManga = async (limit = 2, genres = [], excludeGenres = []) => {
  const query = `
    query ($perPage: Int, $genres: [String], $excludeGenres: [String]) {
      Page(perPage: $perPage) {
        media(
          type: MANGA, 
          sort: [POPULARITY_DESC],
          genre_in: $genres,
          genre_not_in: $excludeGenres,
          averageScore_greater: 75,
          popularity_greater: 3000,
          popularity_lesser: 50000,
          status_in: [RELEASING, FINISHED]
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          popularity
          trending
          genres
          description
          chapters
          status
          startDate {
            year
          }
          staff(sort: RELEVANCE, perPage: 5) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        perPage: 30,
        genres: genres.length ? genres : null,
        excludeGenres: excludeGenres.length ? excludeGenres : null,
      },
    }),
  });

  const json = await response.json();
  
  const modernManga = json.data.Page.media
    .filter(m => m.startDate?.year >= 2015)
    .map(m => ({
      ...m,
      hiddenGemScore: (m.averageScore / 10) * 3 - (m.popularity / 5000)
    }))
    .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore);

  const topGems = modernManga.slice(0, 15);
  const shuffled = topGems.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, limit);
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
  checkHealth,
};

export default anilistApi;
