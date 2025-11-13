import { Alert, Modal } from '@mantine/core';
import { useRef, useState } from 'react';

import defaultAvatar from '../assets/defaultAvatar.jpg';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import AvatarCropModal from './AvatarCropModal';

const AvatarUpload = () => {
  const { profile, updateAvatar } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const avatar = profile?.avatarUrl || defaultAvatar;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setLoading(true);
    setError('');

    try {
      // Create a File object from the blob
      const croppedFile = new File([croppedBlob], 'avatar-cropped.jpg', {
        type: 'image/jpeg',
      });
      await updateAvatar(croppedFile);
      setIsModalOpen(false);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    // Now we just need to open the crop modal
    setIsCropModalOpen(true);
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Avatar Display */}
      <div
        onClick={() => setIsModalOpen(true)}
        className='h-24 w-24 cursor-pointer overflow-hidden rounded-[16px] border border-gray-200 transition-transform hover:scale-105 hover:shadow-lg md:h-48 md:w-48 dark:border-gray-700'
      >
        <img src={avatar} alt='Avatar' className='h-full w-full object-cover' />
      </div>

      {/* Avatar Upload Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Upload New Avatar'
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
            className='relative w-full rounded-[16px] border-2 border-dashed border-gray-300 py-8 font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            <span className='block'>📁 Click to choose an image</span>
            <span className='mt-1 block text-sm text-gray-400'>Recommended size: 400×400px</span>
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
            <div className='relative h-40 w-40'>
              <img
                src={preview}
                alt='Preview'
                className='h-full w-full rounded-[16px] border border-gray-200 object-cover shadow-sm dark:border-gray-700'
              />
              <button
                onClick={handleRemove}
                className='absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80'
              >
                Remove
              </button>
            </div>
          ) : (
            <div className='flex h-40 w-40 items-center justify-center rounded-[16px] border border-gray-200 text-sm text-gray-400 dark:border-gray-700'>
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
      <AvatarCropModal
        opened={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={preview}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default AvatarUpload;
