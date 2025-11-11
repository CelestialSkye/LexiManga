import { Badge, Button, Card, Group, Select, Text, TextInput } from '@mantine/core';
import { useState } from 'react';

import { useWordDifficulty } from '../services/wordDifficultyService';

const WordDifficultyTest = () => {
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState('english');
  const [testWord, setTestWord] = useState('');
  const [testLanguage, setTestLanguage] = useState('english');

  const { data: difficulty, isLoading, error } = useWordDifficulty(testWord, testLanguage);

  const handleTest = () => {
    setTestWord(word);
    setTestLanguage(language);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Easy':
        return 'green';
      case 'Medium':
        return 'yellow';
      case 'Hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className='mx-auto max-w-2xl p-6'>
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        <Text size='xl' fw={700} mb='md'>
          Word Difficulty Tester
        </Text>

        <Group mb='md'>
          <TextInput
            placeholder='Enter a word...'
            value={word}
            onChange={(e) => setWord(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder='Select language'
            value={language}
            onChange={setLanguage}
            data={[
              { value: 'mandarin', label: 'Mandarin Chinese' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'english', label: 'English' },
              { value: 'hindi', label: 'Hindi' },
              { value: 'arabic', label: 'Arabic' },
              { value: 'portuguese', label: 'Portuguese' },
              { value: 'bengali', label: 'Bengali' },
              { value: 'russian', label: 'Russian' },
              { value: 'japanese', label: 'Japanese' },
              { value: 'hebrew', label: 'Hebrew' },
              { value: 'korean', label: 'Korean' },
              { value: 'german', label: 'German' },
              { value: 'french', label: 'French' },
              { value: 'turkish', label: 'Turkish' },
              { value: 'italian', label: 'Italian' },
            ]}
            style={{ width: 150 }}
          />
          <Button onClick={handleTest} disabled={!word}>
            Test
          </Button>
        </Group>

        {testWord && (
          <Card shadow='sm' padding='md' radius='md' withBorder>
            <Text size='lg' fw={600} mb='sm'>
              Testing: "{testWord}" in {testLanguage}
            </Text>

            {isLoading && <Text c='dimmed'>Loading difficulty analysis...</Text>}

            {error && <Text c='red'>Error: {error.message}</Text>}

            {difficulty && (
              <div>
                <Group mb='sm'>
                  <Text fw={500}>Difficulty:</Text>
                  <Badge color={getDifficultyColor(difficulty.level)} size='lg'>
                    {difficulty.level}
                  </Badge>
                </Group>

                <Group mb='sm'>
                  <Text fw={500}>Score:</Text>
                  <Badge variant='outline' color='blue'>
                    {difficulty.score}/3
                  </Badge>
                </Group>

                <Group>
                  <Text fw={500}>Source:</Text>
                  <Badge variant='light' color='gray'>
                    {difficulty.source}
                  </Badge>
                </Group>
              </div>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default WordDifficultyTest;
