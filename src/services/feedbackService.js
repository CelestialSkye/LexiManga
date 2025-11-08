import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';

/**
 * Save feedback to Firestore and send email via backend
 */
export const saveFeedback = async (feedbackData) => {
  try {
    // Save to Firestore for record keeping
    const feedbackRef = collection(db, 'feedbacks');
    const docRef = await addDoc(feedbackRef, {
      ...feedbackData,
      timestamp: serverTimestamp(),
    });

    // Send email via backend
    await fetch(`${BACKEND_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
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
