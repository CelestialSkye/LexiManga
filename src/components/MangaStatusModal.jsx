import { useState } from 'react';
import { Modal } from '@mantine/core';
import { TextInput, NumberInput, Select, Button, Group, Text, Divider } from '@mantine/core';
import { useMangaStatus, useSaveMangaStatus } from '../services/mangaStatusService.js';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MangaStatusModal = ({ manga, opened, closeModal }) => {
  const { user } = useAuth();
  const { data: existingStatus, isLoading } = useMangaStatus(user?.uid, manga?.id?.toString());
  const saveMutation = useSaveMangaStatus();
  const [status, setStatus] = useState('plan-to-read');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState(null);

  const handleSave = async () => {
    if (!user) return;

    const isNew = !existingStatus;

    try {
      await saveMutation.mutateAsync({
        uid: user.uid,
        mangaId: manga.id.toString(),
        statusData: {
          mangaId: manga.id.toString(),
          mangaTitle: manga.title?.english || manga.title?.romaji,
          status,
          progress,
          notes,
          score,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isNew,
      });
    } catch (error) {
      console.error('Error saving manga status:', error);
    } finally {
      closeModal();
    }
  };

  useEffect(() => {
    if (existingStatus) {
      setStatus(existingStatus.status || 'plan-to-read');
      setProgress(existingStatus.progress || 0);
      setNotes(existingStatus.notes || '');
      setScore(existingStatus.score || null);
    }
  }, [existingStatus]);

  return (
    <Modal opened={opened} onClose={closeModal} withCloseButton={false} centered>
      <div className='p-4'>
        <Text>Status</Text>
        <Select
          value={status}
          onChange={setStatus}
          className='violet-focus'
          data={[
            { value: 'reading', label: 'Reading' },
            { value: 'completed', label: 'Completed' },
            { value: 'on-hold', label: 'On Hold' },
            { value: 'dropped', label: 'Dropped' },
            { value: 'plan-to-read', label: 'Plan to Read' },
          ]}
        />
        <Text>Progress</Text>
        <NumberInput value={progress} onChange={setProgress} className='violet-focus' />
        <Text>Score</Text>
        <NumberInput value={score} onChange={setScore} className='violet-focus' />
        <Text>Notes</Text>
        <TextInput
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className='violet-focus'
        />
        <Button
          onClick={handleSave}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
          color='violet'
          variant='filled'
          radius='12px'
          className='mt-4'
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default MangaStatusModal;
