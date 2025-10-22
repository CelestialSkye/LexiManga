import { useState, useEffect } from 'react';
import { Card, Text, Button, Group, Badge, Progress, Stack, Select } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { createEmptyCard, FSRS, Rating } from 'ts-fsrs';
import { useVocabWordsByManga, useUpdateVocabWord, useVocabWords } from '../services/vocabService';

const SRSGame = ({ manga, words: initialWords }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedMangaFilter, setSelectedMangaFilter] = useState(null);

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

  // Get words based on mode
  const getWords = () => {
    if (isProfileMode && allUserWords) {
      if (selectedMangaFilter) {
        return allUserWords.filter((w) => w.mangaId === selectedMangaFilter);
      }
      return allUserWords;
    }
    return userWords || [];
  };

  const words = getWords();

  // Get unique manga for filter dropdown in profile mode
  const getMangaOptions = () => {
    if (!allUserWords) return [];
    const mangaMap = new Map();
    allUserWords.forEach((word) => {
      if (word.mangaId && word.mangaTitle) {
        mangaMap.set(word.mangaId, word.mangaTitle);
      }
    });
    return Array.from(mangaMap, ([id, title]) => ({ value: id, label: title }));
  };

  useEffect(() => {
    if (words && words.length > 0 && !sessionStarted) {
      //load cards or create new ones
      const cardsWithSRS = words.map((word) => {
        // Check if card has valid SRS data (not corrupted with NaN or invalid values)
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
          // New word or corrupted data > create a fresh card
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

      // filter to only show cards that are due for review
      const now = new Date();
      const dueCards = cardsWithSRS.filter((card) => {
        const dueDate = new Date(card.due);
        return dueDate <= now;
      });

      setCards(dueCards);
      setCurrentCardIndex(0);
      setSessionStarted(true);
    }
  }, [words, sessionStarted]);

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
    });

    // remove the current card from the session
    const newCards = cards.filter((_, index) => index !== currentCardIndex);
    setCards(newCards);

    // Update the current card index
    if (newCards.length === 0) {
      setCurrentCardIndex(0);
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
          No vocabulary words found. Add some words first! 📚
        </Text>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text ta='center' c='green' size='lg' fw={700}>
          All caught up!
        </Text>
        <Text ta='center' c='dimmed' mt='md'>
          No cards are due for review right now. Check back later!
        </Text>
      </Card>
    );
  }

  if (currentCardIndex >= cards.length) {
    const mangaOptions = getMangaOptions();

    return (
      <div className='mx-auto max-w-md p-6'>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Stack gap='md'>
            {isProfileMode && mangaOptions.length > 0 && (
              <Select
                label='Filter by Manga (optional)'
                placeholder='Study all words'
                data={mangaOptions}
                value={selectedMangaFilter}
                onChange={(value) => {
                  setSelectedMangaFilter(value);
                  setSessionStarted(false);
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                }}
                clearable
                searchable
              />
            )}

            <Text ta='center' c='green' size='lg' fw={700}>
              Session Complete! 🎉
            </Text>
            <Button
              fullWidth
              onClick={() => {
                setCurrentCardIndex(0);
                setShowAnswer(false);
                setSessionStarted(false);
              }}
            >
              Start New Session
            </Button>
          </Stack>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const mangaOptions = getMangaOptions();

  return (
    <div className='mx-auto max-w-md p-6'>
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Stack gap='md'>
          {isProfileMode && mangaOptions.length > 0 && (
            <Select
              label='Filter by Manga (optional)'
              placeholder='Study all words'
              data={mangaOptions}
              value={selectedMangaFilter}
              onChange={(value) => {
                setSelectedMangaFilter(value);
                setSessionStarted(false);
                setCurrentCardIndex(0);
                setShowAnswer(false);
              }}
              clearable
              searchable
            />
          )}

          <div className='text-center'>
            <Text size='lg' fw={700}>
              SRS Review
            </Text>
            <Progress value={(currentCardIndex / cards.length) * 100} size='sm' mt='xs' />
            <Text size='sm' c='dimmed' mt='xs'>
              Card {currentCardIndex + 1} of {cards.length}
            </Text>
          </div>

          <Card padding='md' bg='gray.0' radius='md'>
            <Stack gap='sm'>
              <Text size='xl' fw={600} ta='center'>
                {currentCard.wordData.word}
              </Text>

              {showAnswer && (
                <div className='text-center'>
                  <Text size='lg' c='blue' fw={500}>
                    {currentCard.wordData.translation}
                  </Text>
                  <Badge size='sm' variant='light' mt='xs'>
                    {currentCard.wordData.context}
                  </Badge>
                </div>
              )}

              {!showAnswer && (
                <Button fullWidth variant='outline' onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              )}

              {showAnswer && (
                <Group justify='center' gap='xs'>
                  <Button size='sm' color='red' variant='outline' onClick={() => handleAnswer(1)}>
                    Again
                  </Button>
                  <Button
                    size='sm'
                    color='yellow'
                    variant='outline'
                    onClick={() => handleAnswer(2)}
                  >
                    Hard
                  </Button>
                  <Button size='sm' color='blue' variant='outline' onClick={() => handleAnswer(3)}>
                    Good
                  </Button>
                  <Button size='sm' color='green' variant='outline' onClick={() => handleAnswer(4)}>
                    Easy
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Stack>
      </Card>
    </div>
  );
};

export default SRSGame;
