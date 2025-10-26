import TopBar from "@components/TopBar";
import { useMediaQuery } from "@mantine/hooks";
import { MdDarkMode } from "react-icons/md";


const SettingsTab = () => {

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

   return (
    
    <div className="p-4 rounded-[16px] space-y-6">
      <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>
      <div className="bg-white shadow-lg rounded-[12px] p-6">
        <button><MdDarkMode /></button>
        
      </div>
    </div>
  );
};

export default SettingsTab;
