import { ActionIcon, Group, Modal, Radio, Select, Stack, Textarea } from '@mantine/core';
import { Button, NumberInput, Text, TextInput } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useState } from 'react';
import { useWordDifficulty } from 'src/services/wordDifficultyService';

import { useAuth } from '../context/AuthContext';
import { translateWithGemini } from '../services/geminiApi';
import { useMangaStatuses } from '../services/useMangaStatuses';
import { useAddVocabWord } from '../services/vocabService';

//testing file saving in lvim

const AddWordModal = ({ manga, opened, closeModal, showMangaSelector = false }) => {
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
  const [selectedMangaId, setSelectedMangaId] = useState('');

  // Fetch user's manga for selector
  const { data: userManga = [], isLoading: mangaLoading } = useMangaStatuses(user?.uid);

  // Transform to Select format
  const mangaOptions = (userManga || []).map((m) => ({
    value: m.id,
    label: m.title || m.mangaTitle,
  }));

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
      setTranslationError('');
    } catch (error) {
      setTranslationError(error.message || 'Translation failed. Please try again.');
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

    // Determine which manga to use
    const currentManga = showMangaSelector
      ? userManga.find((m) => m.id === selectedMangaId)
      : manga;

    if (!currentManga) {
      return;
    }

    try {
      // Extract the proper manga title string
      let mangaTitleString = 'Unknown';
      if (typeof currentManga.title === 'string') {
        mangaTitleString = currentManga.title;
      } else if (currentManga.title?.english || currentManga.title?.romaji) {
        // If title is an object (from AniList API), get the english or romaji
        mangaTitleString = currentManga.title.english || currentManga.title.romaji;
      } else if (currentManga.mangaTitle) {
        mangaTitleString = currentManga.mangaTitle;
      }

      const wordData = {
        mangaId: currentManga.id.toString(),
        mangaTitle: mangaTitleString,
        word,
        translation,
        context,
        chapter,
        page,
        status,
      };
      await saveMutation.mutateAsync({
        uid: user.uid,
        mangaId: currentManga.id.toString(),
        wordId: `${currentManga.id}_${Date.now()}`,
        wordData,
      });
      resetForm();
      closeModal();
    } catch (error) {
      console.error('Error saving vocabulary word:', error);
    }
  };

  const resetForm = () => {
    setWord('');
    setTranslation('');
    setContext('');
    setChapter('');
    setPage('');
    setStatus('learning');
    setTranslationError('');
    setSelectedMangaId('');
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCloseModal}
      centered={true}
      withCloseButton={false}
      size='sm'
      radius='24px'
    >
      <div className='p-2'>
        {showMangaSelector && (
          <div className='pb-3'>
            <Text>
              Manga
              <Text span c='red'>
                *
              </Text>
            </Text>
            <Select
              placeholder='Select a manga'
              value={selectedMangaId}
              onChange={setSelectedMangaId}
              data={mangaOptions}
              searchable
              clearable={false}
              className='violet-focus'
              error={!selectedMangaId ? 'Manga is required' : ''}
              disabled={mangaLoading}
            />
          </div>
        )}

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
              error={!translationError && !translation.trim() ? 'Translation is required' : ''}
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
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className='violet-focus'
            placeholder='Enter the sentence or panel context where you found this word'
            minRows={3}
            maxRows={6}
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
            disabled={
              saveMutation.isPending ||
              !word.trim() ||
              !translation.trim() ||
              (showMangaSelector && !selectedMangaId)
            }
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
