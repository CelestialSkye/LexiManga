import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from 'src/config/firebase';
import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from 'src/context/AuthContext';
import { getAuth, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { openDeleteConfirmation } from 'src/components/DeleteConfirmationModal';

const AccountTab = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [message, setMessage] = useState('');

  const auth = getAuth();

  const getUserProfile = async (uid) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // Use React Query for caching and automatic refetching
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getUserProfile(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage('We sent a secure link to your email to change your password.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  /**
   * Delete all user data for GDPR compliance
   * Removes: user document, favorites, daily activities, manga statuses, etc.
   */
  const deleteAllUserData = async (userId) => {
    const batch = writeBatch(db);

    // Collections to delete
    const collectionsToDelete = ['favorites', 'dailyActivities', 'mangaStatuses', 'wordLists'];

    // Delete subcollections within each collection
    for (const collectionName of collectionsToDelete) {
      const userCollectionRef = collection(db, collectionName, userId, 'items');
      const snapshot = await getDocs(userCollectionRef);

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    // Delete main collection documents for this user
    for (const collectionName of collectionsToDelete) {
      const docRef = doc(db, collectionName, userId);
      batch.delete(docRef);
    }

    // Delete user document
    batch.delete(doc(db, 'users', userId));

    // Commit batch delete
    await batch.commit();
  };

  const handleDeleteAccount = () => {
    openDeleteConfirmation(profile?.nickname || user?.email, 'account', async () => {
      try {
        setMessage('Deleting account and all associated data...');

        // Delete all Firestore data (GDPR compliance)
        await deleteAllUserData(uid);

        // Delete Firebase Auth user
        await deleteUser(auth.currentUser);

        setMessage('Your account and all associated data have been permanently deleted.');

        // Redirect after a short delay to show the message
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } catch (error) {
        setMessage(`Error deleting account: ${error.message || 'Unknown error occurred'}`);
      }
    });
  };

  if (isLoading) return <p className='py-8 text-center text-gray-600'>Loading...</p>;
  if (!profile) return <p className='py-8 text-center text-gray-600'>No profile found</p>;

  return (
    <div className='space-y-6'>
      {/* Account Information Section */}
      <div className='rounded-[16px] bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-6 text-xl font-bold text-gray-900'>Account Information</h2>

        <div className='space-y-6'>
          <div>
            <p className='mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase'>
              Nickname
            </p>
            <p className='text-lg font-medium text-gray-900'>{profile.nickname}</p>
          </div>

          <div className='border-t border-gray-200 pt-6'>
            <p className='mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase'>
              Email
            </p>
            <p className='text-lg font-medium text-gray-900'>{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className='rounded-[16px] bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-4 text-xl font-bold text-gray-900'>Security</h2>

        <div className='space-y-4'>
          <p className='text-gray-600'>Secure your account by changing your password regularly.</p>

          <button
            onClick={handlePasswordReset}
            className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 hover:shadow-md'
          >
            Send Password Reset Email
          </button>

          {message && (
            <div
              className={`mt-4 rounded-lg p-4 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
            >
              <p className='text-sm'>{message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className='rounded-[16px] border-l-4 border-red-500 bg-white p-6 shadow-md transition-shadow hover:shadow-lg'>
        <h2 className='mb-4 text-xl font-bold text-gray-900'>Danger Zone</h2>

        <div className='space-y-4'>
          <p className='text-gray-600'>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button
            onClick={handleDeleteAccount}
            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-red-700 hover:shadow-md'
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
