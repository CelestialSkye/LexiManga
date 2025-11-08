import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

/**
 * Save feedback to Firestore
 */
export const saveFeedback = async (feedbackData) => {
  try {
    const feedbackRef = collection(db, 'feedbacks');
    const docRef = await addDoc(feedbackRef, {
      ...feedbackData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};

/**
 * Hook to send feedback with React Query
 */
export const useSendFeedback = () => {
  return useMutation({
    mutationFn: (feedbackData) => saveFeedback(feedbackData),
    onSuccess: () => {
      notifications.show({
        title: 'Thank you!',
        message: 'Your feedback has been sent successfully.',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.error('Feedback submission error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send feedback. Please try again.',
        color: 'red',
        autoClose: 3000,
      });
    },
  });
};
