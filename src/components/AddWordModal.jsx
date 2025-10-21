import { useState } from 'react';
import { Modal, Radio, Group, ActionIcon, Stack } from '@mantine/core';
import { TextInput, NumberInput, Button, Text } from '@mantine/core';
import { useAddVocabWord } from '../services/vocabService';
import { useAuth } from '../context/AuthContext';
import { translateWithGemini } from '../services/geminiApi';
import { IconLanguage } from '@tabler/icons-react';
import {  useWordDifficulty } from 'src/services/wordDifficultyService';

//testing file saving in lvim

const AddWordModal = ({ manga, opened, closeModal }) => {
  const { user, profile } = useAuth();
  const saveMutation = useAddVocabWord();
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');
  const [chapter, setChapter] = useState('');
  const [page, setPage] = useState('');
  const [status, setStatus] = useState('learning');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  //calling the word difficulty hook
  const { data: difficulty, isLoading: difficultyLoading } = useWordDifficulty(
    word,
    profile?.targetLang
  );

  const handleTranslate = async () => {
    if (!word.trim() || !profile?.targetLang || !profile?.nativeLang) return;

    setIsTranslating(true);
    setTranslationError('');
    try {
      const translatedText = await translateWithGemini(
        word,
        profile.targetLang,
        profile.nativeLang,
        user?.uid
      );
      setTranslation(translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError(error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!word.trim()) {
      return; 
    }
    if (!translation.trim()) {
      return; 
    }

    try {
      await saveMutation.mutateAsync({
        uid: user.uid,
        mangaId: manga.id.toString(),
        wordId: `${manga.id}_${Date.now()}`,
        wordData: {
          mangaId: manga.id.toString(),
          mangaTitle: manga.title?.english || manga.title?.romaji,
          word,
          translation,
          context,
          chapter,
          page,
          status,
        },
      });
    } catch (error) {
      console.error('Error saving vocabulary word:', error);
    } finally {
      closeModal();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      centered={true}
      withCloseButton={false}
      size='sm'
      radius='24px'
    >

      <div className='p-2'>
        <div className='pb-3'>
          <Text>
            Word{' '}
            <Text span c='red'>
              *
            </Text>
          </Text>
          <Text size='xs' c='dimmed'>
            Target Language: {profile?.targetLang}
          </Text>
          <TextInput
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            className='violet-focus'
            error={!word.trim() ? 'Word is required' : ''}
          />
          {word.trim() && difficulty && (
            <Text size='xs' mt='xs'>
              Difficulty:
              <Text
                span
                fw={600}
                ml='xs'
                c={
                  difficulty.level === 'Easy'
                    ? 'green'
                    : difficulty.level === 'Medium'
                      ? 'yellow'
                      : 'red'
                }
              >
                {difficulty.level} (Score: {difficulty.score})
              </Text>
            </Text>
          )}
          {word.trim() && difficultyLoading && (
            <Text size='xs' c='dimmed' mt='xs'>
              Loading difficulty...
            </Text>
          )}
        </div>

        <div className='pb-3'>
          <Text>
            Translation{' '}
            <Text span c='red'>
              *
            </Text>
          </Text>
          <Text size='xs' c='dimmed'>
            Mother Language: {profile?.nativeLang}
          </Text>
          <Group>
            <TextInput
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              style={{ flex: 1 }}
              error={translationError || (!translation.trim() ? 'Translation is required' : '')}
              className='violet-focus'
            />
            <ActionIcon
              onClick={handleTranslate}
              loading={isTranslating}
              disabled={
                !word.trim() || isTranslating || !profile?.targetLang || !profile?.nativeLang
              }
              variant='filled'
              color='violet'
              title={`Translate from ${profile?.targetLang || 'target'} to ${profile?.nativeLang || 'native'}`}
              className='mb-5'
            >
              <IconLanguage size={16} />
            </ActionIcon>
          </Group>
          {translationError && (
            <Text size='sm' c='red' mt='xs'>
              {translationError}
            </Text>
          )}
          {!translationError && (
            <Text size='12px' c='dimmed' mt='xs'>
              💡 You can translate up to 20 words per hour. Enter translations manually if you need
              to.
            </Text>
          )}
        </div>

        <div className='pb-2'>
          <Text>Context</Text>
          <TextInput
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className='violet-focus'
          />
        </div>

        <div className='pb-2'>
          <Text>Chapter</Text>
          <NumberInput value={chapter} onChange={setChapter} className='violet-focus' />
        </div>

        <div className='pb-2'>
          <Text>Page</Text>
          <NumberInput value={page} onChange={setPage} className='violet-focus' />
        </div>

        <div className='pb-2'>
          <Text>Status</Text>
          <Radio.Group value={status} onChange={setStatus} className='violet-focus'>
            <Stack gap='sm'>
              <Radio value='learning' label='Learning' />
              <Radio value='known' label='Known' />
              <Radio value='unknown' label='Unknown' />
            </Stack>
          </Radio.Group>
        </div>

        <div className='pt-2'>
          <Button
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={saveMutation.isPending || !word.trim() || !translation.trim()}
            color='violet'
            variant='filled'
            radius='12px'
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddWordModal;
