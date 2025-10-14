import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const BANNER_FOLDER = 'banners';
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

export const bannerService = {
  async uploadBanner(uid, file) {
    if (!file) {
      throw new Error('No file provided');
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 5MB');
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('Invalid file type');
    }
    
    // why use promise man?
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async updateBanner(uid, file) {
    const downloadURL = await this.uploadBanner(uid, file);
    await updateDoc(doc(db, 'users', uid), { bannerUrl: downloadURL });
    return downloadURL;
  },

  async deleteBanner(uid) {
    // For base64, just remove from Firestore
    await updateDoc(doc(db, 'users', uid), { bannerUrl: null });
    return true;
  },

  async getBannerUrl(uid) {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.bannerUrl;
    }
    return null;
  }




};





