import { useQuery } from '@tanstack/react-query';
import { db } from 'src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from 'src/context/AuthContext';
import { FaTableList } from 'react-icons/fa6';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import TopBar from 'src/components/TopBar';
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
  const isMobile = useMediaQuery('(max-width: 1023px)');
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

  if (isLoading) return <p className='py-8 text-center'>Loading...</p>;
  if (!profile) return <p className='py-8 text-center'>No profile found</p>;

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <TopBar />
      <div className='mx-auto w-full flex-1 px-4 pt-8 pb-8 lg:w-[85%] lg:max-w-7xl'>
        <div className='flex flex-col gap-8 lg:flex-row'>
          {/* Desktop Sidebar Navigation */}
          <div className='hidden flex-shrink-0 lg:flex lg:w-64'>
            <div className='h-fit w-full overflow-y-auto rounded-[16px] border border-gray-200 bg-white shadow-lg'>
              <div className='flex w-full flex-col gap-2 p-6'>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-4 py-3 text-left font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className='w-full lg:flex-1'>
            <div className={`w-full`}>
              {/* Mobile Header with Dropdown */}
              <div className='mb-8 lg:hidden'>
                <div className='mb-4 flex items-center justify-between'>
                  <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='rounded-lg p-2 transition-colors hover:bg-gray-200'
                  >
                    <FaTableList size={24} className='text-gray-700' />
                  </button>
                </div>

                {/* Mobile Dropdown */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className='space-y-2 border-t border-gray-200 pt-3'>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsOpen(false);
                        }}
                        className={`w-full rounded-lg px-4 py-2.5 text-left font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className=''>
                {activeTab === 'account' && <AccountTab />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'language' && <LanguageTab />}
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default Settings;
