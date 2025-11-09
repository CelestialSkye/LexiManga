import { useMutation } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';

interface ActivityEntry {
  type: string;
  [key: string]: any;
}

export const useLogActivity = () => {
  return useMutation({
    mutationFn: async (entry: ActivityEntry) => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const payload = {
        ...entry,
        userId: user.uid,
        timestamp: new Date(),
      };

      const docRef = await addDoc(collection(db, 'users', user.uid, 'activities'), payload);
      return { id: docRef.id, ...payload };
    },
  });
};
