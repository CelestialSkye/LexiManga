// Authentication service
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import firestoreService from './firestoreService';

export const authService = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Save additional user data to Firestore
      if (userData) {
        await firestoreService.add('users', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData,
          createdAt: new Date(),
        });
      }

      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async updateUserLanguage(uid, targetLang) {
    try {
      await firestoreService.update('users', uid, { targetLang });
      return true;
    } catch (error) {
      throw error;
    }
  },

  async deleteUserWords(uid) {
    try {
      const wordsRef = collection(db, `users/${uid}/words`);
      const wordsSnapshot = await getDocs(wordsRef);

      if (wordsSnapshot.empty) {
        return true;
      }

      const batch = writeBatch(db);
      wordsSnapshot.docs.forEach((wordDoc) => {
        batch.delete(doc(db, `users/${uid}/words`, wordDoc.id));
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw error;
    }
  },

  async changeLanguageAndResetWords(uid, targetLang) {
    try {
      await this.updateUserLanguage(uid, targetLang);

      await this.deleteUserWords(uid);

      return true;
    } catch (error) {
      throw error;
    }
  },

  async getUserWordCount(uid) {
    try {
      const wordsCollection = await firestoreService.query(`users/${uid}/words`, []);
      return wordsCollection.length;
    } catch (error) {
      throw error;
    }
  },

  async getUserMangaCount(uid) {
    try {
      const mangaCollection = await firestoreService.query(`users/${uid}/mangaStatus`, []);
      return mangaCollection.length;
    } catch {
      throw error;
    }
  },

  async getUserLearnedWords(uid) {
    try {
      const learnedWords = await firestoreService.query(`users/${uid}/words`, [
        { field: 'status', operator: '==', value: 'known' },
      ]);
      return learnedWords.length;
    } catch (error) {
      throw error;
    }
  },

  async getUserUnknownWords(uid) {
    try {
      const unknownWords = await firestoreService.query(`users/${uid}/words`, [
        { field: 'status', operator: '==', value: 'unknown' },
      ]);
      return unknownWords.length;
    } catch (error) {
      throw error;
    }
  },

  async getUserLearningWords(uid) {
    try {
      const learningWords = await firestoreService.query(`users/${uid}/words`, [
        { field: 'status', operator: '==', value: 'learning' },
      ]);
      return learningWords.length;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
