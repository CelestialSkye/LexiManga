import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

export const useProfileStats = () => {
  const { user } = useAuth();
  const [wordCount, setWordCount] = useState(0);
  const [mangaCount, setMangaCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      const fetchStats = async () => {
        try {
          const words = await authService.getUserWordCount(user.uid);
          setWordCount(words);
        } catch (error) {}
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const fetchStats = async () => {
        try {
          const manga = await authService.getUserMangaCount(user.uid);
          setMangaCount(manga);
        } catch (error) {}
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const fetchStats = async () => {
        try {
          const learned = await authService.getUserLearnedWords(user.uid);
          setLearnedCount(learned);
        } catch (error) {}
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const fetchStats = async () => {
        try {
          const unknown = await authService.getUserUnknownWords(user.uid);
          setUnknownCount(unknown);
        } catch (error) {}
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const fetchStats = async () => {
        try {
          const learning = await authService.getUserLearningWords(user.uid);
          setLearningCount(learning);
        } catch (error) {}
      };
      fetchStats();
    }
  }, [user]);

  return { wordCount, mangaCount, learnedCount, unknownCount, learningCount };
};
