import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

import { storage } from '../config/firebase';
import { db } from '../config/firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

// Magic bytes for file type validation
const MAGIC_BYTES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
};

const validateMagicBytes = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      const bytes = Array.from(arr);

      const mimeType = file.type;
      const expectedBytes = MAGIC_BYTES[mimeType];

      if (!expectedBytes) {
        reject(new Error('Unsupported file type'));
        return;
      }

      const matches = expectedBytes.every((byte, index) => bytes[index] === byte);
      if (!matches) {
        reject(new Error('File signature does not match MIME type'));
      } else {
        resolve(true);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export const avatarService = {
  /**
   * Uploads avatar through backend to Firebase Storage
   * Bypasses CORS issues by uploading via backend server
   */
  async uploadAvatar(uid, file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Only JPEG and PNG files are allowed');
    }

    try {
      // Validate magic bytes on client first
      await validateMagicBytes(file);

      // Get auth token
      const auth = (await import('../config/firebase')).auth;
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();

      // Upload through backend
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${BACKEND_URL}/api/avatar/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      return data.downloadURL;
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  },

  /**
   * Updates user's avatar URL in Firestore
   */
  async updateAvatar(uid, file) {
    try {
      const downloadURL = await this.uploadAvatar(uid, file);
      await updateDoc(doc(db, 'users', uid), {
        avatarUrl: downloadURL,
        avatarUpdatedAt: new Date(),
      });
      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to update avatar: ${error.message}`);
    }
  },

  /**
   * Deletes avatar from Firebase Storage and Firestore
   */
  async deleteAvatar(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().avatarUrl) {
        // Delete from Storage if it's a Firebase Storage URL
        const avatarUrl = userDoc.data().avatarUrl;
        if (avatarUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const fileRef = ref(storage, avatarUrl);
            await deleteObject(fileRef);
          } catch (storageError) {
            // File might not exist, continue anyway
            console.warn('Could not delete avatar file from storage');
          }
        }
      }

      // Remove URL from Firestore
      await updateDoc(userRef, { avatarUrl: null });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete avatar: ${error.message}`);
    }
  },

  /**
   * Retrieves user's avatar URL from Firestore
   */
  async getAvatarUrl(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().avatarUrl || null;
      }
      return null;
    } catch (error) {
      console.warn('Could not retrieve avatar URL:', error.message);
      return null;
    }
  },
};
