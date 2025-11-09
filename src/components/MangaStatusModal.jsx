import { useState } from 'react';
import { Modal } from '@mantine/core';
import { TextInput, NumberInput, Select, Button, Group, Text, Divider } from '@mantine/core';
import {
  useMangaStatus,
  useSaveMangaStatus,
  deleteMangaStatus,
} from '../services/mangaStatusService.js';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openDeleteConfirmation } from './DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';

const MangaStatusModal = ({ manga, opened, closeModal }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existingStatus, isLoading } = useMangaStatus(user?.uid, manga?.id?.toString());
  const saveMutation = useSaveMangaStatus();
  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteMangaStatus(
        user?.uid,
        manga?.id?.toString(),
        manga?.title?.english || manga?.title?.romaji
      ),
    onMutate: async () => {
      // Optimistically remove the manga status from the cache
      await queryClient.cancelQueries({
        queryKey: ['mangaStatus', user?.uid, manga?.id?.toString()],
      });

      const previousStatus = queryClient.getQueryData([
        'mangaStatus',
        user?.uid,
        manga?.id?.toString(),
      ]);

      queryClient.setQueryData(['mangaStatus', user?.uid, manga?.id?.toString()], null);

      return { previousStatus };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: ['mangaStatuses', user?.uid],
      });
      closeModal();
    },
    onError: (error, _, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['mangaStatus', user?.uid, manga?.id?.toString()],
          context.previousStatus
        );
      }
      console.error('Error deleting manga status:', error);
    },
  });
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
        <div className='mb-4 flex items-center justify-between'>
          <Text fw={600} size='lg'>
            Manga Status
          </Text>
          <button
            onClick={() => navigate(`/manga/${manga?.id}`)}
            className='rounded-full p-2 transition-all hover:bg-gray-100'
            title='Go to Manga Page'
          >
            <FiArrowUpRight size={20} className='text-violet-600' />
          </button>
        </div>

        <Text>Status</Text>
        <Select
          value={status}
          onChange={setStatus}
          className='dropdown-smooth-animation violet-focus'
          data={[
            { value: 'reading', label: 'Reading' },
            { value: 'completed', label: 'Completed' },
            { value: 'on-hold', label: 'On Hold' },
            { value: 'dropped', label: 'Dropped' },
            { value: 'plan-to-read', label: 'Plan to Read' },
          ]}
        />
        <Text className='mt-3'>Progress</Text>
        <NumberInput value={progress} onChange={setProgress} className='violet-focus' />
        <Text className='mt-3'>Score</Text>
        <Select
          value={score}
          onChange={setScore}
          className='dropdown-smooth-animation violet-focus'
          placeholder='Select Score'
          data={[
            { value: '1', label: '1 - Terrible' },
            { value: '2', label: '2 - Poor' },
            { value: '3', label: '3 - Bad' },
            { value: '4', label: '4 - Below Average' },
            { value: '5', label: '5 - Average' },
            { value: '6', label: '6 - Fine' },
            { value: '7', label: '7 - Good' },
            { value: '8', label: '8 - Very Good' },
            { value: '9', label: '9 - Excellent' },
            { value: '10', label: '10 - Masterpiece' },
          ]}
        />
        <Text className='mt-3'>Notes</Text>
        <TextInput
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className='violet-focus'
        />
        <Group justify='space-between' className='mt-4'>
          <Button
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={saveMutation.isPending || deleteMutation.isPending}
            color='violet'
            variant='filled'
            radius='12px'
          >
            Save
          </Button>
          {existingStatus && (
            <Button
              onClick={() =>
                openDeleteConfirmation(
                  manga.title?.romaji || manga.title?.english || 'this manga',
                  'manga',
                  () => deleteMutation.mutate()
                )
              }
              loading={deleteMutation.isPending}
              disabled={saveMutation.isPending || deleteMutation.isPending}
              color='red'
              variant='outline'
              radius='12px'
            >
              Delete
            </Button>
          )}
        </Group>
      </div>
    </Modal>
  );
};

export default MangaStatusModal;
