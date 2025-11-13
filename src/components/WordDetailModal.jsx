import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Radio,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconCheck,
  IconEdit,
  IconLanguage,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { translateWithGemini } from '../services/geminiApi';
import { useDeleteVocabWord, useUpdateVocabWord } from '../services/vocabService';
import { openDeleteConfirmation } from './DeleteConfirmationModal';

const WordDetailModal = ({ opened, onClose, word, onEdit, onDelete }) => {
  const { user, profile } = useAuth();
  const updateWordMutation = useUpdateVocabWord();
  const deleteWordMutation = useDeleteVocabWord();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    word: word?.word || '',
    translation: word?.translation || '',
    context: word?.context || '',
    chapter: word?.chapter || '',
    page: word?.page || '',
    status: word?.status || 'learning',
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  // Sync local state with word prop changes
  useEffect(() => {
    if (word) {
      setEditData({
        word: word.word || '',
        translation: word.translation || '',
        context: word.context || '',
        chapter: word.chapter || '',
        page: word.page || '',
        status: word.status || 'learning',
      });
    }
  }, [word]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'known':
        return 'green';
      case 'learning':
        return 'blue';
      case 'unknown':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleGoogleSearch = () => {
    const searchQuery = encodeURIComponent(`${word.translation} meaning definition`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      word: word.word || '',
      translation: word.translation || '',
      context: word.context || '',
      chapter: word.chapter || '',
      page: word.page || '',
      status: word.status || 'learning',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      word: word.word || '',
      translation: word.translation || '',
      context: word.context || '',
      chapter: word.chapter || '',
      page: word.page || '',
      status: word.status || 'learning',
    });
  };

  const handleTranslate = async () => {
    if (!editData.word.trim() || !profile?.targetLang || !profile?.nativeLang) return;

    setIsTranslating(true);
    setTranslationError('');
    try {
      const translatedText = await translateWithGemini(
        editData.word,
        profile.targetLang,
        profile.nativeLang,
        user?.uid
      );
      setEditData((prev) => ({ ...prev, translation: translatedText }));
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate required fields
    if (!editData.word.trim()) {
      return; // Don't save if word is empty
    }
    if (!editData.translation.trim()) {
      return; // Don't save if translation is empty
    }

    // Check if anything actually changed
    const hasChanges =
      word.word !== editData.word ||
      word.translation !== editData.translation ||
      word.context !== editData.context ||
      word.chapter !== editData.chapter ||
      word.page !== editData.page ||
      word.status !== editData.status;

    // Don't save if nothing changed
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedWordData = {
        ...word,
        ...editData,
      };
      await updateWordMutation.mutateAsync({
        uid: user.uid,
        mangaId: word.mangaId,
        wordId: word.id,
        wordData: updatedWordData,
      });
      setIsEditing(false);
      onClose();
      onEdit?.(updatedWordData);
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const handleDelete = () => {
    openDeleteConfirmation(word.word, 'word', async () => {
      if (!user) return;

      try {
        await deleteWordMutation.mutateAsync({
          uid: user.uid,
          mangaId: word.mangaId,
          wordId: word.id,
          wordData: word,
        });
        onClose();
        onDelete?.(word);
      } catch (error) {
        console.error('Error deleting word:', error);
      }
    });
  };

  if (!word) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered={true}
      size='sm'
      radius='24px'
      withCloseButton={false}
      padding='18px'
    >
      <Stack gap='lg'>
        <div>
          <div className='relative rounded-[12px] bg-violet-500 p-12'>
            {isEditing ? (
              // TODO: Re-enable translation button once Firebase Admin is configured
              <ActionIcon
                size='lg'
                variant='filled'
                color='white'
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  backgroundColor: 'white !important',
                  color: 'black !important',
                  display: 'none',
                }}
                className='violet-focus hover:!bg-white hover:!text-black'
                onClick={handleTranslate}
                loading={isTranslating}
                disabled={
                  !editData.word.trim() ||
                  isTranslating ||
                  !profile?.targetLang ||
                  !profile?.nativeLang
                }
                title={`Translate from ${profile?.targetLang || 'target'} to ${profile?.nativeLang || 'native'}`}
              >
                <IconLanguage size={22} color='black' />
              </ActionIcon>
            ) : (
              <ActionIcon
                size='lg'
                variant='filled'
                color='white'
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  backgroundColor: 'white !important',
                  color: 'black !important',
                }}
                className='hover:!bg-white hover:!text-black'
                onClick={handleGoogleSearch}
                title={`Search "${word.translation}" meaning on Google`}
              >
                <IconSearch size={22} color='black' />
              </ActionIcon>
            )}

            <div className='mb-12 text-center'>
              {isEditing ? (
                <TextInput
                  value={editData.word}
                  onChange={(e) => setEditData((prev) => ({ ...prev, word: e.target.value }))}
                  size='lg'
                  className='violet-focus'
                  error={!editData.word.trim() ? 'Word is required' : ''}
                  styles={{
                    input: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      '&:focus': {
                        border: '2px solid white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    },
                  }}
                />
              ) : (
                <Text size='xl' fw={700} c='white'>
                  {word.word}
                </Text>
              )}
            </div>
            <div className='text-center'>
              {isEditing ? (
                <TextInput
                  value={editData.translation}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, translation: e.target.value }))
                  }
                  size='md'
                  style={{ maxWidth: '200px', margin: '0 auto' }}
                  className='violet-focus'
                  error={!editData.translation.trim() ? 'Translation is required' : ''}
                  styles={{
                    input: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '1.125rem',
                      fontWeight: '300',
                      textAlign: 'center',
                      '&:focus': {
                        border: '2px solid white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    },
                  }}
                />
              ) : (
                <Text size='lg' fw={300} c='white'>
                  {word.translation}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* more info */}
        <Stack gap='sm'>
          <div>
            <Text size='sm' fw={500} c='dimmed'>
              Context:
            </Text>
            {isEditing ? (
              <TextInput
                value={editData.context}
                onChange={(e) => setEditData((prev) => ({ ...prev, context: e.target.value }))}
                placeholder='Add context...'
                size='sm'
                className='violet-focus'
              />
            ) : (
              <Text size='md'>{word.context || 'No context added'}</Text>
            )}
          </div>

          <div>
            <Text size='sm' fw={500} c='dimmed'></Text>
            <Stack gap='xs'>
              {isEditing ? (
                <>
                  <NumberInput
                    value={editData.chapter}
                    onChange={(value) => setEditData((prev) => ({ ...prev, chapter: value }))}
                    placeholder='Chapter'
                    size='sm'
                    min={0}
                    className='violet-focus'
                  />
                  <NumberInput
                    value={editData.page}
                    onChange={(value) => setEditData((prev) => ({ ...prev, page: value }))}
                    placeholder='Page'
                    size='sm'
                    min={0}
                    className='violet-focus'
                  />
                </>
              ) : (
                <>
                  {word.chapter && <Text size='sm'>Chapter {word.chapter}</Text>}
                  {word.page && <Text size='sm'>Page {word.page}</Text>}
                </>
              )}
            </Stack>
          </div>

          <div>
            <Text size='sm' fw={500} c='dimmed'>
              Status:
            </Text>
            {isEditing ? (
              <Radio.Group
                value={editData.status}
                onChange={(value) => setEditData((prev) => ({ ...prev, status: value }))}
                className='violet-focus'
              >
                <Group gap='md' mt='xs'>
                  <Radio value='learning' label='Learning' size='sm' />
                  <Radio value='known' label='Known' size='sm' />
                  <Radio value='unknown' label='Unknown' size='sm' />
                </Group>
              </Radio.Group>
            ) : (
              <Badge color={getStatusColor(word.status)} variant='light' size='sm'>
                {word.status}
              </Badge>
            )}
          </div>

          {word.mangaTitle && (
            <div>
              <Text size='sm' fw={500} c='dimmed'>
                From:
              </Text>
              <Text size='md'>
                {typeof word.mangaTitle === 'string'
                  ? word.mangaTitle
                  : word.mangaTitle?.english ||
                    word.mangaTitle?.romaji ||
                    word.mangaTitle?.native ||
                    'Unknown'}
              </Text>
            </div>
          )}
        </Stack>

        {/* Action Buttons */}
        <Group grow>
          {isEditing ? (
            <>
              <Button
                variant='filled'
                radius='12px'
                onClick={handleSave}
                loading={updateWordMutation.isPending}
                disabled={
                  updateWordMutation.isPending ||
                  !editData.word.trim() ||
                  !editData.translation.trim()
                }
                color='violet'
              >
                Save
              </Button>
              <Button
                variant='outline'
                color='red'
                radius='12px'
                onClick={handleCancelEdit}
                disabled={updateWordMutation.isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant='filled' radius='12px' onClick={handleEdit} color='violet'>
                Edit
              </Button>
              <Button variant='outline' color='red' radius='12px' onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

export default WordDetailModal;
