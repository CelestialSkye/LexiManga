import { useState, useEffect } from 'react';
import { Card, Text, Button, Group, Badge, Progress, Stack } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { createEmptyCard, FSRS, Rating } from 'ts-fsrs';
import { useVocabWordsByManga, useUpdateVocabWord } from '../services/vocabService';

const SRSGame = ({ manga }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const fsrs = new FSRS();
  const updateWordMutation = useUpdateVocabWord();

  // use vocabulary service
  const { data: userWords, isLoading, error } = useVocabWordsByManga(user?.uid, manga?.id?.toString());

  useEffect(() => {
    if (userWords && userWords.length > 0 && !sessionStarted) {
      //load cards or create new ones
      const cardsWithSRS = userWords.map(word => {
        // if a card has srs data use it otherwise create a new card
        if (word.due && word.stability !== undefined) {
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
            wordData: word
          };
        } else {
          // Nnew word > create a new card with proper dates
          const newCard = createEmptyCard();
          const now = new Date();
          newCard.due = now; 
          newCard.last_review = undefined; // never reviewed before
          return {
            ...newCard,
            wordData: word
          };
        }
      });
      
      // filter to only show cards that are due for review
      const now = new Date();
      const dueCards = cardsWithSRS.filter(card => {
        const dueDate = new Date(card.due);
        return dueDate <= now;
      });
      
      setCards(dueCards);
      setCurrentCardIndex(0);
      setSessionStarted(true);
    }
  }, [userWords, sessionStarted]);

  const handleAnswer = async (rating) => {
    if (currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];
    
    // convert rating to ts-fsrs Rating enum
    const fsrsRating = rating === 1 ? Rating.Again : 
                      rating === 2 ? Rating.Hard : 
                      rating === 3 ? Rating.Good : Rating.Easy;
    
    // review the card
    const result = fsrs.repeat(currentCard, fsrsRating);
    const newCard = result[rating.toString()].card;
    
    const now = new Date();
    const scheduledDays = newCard.scheduled_days || 0;
    const actualDueDate = new Date(now.getTime() + (scheduledDays * 24 * 60 * 60 * 1000));
    
    // Ensure the date is valid
    if (isNaN(actualDueDate.getTime())) {
      console.error('Invalid due date calculated:', { scheduledDays, now, actualDueDate });
      return; // Exit early if date is invalid
    }
    
    newCard.due = actualDueDate;
    newCard.last_review = now;
    
    setShowAnswer(false); 
    
    // save the updated srs data to firestore 
    updateWordMutation.mutate({
      uid: user.uid,
      mangaId: manga.id.toString(),
      wordId: currentCard.wordData.id,
      wordData: {
        ...currentCard.wordData,
        due: newCard.due && !isNaN(newCard.due.getTime()) ? newCard.due.toISOString() : new Date().toISOString(),
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        elapsed_days: newCard.elapsed_days,
        scheduled_days: newCard.scheduled_days,
        reps: newCard.reps,
        lapses: newCard.lapses,
        learning_steps: newCard.learning_steps,
        state: newCard.state,
        last_review: newCard.last_review && !isNaN(newCard.last_review.getTime()) ? newCard.last_review.toISOString() : undefined,
      }
    });
    
    // Remove the current card from the session
    const newCards = cards.filter((_, index) => index !== currentCardIndex);
    setCards(newCards);
    
    // Update the current card index based on new array length
    if (newCards.length === 0) {
      setCurrentCardIndex(0);
    } else if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  if (!manga || !user) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="dimmed">
          Please select a manga to study
        </Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="dimmed">
          Loading your vocabulary words...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="red">
          Error loading words: {error.message}
        </Text>
      </Card>
    );
  }

  if (!userWords || userWords.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="dimmed">
          No vocabulary words found for this manga. Add some words first! 📚
        </Text>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="green" size="lg" fw={700}>
          All caught up! 
        </Text>
        <Text ta="center" c="dimmed" mt="md">
          No cards are due for review right now. Check back later!
        </Text>
      </Card>
    );
  }

  if (currentCardIndex >= cards.length) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text ta="center" c="green" size="lg" fw={700}>
          Session Complete! 🎉
        </Text>
        <Button 
          fullWidth 
          mt="md" 
          onClick={() => {
            setCurrentCardIndex(0);
            setShowAnswer(false);
            setSessionStarted(false);
          }}
        >
          Start New Session
        </Button>
      </Card>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="max-w-md mx-auto p-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <div className="text-center">
            <Text size="lg" fw={700}>SRS Review</Text>
            <Progress value={(currentCardIndex / cards.length) * 100} size="sm" mt="xs" />
            <Text size="sm" c="dimmed" mt="xs">
              Card {currentCardIndex + 1} of {cards.length}
            </Text>
          </div>

          <Card padding="md" bg="gray.0" radius="md">
            <Stack gap="sm">
              <Text size="xl" fw={600} ta="center">
                {currentCard.wordData.word}
              </Text>
              
              {showAnswer && (
                <div className="text-center">
                  <Text size="lg" c="blue" fw={500}>
                    {currentCard.wordData.translation}
                  </Text>
                  <Badge size="sm" variant="light" mt="xs">
                    {currentCard.wordData.context}
                  </Badge>
                </div>
              )}

              {!showAnswer && (
                <Button 
                  fullWidth 
                  variant="outline" 
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </Button>
              )}

              {showAnswer && (
                <Group justify="center" gap="xs">
                  <Button 
                    size="sm" 
                    color="red" 
                    variant="outline"
                    onClick={() => handleAnswer(1)}
                  >
                    Again
                  </Button>
                  <Button 
                    size="sm" 
                    color="yellow" 
                    variant="outline"
                    onClick={() => handleAnswer(2)}
                  >
                    Hard
                  </Button>
                  <Button 
                    size="sm" 
                    color="blue" 
                    variant="outline"
                    onClick={() => handleAnswer(3)}
                  >
                    Good
                  </Button>
                  <Button 
                    size="sm" 
                    color="green" 
                    variant="outline"
                    onClick={() => handleAnswer(4)}
                  >
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