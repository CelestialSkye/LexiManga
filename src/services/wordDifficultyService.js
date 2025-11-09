import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useWordDifficulty = (word, language) => {
  return useQuery({
    queryKey: ['wordDifficulty', word, language],
    queryFn: () => getWordDifficulty(word, language),
    enabled: !!word && !!language,
    staleTime: 5 * 60 * 1000,
  });
};

export const getWordDifficulty = async (word, language) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/word-difficulty?word=${encodeURIComponent(word)}&language=${encodeURIComponent(language)}`
    );
    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to get word difficulty:', error);
    return { level: 'Hard', score: 3, source: 'fallback', frequency: 0 };
  }
};
