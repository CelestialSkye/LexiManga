import { useState } from 'react';
import { Modal, Radio, Group, ActionIcon } from '@mantine/core';
import { TextInput, NumberInput, Button, Text } from '@mantine/core';
import { useAddVocabWord } from '../services/vocabService';
import { useAuth } from '../context/AuthContext';
import { translateWithGemini } from '../services/geminiApi';
import { IconLanguage } from '@tabler/icons-react';

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

  const handleTranslate = async () => {
    if (!word.trim() || !profile?.targetLang || !profile?.nativeLang) return;
    
    setIsTranslating(true);
    setTranslationError('');
    try {
      // Translate from target language to native language
      const translatedText = await translateWithGemini(word, profile.targetLang, profile.nativeLang, user?.uid);
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
    <Modal opened={opened} onClose={closeModal} title='Add Word'>
      <div className='p-4'>
        <Text>Word</Text>
        <TextInput value={word} onChange={(e) => setWord(e.target.value)} required />
        
                <Text>Translation</Text>
                <Group>
                  <TextInput 
                    value={translation} 
                    onChange={(e) => setTranslation(e.target.value)} 
                    style={{ flex: 1 }}
                    error={translationError}
                  />
                  <ActionIcon 
                    onClick={handleTranslate}
                    loading={isTranslating}
                    disabled={!word.trim() || isTranslating || !profile?.targetLang || !profile?.nativeLang}
                    variant="filled"
                    color="violet"
                    title={`Translate from ${profile?.targetLang || 'target'} to ${profile?.nativeLang || 'native'}`}
                  >
                    <IconLanguage size={16} />
                  </ActionIcon>
                </Group>
                {translationError && (
                  <Text size="sm" c="red" mt="xs">
                    {translationError}
                  </Text>
                )}
                {!translationError && (
                  <Text size="xs" c="dimmed" mt="xs">
                    💡 You can translate up to 20 words per hour. Enter translations manually if you need to.
                  </Text>
                )}
        <Text>Context</Text>
        <TextInput value={context} onChange={(e) => setContext(e.target.value)} />
        <Text>Chapter</Text>
        <NumberInput value={chapter} onChange={setChapter} />
        <Text>Page</Text>
        <NumberInput value={page} onChange={setPage} />
        <Text>Status</Text>
        <Radio.Group value={status} onChange={setStatus}>
          <Radio value="learning" label="Learning" />
          <Radio value="known" label="Known" />
          <Radio value="unknown" label="Unknown" />
        </Radio.Group>
        <Button
          onClick={handleSave}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default AddWordModal;
