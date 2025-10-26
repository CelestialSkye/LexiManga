import { useState, useEffect } from "react";
import { db } from "src/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "src/context/AuthContext";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import TopBar from "@components/TopBar";
import { useMediaQuery } from "@mantine/hooks";

const AccountTab = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  const auth = getAuth(); // ✅ Initialize auth

  const getUserProfile = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("We sent a secure link to your email to change your password.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleDeleteAccount = async() =>{
    const confirmation = window.confirm("Are you sure you want to permanently delete your account?");
    if (!confirmation) return;

    try {
      await deleteDoc(doc(db,"users", uid));
      await deleteUser(auth.currentUser);

      setMessage ("Your account has been permanently deleted.");
      window.location.href="/home";
    }catch (error) {
      setMessage("Error deleting account: " + error.message);
    }
  };

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      const data = await getUserProfile(uid);
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [uid]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    
    <div className="p-4 rounded-[16px] space-y-6">
      <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>
      <div className="bg-white shadow-lg rounded-[12px] p-6">
        <h2 className="text-xl font-bold mb-4">Account</h2>

        <div className="mb-4">
          <p className="text-lg font-medium">Nickname</p>
          <span className="block font-semibold">{profile.nickname}</span>
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium">Email</p>
          <span className="block font-semibold">{profile.email}</span>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">Change Password</h3>
          <button
            onClick={handlePasswordReset}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Password Reset Email
          </button>
          {message && <p className="mt-4">{message}</p>}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-[12px] p-6">
        <h2 className="text-xl font-bold mb-4">Delete Account</h2>
        <p>This is a separate section with its own container.</p>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default AccountTab;
