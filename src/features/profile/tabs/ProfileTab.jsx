import { useQuery } from '@tanstack/react-query';
import { db } from "src/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from 'src/context/AuthContext';

const getUserProfile = async (uid) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

const ProfileTab = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getUserProfile(uid),
    enabled: !!uid,
  });

  if (isLoading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    <div className="p-2 pb-4 rounded-[16px]">
      <h2 className="text-xl font-bold mb-6">Profile Overview</h2>
      <h1>{profile.nickname}</h1>
    </div>
  );
};

export default ProfileTab;
