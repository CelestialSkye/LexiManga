import { useState, useEffect } from 'react';
import { Modal, Button, Stack, Textarea, TextInput, Select, Group } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useSendFeedback } from '../services/feedbackService';

const FeedbackModal = ({ opened, closeModal }) => {
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');

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
        userId: user?.uid || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      // Reset and close
      setMessage('');
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
      title='Send Feedback'
      centered
      size='md'
      radius='lg'
    >
      <Stack gap='md'>
   

        <Select
          label='Feedback Type'
          placeholder='Select feedback type'
          data={[
            { value: 'bug', label: 'Bug Report' },
            { value: 'feature', label: 'Feature Request' },
            { value: 'general', label: 'General Feedback' },
          ]}
          className='violet-focus'
          value={feedbackType}
          onChange={(value) => setFeedbackType(value || 'general')}
        />

        <Textarea
          label='Message'
          placeholder='Tell us what you think...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={4}
          maxRows={8}
        />

        <Group justify='center' gap='md'>
       
          <Button
            color='violet'
            onClick={handleSubmit}
            loading={sendFeedbackMutation.isPending}
            disabled={!message.trim()}
            radius={8}
          >
            Send
          </Button>
             <Button variant='default' onClick={closeModal}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FeedbackModal;
