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

/**
 * Validates file magic bytes to ensure file type matches declared MIME type
 * Prevents malicious files disguised with wrong extensions
 */
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

export const bannerService = {
  /**
   * Uploads banner through backend to Firebase Storage
   * Bypasses CORS issues by uploading via backend server
   */
  async uploadBanner(uid, file) {
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
      formData.append('banner', file);

      const response = await fetch(`${BACKEND_URL}/api/banner/upload`, {
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
      throw new Error(`Banner upload failed: ${error.message}`);
    }
  },

  /**
   * Updates user's banner URL in Firestore
   */
  async updateBanner(uid, file) {
    try {
      const downloadURL = await this.uploadBanner(uid, file);
      await updateDoc(doc(db, 'users', uid), {
        bannerUrl: downloadURL,
        bannerUpdatedAt: new Date(),
      });
      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to update banner: ${error.message}`);
    }
  },

  /**
   * Deletes banner from Firebase Storage and Firestore
   */
  async deleteBanner(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().bannerUrl) {
        // Delete from Storage if it's a Firebase Storage URL
        const bannerUrl = userDoc.data().bannerUrl;
        if (bannerUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const fileRef = ref(storage, bannerUrl);
            await deleteObject(fileRef);
          } catch (storageError) {
            // File might not exist, continue anyway
            console.warn('Could not delete banner file from storage');
          }
        }
      }

      // Remove URL from Firestore
      await updateDoc(userRef, { bannerUrl: null });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete banner: ${error.message}`);
    }
  },

  /**
   * Retrieves user's banner URL from Firestore
   */
  async getBannerUrl(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().bannerUrl || null;
      }
      return null;
    } catch (error) {
      console.warn('Could not retrieve banner URL:', error.message);
      return null;
    }
  },
};
