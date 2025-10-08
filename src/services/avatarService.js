import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AVATAR_FOLDER = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

export const avatarService = {
  async uploadAvatar(uid, file) {
    if (!file) {
      throw new Error('No file provided');
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 5MB');
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('Invalid file type');
    }
    
    // Convert file to base64 (temporary workaround)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async updateAvatar(uid, file) {
    const downloadURL = await this.uploadAvatar(uid, file);
    await updateDoc(doc(db, 'users', uid), { avatarUrl: downloadURL });
    return downloadURL;
  },

  async deleteAvatar(uid) {
    // For base64, just remove from Firestore
    await updateDoc(doc(db, 'users', uid), { avatarUrl: null });
    return true;
  },

  async getAvatarUrl(uid) {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.avatarUrl;
    }
    return null;
  }




};





