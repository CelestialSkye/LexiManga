import { useState } from 'react';
import { Card, Text, Button, Group, Badge, Progress, Stack } from '@mantine/core';

const SRSGame = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState('');

  const mockCards = [
    { word: 'こんにちは', translation: 'Hello', context: 'Greeting' },
    { word: 'ありがとう', translation: 'Thank you', context: 'Politeness' },
    { word: 'すみません', translation: 'Excuse me', context: 'Apology' },
    { word: 'おはよう', translation: 'Good morning', context: 'Greeting' },
    { word: 'さようなら', translation: 'Goodbye', context: 'Farewell' }
  ];

  const handleAnswer = (isCorrect) => {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    setShowAnswer(false);
    setCurrentCard(prev => (prev + 1) % mockCards.length);
  };

  const handleDifficulty = (level) => {
    setDifficulty(level);
    setShowAnswer(true);
  };

  const progress = (score.total / mockCards.length) * 100;

  return (
    <div className="max-w-md mx-auto p-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <div className="text-center">
            <Text size="lg" fw={700}>SRS Review</Text>
            <Progress value={progress} size="sm" mt="xs" />
            <Text size="sm" c="dimmed" mt="xs">
              {score.correct}/{score.total} correct
            </Text>
          </div>

          <Card padding="md" bg="gray.0" radius="md">
            <Stack gap="sm">
              <Text size="xl" fw={600} ta="center">
                {mockCards[currentCard].word}
              </Text>
              
              {showAnswer && (
                <div className="text-center">
                  <Text size="lg" c="blue" fw={500}>
                    {mockCards[currentCard].translation}
                  </Text>
                  <Badge size="sm" variant="light" mt="xs">
                    {mockCards[currentCard].context}
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
                    onClick={() => handleAnswer(false)}
                  >
                    Again
                  </Button>
                  <Button 
                    size="sm" 
                    color="yellow" 
                    variant="outline"
                    onClick={() => handleAnswer(false)}
                  >
                    Hard
                  </Button>
                  <Button 
                    size="sm" 
                    color="blue" 
                    variant="outline"
                    onClick={() => handleAnswer(true)}
                  >
                    Good
                  </Button>
                  <Button 
                    size="sm" 
                    color="green" 
                    variant="outline"
                    onClick={() => handleAnswer(true)}
                  >
                    Easy
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>

          <div className="text-center">
            <Text size="sm" c="dimmed">
              Card {currentCard + 1} of {mockCards.length}
            </Text>
          </div>
        </Stack>
      </Card>
    </div>
  );
};

export default SRSGame;
