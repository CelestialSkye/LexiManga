
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);


     // Register 
  const register = async (email, password, nickname, nativeLang, targetLang) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: nickname });

      // save more fields in the db
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        nickname,
        nativeLang,
        targetLang,
        createdAt: new Date().toISOString(),
      });

      setUser(newUser);
      setProfile({ nickname, nativeLang, targetLang });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

    //Login
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    //Logout
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setProfile(null);
    };


    //Keep track of user state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
    
            // Fetch Firestore profile
            const docSnap = await getDoc(doc(db, "users", currentUser.uid));
            if (docSnap.exists()) {
              setProfile(docSnap.data());
            }
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });
    
        return () => unsubscribe();
      }, []);

    const value = {
        login,
        register,
        logout,
        user,
        profile,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
    );
};
