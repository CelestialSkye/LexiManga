// Firestore service for database operations
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

// Generic CRUD operations
export const firestoreService = {
  // Get all documents from a collection
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Get a single document by ID
  async getById(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Add a new document
  async add(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // Update an existing document
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return {
        id: docId,
        ...data,
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Query documents with filters
  async query(collectionName, filters = [], orderByField = null, limitCount = null) {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = [];

      // Apply filters
      filters.forEach((filter) => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        constraints.push(orderBy(orderByField));
      }

      // Apply limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },

  // Real-time listener for a collection
  subscribeToCollection(collectionName, callback) {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documents);
    });
  },

  // Real-time listener for a single document
  subscribeToDocument(collectionName, docId, callback) {
    return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
      if (docSnap.exists()) {
        callback({
          id: docSnap.id,
          ...docSnap.data(),
        });
      } else {
        callback(null);
      }
    });
  },
};

export default firestoreService;
