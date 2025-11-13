import { Alert, Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import BannerCropModal from './BannerCropModal';
const defaultBanner = new URL('../assets/defaultBanner.jpg', import.meta.url).href;

const BannerUpload = () => {
  const { profile, updateBanner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      // Close the upload modal and open the crop modal
      setIsModalOpen(false);
      setTimeout(() => setIsCropModalOpen(true), 100);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setLoading(true);
    setError('');
    try {
      // Create a File object from the blob
      const croppedFile = new File([croppedBlob], 'banner-cropped.jpg', {
        type: 'image/jpeg',
      });
      await updateBanner(croppedFile);
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    // Now we just need to open the crop modal
    setIsCropModalOpen(true);
  };

  return (
    <>
      {/* 🔵 Banner Display - Size unchanged */}
      <div className='relative'>
        <img
          src={profile?.bannerUrl || defaultBanner}
          className={`w-full ${isMobile ? 'h-52' : 'h-96'} rounded-[16px] object-cover`}
        />

        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className='absolute right-3 bottom-3 z-50 rounded-md bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black'
        >
          Edit Banner
        </button>
      </div>

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Upload New Banner'
        centered
        zIndex={2000}
        overlayProps={{ blur: 6, opacity: 0.5 }}
        radius='lg'
        classNames={{
          title: 'text-xl font-semibold text-gray-800 dark:text-gray-100',
          body: 'p-6 space-y-5',
        }}
      >
        <div className='flex flex-col items-center gap-5'>
          {/* File Selector */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className='relative w-full rounded-xl border-2 border-dashed border-gray-300 py-8 font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            <span className='block'>📁 Click to choose an image</span>
            <span className='mt-1 block text-sm text-gray-400'>Recommended size: 1500×500px</span>
            <input
              id='fileInput'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              ref={fileInputRef}
              className='hidden'
            />
          </button>

          {/* Image Preview */}
          {preview ? (
            <div className='relative w-full'>
              <img
                src={preview}
                alt='Preview'
                className='h-40 w-full rounded-lg border border-gray-200 object-cover shadow-sm dark:border-gray-700'
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = ''; // 🔧 reset input
                }}
                className='absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80'
              >
                Remove
              </button>
            </div>
          ) : (
            <div className='flex h-40 w-full items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400 dark:border-gray-700'>
              No image selected
            </div>
          )}

          {/* File Details */}
          {selectedFile && (
            <p className='text-center text-sm text-gray-500'>
              {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}

          {/* Error Message */}
          {error && <Alert color='red'>{error}</Alert>}

          {/* Upload Button */}
          <ActionButton
            onClick={handleUpload}
            loading={loading}
            disabled={!selectedFile}
            radius={12}
            className='w-full px-6 py-3 text-base'
          >
            Crop & Upload
          </ActionButton>
        </div>
      </Modal>

      {/* Crop Modal */}
      <BannerCropModal
        opened={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={preview}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default BannerUpload;
