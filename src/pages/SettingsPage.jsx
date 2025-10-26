import { useQuery } from '@tanstack/react-query';
import { db } from "src/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from 'src/context/AuthContext';
import { FaTableList } from "react-icons/fa6";
import { useState } from 'react';
import AccountTab from 'src/features/Settings/tabs/AccountTab';
import LanguageTab from 'src/features/Settings/tabs/LanguageTab';
import SettingsTab from 'src/features/Settings/tabs/SettingsTab';

const getUserProfile = async (uid) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

const Settings = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); 

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'settings', label: 'Settings' },
    { id: 'language', label: 'Language' },
  ];

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getUserProfile(uid),
    enabled: !!uid,
  });

  if (isLoading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    <div className='p-6 mt-5'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='text-[1.5em] ml-2'>Settings</div>
        <button className='mr-2' onClick={() => setIsOpen(!isOpen)}>
          <FaTableList size={28} />
        </button>
      </div>

      {/* Dropdown */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-300 pt-2">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded"
              onClick={() => {
                setActiveTab(tab.id);  
                setIsOpen(false);      
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className=''>
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'language' && <LanguageTab />}
      </div>
    </div>
  );
};

export default Settings;
