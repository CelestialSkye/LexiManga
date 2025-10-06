import SpotlightSearch from './SpotlightSearch';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {IconLogout, IconMenu2, IconUser, IconHome, IconSearch} from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';
const MobileFAB = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div className={`absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl p-1 w-[192px] transition-all duration-300 ease-in-out grid grid-cols-3 gap-0 ${isExpanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-5 pointer-events-none'}`}>
                
                {/* Home Button */}
                <div>
                    <button 
                        className="w-full h-12 bg-white rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-200 group"
                        onClick={() => {
                            navigate('/home');
                            setIsExpanded(false);
                        }}
                    >
                        <IconHome size={20} className="text-gray-600 group-hover:text-violet-600 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 group-hover:text-violet-600 transition-colors duration-200">Home</span>
                    </button>
                </div>



                {/* Search Button */}
                <div>
                    <button 
                        className="w-full h-12 bg-white rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-200 group"
                        onClick={() => {
                            spotlight.open();
                        }}
                    >
                        <IconSearch size={20} className="text-gray-600 group-hover:text-violet-600 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 group-hover:text-violet-600 transition-colors duration-200">Search</span>
                    </button>
                </div>

                {/* Profile Button */}
                <div>
                    <button 
                        className="w-full h-12 bg-white rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-200 group"
                        onClick={() => {
                            navigate('/profilepage');
                            setIsExpanded(false);
                        }}
                    >
                        <IconUser size={20} className="text-gray-600 group-hover:text-violet-600 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 group-hover:text-violet-600 transition-colors duration-200">Profile</span>
                    </button>
                </div>

                {/* Logout Button */}
                <div>
                    <button 
                        className="w-full h-12 bg-white rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-200 group"
                        onClick={() => {
                            logout();
                            setIsExpanded(false);
                        }}
                    >
                        <IconLogout size={20} className="text-gray-600 group-hover:text-violet-600 transition-colors duration-200" />
                        <span className="text-xs text-gray-700 group-hover:text-violet-600 transition-colors duration-200">Home</span>
                    </button>
                </div>


            </div>
            <button
                onClick={toggleExpanded}
                className="w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center transition-all duration-200">
                <IconMenu2 size={28} stroke={2} className="text-gray-500 hover:text-purple-600 transition-colors duration-200" />
            </button>
        </div>
    );
};

export default MobileFAB;