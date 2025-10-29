import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Alert } from '@mantine/core';
import ActionButton from './ActionButton';
import { useMediaQuery } from '@mantine/hooks';
const defaultBanner = new URL('../assets/defaultBanner.jpg', import.meta.url).href;

const BannerUpload = () => {
  const { profile, updateBanner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

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
      {/* 🔵 Banner Display - Size unchanged */}
      <div className="relative">
        <img
          src={profile?.bannerUrl || defaultBanner}
          className={`w-full ${isMobile ? 'h-52' : 'h-96'} rounded-[16px] object-cover`}
        />

        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-3 right-3 bg-black/60 text-white px-4 py-2 rounded-md text-sm backdrop-blur-sm hover:bg-black/80 transition"
        >
          Edit Banner
        </button>
      </div>

      {/* 🔵 Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Banner"
        centered
        zIndex={2000}
        overlayProps={{ blur: 3, opacity: 0.4 }}
      >
        <div className="space-y-4">
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
            className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Select Image
          </button>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
          )}

         <div className="flex justify-center mt-4">
  <ActionButton
    onClick={handleUpload}
    loading={loading}
    disabled={!selectedFile}
    className="px-6" 
  >
    Upload Banner
  </ActionButton>
</div>
          {error && <Alert color="red">{error}</Alert>}
        </div>
      </Modal>
    </>
  );
};

export default BannerUpload;
