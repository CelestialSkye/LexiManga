import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
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
export const getSuggestedManga = async (limit = 4, genres = [], excludeGenres = []) => {
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
    .filter((m) => m.startDate?.year >= 2015)
    .map((m) => ({
      ...m,
      hiddenGemScore: (m.averageScore / 10) * 3 - m.popularity / 5000,
    }))
    .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore);

  const topGems = modernManga.slice(0, 15);
  const shuffled = topGems.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, limit);
};

// browse function
export const getBrowseManga = async (page = 1, filters = {}) => {
  const { search, genre, sort = 'POPULARITY_DESC', status, year } = filters;

  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genres: [String], $sort: [MediaSort], $statusIn: [MediaStatus], $excludeGenres: [String]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(
          type: MANGA,
          search: $search,
          genre_in: $genres,
          genre_not_in: $excludeGenres,
          sort: $sort,
          status_in: $statusIn
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
          genres
          status
          chapters
          description
          popularity
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

  // Determine which statuses to filter by
  let statusInValues = null;
  if (status) {
    // If a specific status is selected, use only that
    statusInValues = [status];
  } else if (search) {
    // When searching without a status filter, include both RELEASING and FINISHED
    statusInValues = ['RELEASING', 'FINISHED'];
  } else {
    // When not searching and no status filter, also include both
    statusInValues = ['RELEASING', 'FINISHED'];
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        page,
        perPage: 20,
        search: search || null,
        genres: genre ? [genre] : null,
        excludeGenres: ['Hentai', 'Ecchi'],
        sort: [sort],
        statusIn: statusInValues,
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'Failed to fetch manga');
  }

  let media = json.data?.Page?.media || [];

  // Client-side filtering by year since AniList doesn't support startDate_greater
  if (year && year !== '' && !isNaN(parseInt(year))) {
    const yearInt = parseInt(year);
    media = media.filter((m) => m.startDate?.year >= yearInt);
  }

  console.log(
    'First 3 results:',
    media.slice(0, 3).map((m) => ({
      title: m.title.english || m.title.romaji,
      popularity: m.popularity,
      year: m.startDate?.year,
    }))
  );

  return {
    ...json.data.Page,
    media: media,
  };
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
  getSuggestedManga,
  useSuggestedManga,
  getBrowseManga,
  useBrowseManga,
  checkHealth,
};

export default anilistApi;
