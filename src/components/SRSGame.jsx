import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Text, Button, Group, Badge, Progress, Stack, Select } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { createEmptyCard, FSRS, Rating } from 'ts-fsrs';
import { useVocabWordsByManga, useUpdateVocabWord, useVocabWords } from '../services/vocabService';

const SRSGame = ({ manga, words: initialWords }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedMangaFilter, setSelectedMangaFilter] = useState('');
  const [totalCards, setTotalCards] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const timerRef = useRef(null);

  const fsrs = new FSRS();
  const updateWordMutation = useUpdateVocabWord();

  // Determine if we're in profile mode (no manga object) or manga mode
  const isProfileMode = !manga && initialWords;

  // use vocabulary service based on mode
  const {
    data: userWords,
    isLoading: loadingByManga,
    error: errorByManga,
  } = useVocabWordsByManga(user?.uid, manga?.id?.toString(), isProfileMode);

  const {
    data: allUserWords,
    isLoading: loadingAll,
    error: errorAll,
  } = useVocabWords(user?.uid, isProfileMode);

  const isLoading = isProfileMode ? loadingAll : loadingByManga;
  const error = isProfileMode ? errorAll : errorByManga;

  // Get words based on mode - memoized to prevent infinite loops
  const words = useMemo(() => {
    if (isProfileMode && allUserWords) {
      // If selectedMangaFilter is empty string or null, show all words
      if (selectedMangaFilter && selectedMangaFilter !== '' && selectedMangaFilter !== null) {
        return allUserWords.filter((w) => String(w.mangaId) === selectedMangaFilter);
      }
      return allUserWords;
    }
    return userWords || [];
  }, [isProfileMode, allUserWords, userWords, selectedMangaFilter]);

  // Get unique manga for filter dropdown in profile mode
  const getMangaOptions = () => {
    if (!allUserWords) return [];
    const mangaMap = new Map();
    allUserWords.forEach((word) => {
      if (word.mangaId && word.mangaTitle && typeof word.mangaTitle === 'string') {
        mangaMap.set(word.mangaId, word.mangaTitle);
      }
    });
    const options = Array.from(mangaMap, ([id, title]) => ({
      value: String(id),
      label: typeof title === 'string' ? title : String(title),
    }));
    // Add "All Mangas" option at the beginning
    return [{ value: '', label: 'All Mangas' }, ...options];
  };

  // Load and filter cards when session starts
  useEffect(() => {
    if (!sessionActive || !words || words.length === 0) {
      return;
    }

    const cardsWithSRS = words.map((word) => {
      const hasValidSRS =
        word.due &&
        word.stability !== undefined &&
        !isNaN(word.stability) &&
        !isNaN(word.difficulty) &&
        !isNaN(word.scheduled_days);

      if (hasValidSRS) {
        return {
          due: new Date(word.due),
          stability: word.stability,
          difficulty: word.difficulty,
          elapsed_days: word.elapsed_days || 0,
          scheduled_days: word.scheduled_days || 0,
          reps: word.reps || 0,
          lapses: word.lapses || 0,
          learning_steps: word.learning_steps || 0,
          state: word.state || 0,
          last_review: word.last_review ? new Date(word.last_review) : undefined,
          wordData: word,
        };
      } else {
        const newCard = createEmptyCard();
        const now = new Date();
        newCard.due = now;
        newCard.last_review = undefined;
        return {
          ...newCard,
          wordData: word,
        };
      }
    });

    const now = new Date();
    const dueCards = cardsWithSRS.filter((card) => {
      const dueDate = new Date(card.due);
      return dueDate <= now;
    });

    setCards(dueCards);
    setTotalCards(dueCards.length);
    setCurrentCardIndex(0);

    if (dueCards.length === 0) {
      setShowCompletionMessage(true);
    }
  }, [sessionActive, words]);

  // Separate effect to handle hiding completion message after 2 seconds
  useEffect(() => {
    if (!showCompletionMessage) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setSessionActive(false);
      setShowCompletionMessage(false);
      timerRef.current = null;
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [showCompletionMessage]);

  const handleAnswer = async (rating) => {
    if (currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];
    const now = new Date();

    // Validate the current card before processing
    if (isNaN(currentCard.stability) || isNaN(currentCard.difficulty)) {
      console.error('Corrupted card detected, resetting:', currentCard);
      // Reset the card to a fresh state
      const freshCard = createEmptyCard();
      freshCard.due = now;
      freshCard.wordData = currentCard.wordData;

      // Update the cards array with the fresh card
      const updatedCards = [...cards];
      updatedCards[currentCardIndex] = freshCard;
      setCards(updatedCards);

      return;
    }

    const result = fsrs.repeat(currentCard, now);

    const recordItem = result[rating];

    if (!recordItem) {
      console.error('Invalid rating or result:', { rating, result });
      return;
    }

    const newCard = recordItem.card;

    // ensure the due date is valid
    if (!newCard.due || isNaN(new Date(newCard.due).getTime())) {
      console.error('Invalid due date from FSRS:', newCard);
      return;
    }

    setShowAnswer(false);

    // save the updated srs data to firestore
    updateWordMutation.mutate({
      uid: user.uid,
      mangaId: currentCard.wordData.mangaId,
      wordId: currentCard.wordData.id,
      wordData: {
        ...currentCard.wordData,
        due: new Date(newCard.due).toISOString(),
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        elapsed_days: newCard.elapsed_days,
        scheduled_days: newCard.scheduled_days,
        reps: newCard.reps,
        lapses: newCard.lapses,
        state: newCard.state,
        last_review: newCard.last_review
          ? new Date(newCard.last_review).toISOString()
          : now.toISOString(),
      },
      isSRSUpdate: true,
    });

    const newCards = cards.filter((_, index) => index !== currentCardIndex);
    setCards(newCards);

    if (newCards.length === 0) {
      setShowCompletionMessage(true);
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setSessionActive(false);
        setShowCompletionMessage(false);
        timerRef.current = null;
      }, 2000);
    } else if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  if (!user) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text ta='center' c='dimmed'>
          Please log in to study
        </Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text ta='center' c='dimmed'>
          Loading your vocabulary words...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text ta='center' c='red'>
          Error loading words: {error.message}
        </Text>
      </Card>
    );
  }

  if (!allUserWords || allUserWords.length === 0) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text ta='center' c='dimmed'>
          No vocabulary words found. Add some words first!
        </Text>
      </Card>
    );
  }

  // Show completion message (auto-hides after 2 seconds)
  if (showCompletionMessage) {
    return (
      <div className='mx-auto max-w-3xl p-4'>
        <Card shadow='md' padding='lg' radius='md' withBorder>
          <Stack gap='md'>
            <div className='text-center'>
              <Text ta='center' c='violet' size='md' fw={700}>
                All caught up!
              </Text>
              <Text ta='center' c='dimmed' mt='sm' size='sm'>
                No cards are due for review right now. Check back later!
              </Text>
            </div>
          </Stack>
        </Card>
      </div>
    );
  }

  // If not in a session, show start screen with filters
  if (!sessionActive || cards.length === 0) {
    const mangaOptions = getMangaOptions();

    return (
      <div className='mx-auto max-w-3xl p-4'>
        <Card shadow='md' padding='lg' radius='md' withBorder>
          <Stack gap='md'>
            {isProfileMode && mangaOptions.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Select
                    label='Filter by Manga (optional)'
                    placeholder='Study all words'
                    data={mangaOptions}
                    value={selectedMangaFilter}
                    onChange={(value) => {
                      setSelectedMangaFilter(value);
                    }}
                    clearable
                    searchable
                    size='sm'
                  />
                </div>
                <Button
                  size='md'
                  onClick={() => {
                    setSessionActive(true);
                  }}
                  style={{ height: '36px' }}
                >
                  Start
                </Button>
              </div>
            )}

            {(!isProfileMode || mangaOptions.length === 0) && (
              <Button
                fullWidth
                size='md'
                onClick={() => {
                  setSessionActive(true);
                }}
              >
                Start Study Session
              </Button>
            )}
          </Stack>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const mangaOptions = getMangaOptions();

  return (
    <div className='mx-auto max-w-3xl p-4'>
      <Card shadow='md' padding='lg' radius='md' withBorder>
        <Stack gap='md'>
          {isProfileMode && mangaOptions.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Select
                  label='Filter by Manga (optional)'
                  placeholder='Study all words'
                  data={mangaOptions}
                  value={selectedMangaFilter}
                  onChange={(value) => {
                    setSelectedMangaFilter(value);
                    setSessionActive(false);
                    setCurrentCardIndex(0);
                    setShowAnswer(false);
                  }}
                  clearable
                  searchable
                  size='sm'
                />
              </div>
              <Button
                size='md'
                onClick={() => {
                  setSessionActive(false);
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                }}
                style={{ height: '36px' }}
              >
                Reset
              </Button>
            </div>
          )}

          <div className='text-center'>
            <Text size='md' fw={700}>
              SRS Review
            </Text>
            <Progress value={(currentCardIndex / totalCards) * 100} size='sm' mt='sm' />
            <Text size='xs' c='dimmed' mt='xs'>
              Card {cards.length} of {totalCards}
            </Text>
          </div>

          <Card
            padding='lg'
            bg='gray.0'
            radius='md'
            style={{
              minHeight: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack gap='md' style={{ width: '100%' }}>
              <Text size='xl' fw={700} ta='center' style={{ wordBreak: 'break-word' }}>
                {currentCard.wordData.word}
              </Text>

              {showAnswer && (
                <div className='text-center'>
                  <Text size='md' c='blue' fw={600} style={{ wordBreak: 'break-word' }}>
                    {currentCard.wordData.translation}
                  </Text>
                  {currentCard.wordData.context && (
                    <Badge size='sm' variant='light' mt='sm'>
                      {currentCard.wordData.context}
                    </Badge>
                  )}
                </div>
              )}
            </Stack>
          </Card>

          {!showAnswer && (
            <Button fullWidth size='md' variant='outline' onClick={() => setShowAnswer(true)}>
              Show Answer
            </Button>
          )}

          {showAnswer && (
            <Group justify='center' gap='xs'>
              <Button size='sm' color='red' variant='filled' onClick={() => handleAnswer(1)}>
                Again
              </Button>
              <Button size='sm' color='yellow' variant='filled' onClick={() => handleAnswer(2)}>
                Hard
              </Button>
              <Button size='sm' color='blue' variant='filled' onClick={() => handleAnswer(3)}>
                Good
              </Button>
              <Button size='sm' color='green' variant='filled' onClick={() => handleAnswer(4)}>
                Easy
              </Button>
            </Group>
          )}
        </Stack>
      </Card>
    </div>
  );
};

export default SRSGame;
