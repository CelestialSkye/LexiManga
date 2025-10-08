import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert, Modal } from '@mantine/core';
import ActionButton from './ActionButton';
import InfoModal from './InfoModal';
import defaultAvatar from '../assets/defaultAvatar.jpg';

const AvatarUpload = ({ size = "sm" }) => {
    const { profile, updateAvatar } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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
            await updateAvatar(selectedFile);
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
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
            {profile?.avatarUrl ? (
                <img 
                    src={profile.avatarUrl} 
                    alt="User Avatar" 
                    className={`${size === "lg" ? "w-48 h-48" : "w-10 h-10"} rounded-[16px] object-cover`} 
                />
            ) : (
                <img 
                    src={defaultAvatar} 
                    alt="Default Avatar" 
                    className={`${size === "lg" ? "w-48 h-48" : "w-10 h-10"} rounded-[16px] object-cover`} 
                />
            )}
        </div>
  
        <Modal 
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Upload Avatar"
          centered
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
                        <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto" />
                    </div>
                )}
                
                <ActionButton 
                    onClick={handleUpload} 
                    loading={loading} 
                    disabled={loading || !selectedFile}
                    className="w-full"
                >
                    Upload Avatar
                </ActionButton>
                
                {error && <Alert color="red" className="mt-4">{error}</Alert>}
            </div>
        </Modal>
      </>
    );
  };

export default AvatarUpload;