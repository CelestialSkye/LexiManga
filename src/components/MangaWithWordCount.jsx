import { useAuth } from '../context/AuthContext';
import { useVocabWordsByManga } from '../services/vocabService';
import { MangaTooltipContent } from './MangaTooltipContent';

/**
 * Wrapper component that fetches word count for a manga and passes it to MangaTooltipContent
 * Counts ALL words for the manga regardless of their status
 */
export function MangaTooltipWithWordCount({ manga }) {
  const { user } = useAuth();
  // Fetch all words for this manga (regardless of status)
  // Convert mangaId to string since it's stored as string in Firebase
  const { data: words, isLoading } = useVocabWordsByManga(user?.uid, String(manga.id), !user);

  // Count all words that belong to this manga
  const wordCount = Array.isArray(words) ? words.length : 0;

  return <MangaTooltipContent manga={manga} wordCount={wordCount} isLoadingWords={isLoading} />;
}
