import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Stack,
  Text,
  Textarea,
  TextInput,
  Select,
  Group,
  Rating,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useSendFeedback } from '../services/feedbackService';

const FeedbackModal = ({ opened, closeModal }) => {
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);

  const { user } = useAuth();
  const sendFeedbackMutation = useSendFeedback();

  // Prefill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    try {
      await sendFeedbackMutation.mutateAsync({
        email: email || 'anonymous@feedback.com',
        type: feedbackType,
        message,
        rating,
        userId: user?.uid || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      // Reset and close
      setMessage('');
      setRating(0);
      setEmail(user?.email || '');
      closeModal();
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title='Send Us Your Feedback'
      centered
      size='md'
      radius='lg'
    >
      <Stack gap='md'>
        <TextInput
          label='Email'
          placeholder='your@email.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label='Feedback Type'
          placeholder='Select feedback type'
          data={[
            { value: 'bug', label: '🐛 Bug Report' },
            { value: 'feature', label: '✨ Feature Request' },
            { value: 'general', label: '💬 General Feedback' },
          ]}
          value={feedbackType}
          onChange={(value) => setFeedbackType(value || 'general')}
        />

        <Textarea
          label='Your Feedback'
          placeholder='Tell us what you think...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={4}
          maxRows={8}
          required
        />

        <Stack gap='xs'>
          <Text size='sm' fw={500}>
            How would you rate your experience?
          </Text>
          <Rating value={rating} onChange={setRating} size='lg' />
        </Stack>

        <Group justify='flex-end'>
          <Button variant='default' onClick={closeModal}>
            Cancel
          </Button>
          <Button
            color='violet'
            onClick={handleSubmit}
            loading={sendFeedbackMutation.isPending}
            disabled={!message.trim()}
            radius={8}
          >
            Send Feedback
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FeedbackModal;
