import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert, Modal } from '@mantine/core';
import ActionButton from './ActionButton';
import InfoModal from './InfoModal';
import { useMediaQuery } from '@mantine/hooks';
const defaultBanner = new URL('../assets/defaultBanner.jpg', import.meta.url).href;

const BannerUpload = ({ size = "sm" }) => {
    const { profile, updateBanner } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const isMobile = useMediaQuery('(max-width: 768px)');
    const isDesktop = useMediaQuery('(min-width: 769px)');

    

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setLoading(true);
        setError('');
        try {
            await updateBanner(selectedFile);
            setIsModalOpen(false);
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <>
        <div className="relative">
        {profile?.bannerUrl ? (
    // User's banner - check mobile/desktop
    isMobile ? (
        <img src={profile.bannerUrl} className="w-full h-52 rounded-[16px] object-cover" />
    ) : (
        <img src={profile.bannerUrl} className="w-full h-96 rounded-[16px] object-cover" />
    )
) : (
    // Default banner - check mobile/desktop  
    isMobile ? (
        <img src={defaultBanner} className="w-full h-52 rounded-[16px] object-cover" />
    ) : (
        <img src={defaultBanner} className="w-full h-96 rounded-[16px] object-cover" />
    )
)}
            
            {/* Edit Button */}
            <button 
                onClick={() => {
                    
                    setIsModalOpen(true);
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded text-sm transition-colors z-20"
            >
                Edit
            </button>
        </div>
  
        <Modal 
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Upload Banner"
          centered
          zIndex={1000}
        >
            <div className="p-4">
                <input 
                    id="fileInput"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef} 
                    className="hidden" 
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Choose File
                </button>
                
                {preview && (
                    <div className="mb-4">
                        <img src={preview} alt="Preview" className="w-full h-24 rounded-lg object-cover mx-auto" />
                    </div>
                )}
                
                <ActionButton 
                    onClick={handleUpload} 
                    loading={loading} 
                    disabled={loading || !selectedFile}
                    className="w-full"
                >
                    Upload Banner
                </ActionButton>
                
                {error && <Alert color="red" className="mt-4">{error}</Alert>}
            </div>
        </Modal>
      </>
    );
  };

export default BannerUpload;